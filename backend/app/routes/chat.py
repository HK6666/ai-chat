import json
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db, async_session
from app.models import Conversation, Message
from app.config import settings

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat")
async def chat(data: dict, db: AsyncSession = Depends(get_db)):
    """SSE streaming chat endpoint"""
    user_message = data.get("message", "").strip()
    conversation_id = data.get("conversation_id")
    system_prompt = data.get("system_prompt", "")

    if not user_message:
        raise HTTPException(status_code=400, detail="消息不能为空")

    # Get or create conversation
    if conversation_id:
        conv = await db.get(Conversation, conversation_id)
        if not conv:
            raise HTTPException(status_code=404, detail="会话不存在")
    else:
        conv = Conversation(title="新对话", system_prompt=system_prompt or "")
        db.add(conv)
        await db.flush()
        conversation_id = conv.id

    # Save user message
    user_msg = Message(conversation_id=conversation_id, role="user", content=user_message)
    db.add(user_msg)
    await db.commit()

    # Load conversation history
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    history = result.scalars().all()

    # Build messages for API — conversation-level prompt takes priority
    messages = []
    prompt = conv.system_prompt or settings.SYSTEM_PROMPT
    if prompt:
        messages.append({"role": "system", "content": prompt})
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})

    async def generate():
        full_response = ""
        full_thinking = ""
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream(
                    "POST",
                    f"{settings.OPENAI_API_BASE}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.OPENAI_MODEL,
                        "messages": messages,
                        "stream": True,
                    },
                ) as response:
                    # Send conversation_id first (for new conversations)
                    yield f"data: {json.dumps({'conversation_id': conversation_id})}\n\n"

                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            choices = chunk.get("choices", [])
                            if not choices:
                                continue
                            delta = choices[0].get("delta", {})

                            # Handle thinking/reasoning tokens
                            thinking = delta.get("reasoning_content") or delta.get("thinking") or ""
                            if thinking:
                                full_thinking += thinking
                                yield f"data: {json.dumps({'thinking': thinking})}\n\n"

                            # Handle content tokens
                            token = delta.get("content", "")
                            if token:
                                full_response += token
                                yield f"data: {json.dumps({'token': token})}\n\n"
                        except (json.JSONDecodeError, IndexError, KeyError):
                            continue
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

        # Save assistant message to DB
        async with async_session() as save_db:
            assistant_msg = Message(
                conversation_id=conversation_id,
                role="assistant",
                content=full_response,
            )
            save_db.add(assistant_msg)
            await save_db.commit()

            # Auto-generate title if it's still "新对话"
            conv = await save_db.get(Conversation, conversation_id)
            if conv and conv.title == "新对话" and full_response:
                try:
                    await _generate_title(save_db, conv, user_message)
                except Exception:
                    pass

        yield f"data: {json.dumps({'done': True, 'conversation_id': conversation_id})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


async def _generate_title(db: AsyncSession, conv: Conversation, user_message: str):
    """Use AI to generate a short title for the conversation"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{settings.OPENAI_API_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.OPENAI_MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": "请用5个字以内概括以下对话的主题，只输出标题，不要标点符号。",
                    },
                    {"role": "user", "content": user_message},
                ],
                "max_tokens": 20,
                "stream": False,
            },
        )
        if response.status_code == 200:
            data = response.json()
            title = data["choices"][0]["message"]["content"].strip()
            if title:
                conv.title = title[:20]  # Max 20 chars
                conv.updated_at = datetime.now(timezone.utc)
                await db.commit()
