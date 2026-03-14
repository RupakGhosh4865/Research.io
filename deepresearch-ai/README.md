# 🔬 DeepResearch AI: Autonomous Multi-Agent Synthesis

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg?style=for-the-badge&logo=python)](https://www.python.org/)
[![Next.js 14](https://img.shields.io/badge/next.js-14-black.svg?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-orange.svg?style=for-the-badge)](https://langchain-ai.github.io/langgraph/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**DeepResearch AI** is a production-grade, multi-agent autonomous system designed to synthesize reality into publishable research reports. Unlike simple chat interfaces, DeepResearch AI orchestrates a swarm of specialized agents that collaborate, search in parallel, and critique each other's work through an automated feedback loop.

---

## 🏗 System Architecture & Agent Swarm

The system is built on a custom **LangGraph** state machine that manages long-running research sessions with persistence and human-in-the-loop capabilities.

### 🧩 The Agent Roster

1.  **🧠 The Planner (Architect)**
    *   **Role**: Analyzes the initial query and breaks it down into a comprehensive multi-step research strategy.
    *   **Complexity**: Uses logic-chaining to identify sub-queries. It produces a "Research Plan" that must be approved by the user (Human-in-the-Loop) before execution.
2.  **🛰 Search Coordinator (Orchestrator)**
    *   **Role**: Takes the approved plan and dynamically spawns multiple parallel search workers using the LangGraph `Send()` API.
    *   **Complexity**: Manages concurrency and aggregates findings from disparate sources without bottlenecks.
3.  **🔍 Search Agents (Information Harvesters)**
    *   **Role**: Perform targeted web searches, scrape relevant content, and extract key data points.
    *   **Technology**: Integrated with Tavily/Google for high-signal retrieval.
4.  **📚 RAG Engine (Contextual Injection)**
    *   **Role**: If the user uploads documents (PDFs), this agent vectorizes them (using embeddings) and injects highly relevant local context into the research stream.
5.  **✍️ The Writer (Synthesizer)**
    *   **Role**: Combines search results, RAG context, and the original plan into a high-quality, academic-grade report (2500+ words).
    *   **Model**: Powered by **Llama 3.3 70B** on Groq for lightning-fast, high-reasoning synthesis.
    *   **Citations**: Automatically manages numbered citations and bibliography.
6.  **⚖️ The Critic (Quality Assurance)**
    *   **Role**: Evaluates the draft report against a strict rubric (Score 0-10).
    *   **The Loop**: If the score is < 7, the Critic issues a `revise` status with specific weaknesses. The Writer then re-drafts the report until it meets the standard.

---

## 🚀 Technical Complexity: What Makes It Different?

### 1. Parallel Neural Pipeline
Most AI tools execute linearly. DeepResearch AI uses **Graph-based Parallelism**. It can research "The History of AI", "The Ethics of AI", and "Future Projections" simultaneously, merging the context later.

### 2. State-Persistence & Checkpointing
Using `AsyncPostgresSaver`, the system saves every single thought of every agent. If the server restarts or if the user leaves the page, the research can resume exactly where it left off without losing progress.

### 3. Real-Time Token-Streaming via Redis
We implement a hybrid **Pub/Sub + SSE (Server-Sent Events)** architecture.
- **Backend**: Agents publish events to Redis channels.
- **Worker**: Processes agents and updates the graph.
- **FastAPI**: Listens to Redis and streams status/content to the UI in real-time.

### 4. Human-In-The-Loop (HITL)
The transition from *Planning* to *Searching* is gated. This prevents wasted tokens/credits by allowing the human to "steer" the agent's strategy before it starts the heavy lifting.

---

## 🛠 Tech Stack Specifications

### Core Engine
- **Framework**: FastAPI (Asynchronous Python)
- **Orchestration**: LangGraph (Cyclic Directed Acyclic Graphs)
- **State Management**: PostgreSQL with `langgraph-checkpoint-postgres`
- **Background Tasks**: Celery + Redis

### Intelligence Layer
- **LLMs**: Llama 3.3 70B (Groq), GPT-4o
- **Search API**: Tavily AI / Google Search
- **Embeddings**: OpenAI `text-embedding-3-small` / HuggingFace

### Futuristic Frontend
- **UI Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom Glassmorphism System
- **Real-time**: EventSource (SSE) for agent live-feeds
- **Visuals**: Framer Motion for neural network animations

---

## 🔧 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker-Compose
- PostgreSQL (or Supabase)
- Redis

### Backend Setup
1. `cd backend && python -m venv venv`
2. `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
3. `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and fill in your API keys (Groq, Tavily, Postgres, Redis).
5. `docker-compose up -d redis` (if running locally)
6. `alembic upgrade head`
7. `python main.py`

### Frontend Setup
1. `cd frontend && npm install`
2. Copy `.env.local` from `.env.example`.
3. `npm run dev`

---

## 📈 Roadmap & Future Specs
- [ ] **Multi-Model Voting**: Have multiple critics vote on report quality.
- [ ] **Autonomous Web Interaction**: Agents that can log into sites and perform complex navigation.
- [ ] **Export to LaTeX**: Direct academic submission formatting.

---

## 📄 License
DeepResearch AI is released under the MIT License. Synthesize responsibly.
