# Execution Plan — Family Chat AI Web App

## Wave 1: Foundation (parallel)

### task-1: Backend foundation
- **Role:** coder
- **Dependencies:** (none)
- **Files:** backend/app/config.py, backend/app/database.py, backend/app/models.py, backend/requirements.txt
- **Action:** Create FastAPI backend foundation:
  - config.py: Pydantic Settings loading from .env (OPENAI_API_BASE, OPENAI_API_KEY, OPENAI_MODEL, SYSTEM_PROMPT, APP_PASSWORD)
  - database.py: SQLAlchemy async setup with SQLite (aiosqlite)
  - models.py: Conversation (id, title, created_at, updated_at) and Message (id, conversation_id FK, role, content, created_at) models
  - requirements.txt: fastapi, uvicorn, sqlalchemy, aiosqlite, httpx, python-dotenv, pydantic-settings
- **Verify:** cd /c/Users/11421/Desktop/family-chat/backend && python -c "from app.config import settings; from app.models import Conversation, Message; print('OK')"
- **Done:** Models and config importable without errors

### task-2: Frontend scaffold
- **Role:** coder
- **Dependencies:** (none)
- **Files:** frontend/package.json, frontend/vite.config.ts, frontend/tailwind.config.js, frontend/src/main.tsx, frontend/src/App.tsx, frontend/src/index.css, frontend/index.html, frontend/tsconfig.json, frontend/tsconfig.app.json, frontend/postcss.config.js
- **Action:** Create React + Vite + Tailwind project:
  - package.json with deps: react, react-dom, react-markdown, rehype-highlight, remark-gfm, highlight.js, tailwindcss, postcss, autoprefixer, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react
  - vite.config.ts with proxy /api → localhost:8000
  - tailwind.config.js with custom dark theme colors (bg: #0f0f23, card: #1a1a2e, primary: indigo #6366f1)
  - index.css with Tailwind directives + custom scrollbar + animation keyframes
  - App.tsx: basic shell with dark bg
  - tsconfig files for Vite React
  - Run npm install after creating files
- **Verify:** cd /c/Users/11421/Desktop/family-chat/frontend && npx tsc --noEmit
- **Done:** TypeScript compiles, deps installed

### task-3: Project config files
- **Role:** coder
- **Dependencies:** (none)
- **Files:** .env.example, .gitignore, docker-compose.yml, backend/Dockerfile, frontend/Dockerfile, docker/nginx.conf
- **Action:** Create project-level config:
  - .env.example with all config vars
  - .gitignore (node_modules, __pycache__, .env, dist, *.db, venv)
  - docker-compose.yml: frontend(nginx:3000) + backend(uvicorn:8000), shared .env
  - backend/Dockerfile: python:3.11-slim, pip install, uvicorn
  - frontend/Dockerfile: node build + nginx
  - docker/nginx.conf: serve frontend + proxy /api → backend:8000
- **Verify:** cat /c/Users/11421/Desktop/family-chat/docker-compose.yml
- **Done:** All config files created

## Wave 2: Backend API (parallel)

### task-4: Backend API routes
- **Role:** coder
- **Dependencies:** task-1
- **Files:** backend/app/main.py, backend/app/routes/conversations.py, backend/app/routes/auth.py, backend/app/routes/__init__.py
- **Action:** Implement FastAPI routes:
  - main.py: FastAPI app, CORS, startup event to create tables, include routers
  - auth.py: POST /api/auth/verify — check password against settings.APP_PASSWORD, return {required: bool, valid: bool}
  - conversations.py: Full CRUD:
    - GET /api/conversations — list all, ordered by updated_at desc
    - POST /api/conversations — create with optional title
    - GET /api/conversations/{id} — get with all messages
    - PUT /api/conversations/{id} — update title
    - DELETE /api/conversations/{id} — cascade delete messages
- **Verify:** cd /c/Users/11421/Desktop/family-chat/backend && python -c "from app.main import app; print('Routes:', [r.path for r in app.routes])"
- **Done:** All REST endpoints defined and importable

### task-5: Chat SSE endpoint
- **Role:** coder
- **Dependencies:** task-1
- **Files:** backend/app/routes/chat.py
- **Action:** Implement SSE streaming chat:
  - POST /api/chat with body {conversation_id, message}
  - Save user message to DB
  - If no conversation_id, create new conversation
  - Load conversation history from DB
  - Call OpenAI-compatible API via httpx streaming (POST to {OPENAI_API_BASE}/chat/completions)
  - Stream response tokens as SSE events: data: {token: "...", done: false}
  - On completion: save assistant message to DB, send done event with {done: true, conversation_id, message_id}
  - Auto-generate title: if conversation has no title (or default), after first assistant response, make a separate non-streaming API call asking AI to generate a 5-char title, update conversation
  - SSE format: "data: {json}\n\n"
- **Verify:** cd /c/Users/11421/Desktop/family-chat/backend && python -c "from app.routes.chat import router; print('OK')"
- **Done:** Chat endpoint with SSE streaming implemented

## Wave 3: Frontend UI (parallel)

### task-6: Sidebar component
- **Role:** coder
- **Dependencies:** task-2
- **Files:** frontend/src/components/Sidebar.tsx, frontend/src/api/client.ts, frontend/src/types.ts
- **Action:** Create:
  - types.ts: Conversation, Message interfaces
  - client.ts: API client (fetch wrapper) with functions: getConversations, createConversation, deleteConversation, renameConversation, verifyPassword
  - Sidebar.tsx:
    - Dark themed sidebar (260px, bg-[#1a1a2e])
    - "新建对话" button at top with + icon
    - Conversation list grouped by date (今天/昨天/近7天/更早)
    - Each item: title, hover shows rename/delete icons
    - Active conversation highlighted with indigo
    - Rename: inline edit on double-click
    - Delete: with confirm
    - Mobile: overlay mode with backdrop, hamburger toggle
    - Collapse button for desktop
- **Verify:** cd /c/Users/11421/Desktop/family-chat/frontend && npx tsc --noEmit
- **Done:** Sidebar renders with conversation list

### task-7: Chat area components
- **Role:** coder
- **Dependencies:** task-2
- **Files:** frontend/src/components/ChatArea.tsx, frontend/src/components/MessageBubble.tsx, frontend/src/components/MarkdownRenderer.tsx, frontend/src/components/InputBar.tsx
- **Action:** Create chat UI components:
  - MarkdownRenderer.tsx: react-markdown + rehype-highlight + remark-gfm, dark theme code blocks, prose styling
  - MessageBubble.tsx:
    - User: right-aligned, indigo bg, white text
    - Assistant: left-aligned, transparent bg, with avatar icon, Markdown rendered
    - Fade-in animation on appear
    - Timestamp on hover
  - InputBar.tsx:
    - Fixed bottom, dark card bg
    - Textarea: auto-grow, Shift+Enter newline, Enter send
    - Send button (indigo), disabled while streaming
    - Stop button during streaming
  - ChatArea.tsx:
    - Message list with auto-scroll to bottom
    - Empty state with welcome message
    - Loading indicator during streaming
    - Receives messages array + onSend callback
- **Verify:** cd /c/Users/11421/Desktop/family-chat/frontend && npx tsc --noEmit
- **Done:** All chat components render correctly

## Wave 4: Integration

### task-8: Full app integration
- **Role:** coder
- **Dependencies:** task-4, task-5, task-6, task-7
- **Files:** frontend/src/App.tsx, frontend/src/api/chat.ts, frontend/src/components/PasswordGate.tsx
- **Action:** Wire everything together:
  - chat.ts: SSE streaming function using fetch + ReadableStream, parse "data: {json}" events, call onToken callback for each token
  - PasswordGate.tsx: Simple password input page, check against /api/auth/verify, store in localStorage
  - App.tsx:
    - State: conversations[], activeConversationId, messages[], isStreaming
    - On mount: check password if needed, load conversations
    - Select conversation → load messages
    - New conversation → create via API, add to list
    - Send message → call chat SSE, append tokens to streaming message, on done update conversation list (title may have changed)
    - Delete/rename → call API, update state
    - Layout: Sidebar + ChatArea, responsive
    - Mobile hamburger menu
- **Verify:** cd /c/Users/11421/Desktop/family-chat/frontend && npx tsc --noEmit && npm run build
- **Done:** Full app compiles and builds, all features wired

## Wave 5: Polish

### task-9: Review and polish
- **Role:** reviewer
- **Dependencies:** task-8
- **Files:** all
- **Action:** Review entire codebase for:
  - Spec compliance: all features from requirements
  - UI polish: animations, transitions, responsive
  - Error handling: network errors, API failures, empty states
  - Code quality: no console.logs, proper types, clean imports
  - Fix any issues found
- **Verify:** cd /c/Users/11421/Desktop/family-chat/frontend && npm run build
- **Done:** App builds cleanly, all features working
