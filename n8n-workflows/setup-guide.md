# n8n Study App — Workflow Setup Guide

## Overview

This package contains **4 importable n8n workflow JSON files** that power a full-stack AI study assistant:

| # | Workflow File | Webhook Endpoint | Description |
|---|---|---|---|
| 1 | `01-file-processing.json` | `POST /process-file` | Upload → extract text → chunk → embed → store in Supabase |
| 2 | `02-quiz-feedback.json` | `POST /generate-quiz`, `POST /evaluate-quiz` | Generate quizzes, evaluate answers, gap analysis |
| 3 | `03-flashcard-generation.json` | `POST /generate-flashcards` | Extract topics → generate Q&A flashcard pairs |
| 4 | `04-cross-file-linking.json` | `POST /cross-link` | Multi-file retrieval → entity linking → complementary insights |

---

## Prerequisites

### 1. n8n Instance

Run n8n locally via Docker or npm:

```bash
# Docker (recommended)
docker run -it --rm --name n8n -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n

# Or via npm
npx n8n
```

Access at: `http://localhost:5678`

---

### 2. API Keys (All Free Tier)

#### Groq (LLM Inference)
1. Sign up at [console.groq.com](https://console.groq.com/)
2. Create an API key
3. Model used: `llama-3.3-70b-versatile`
4. Endpoint: `https://api.groq.com/openai/v1/chat/completions`

#### Hugging Face (Embeddings)
1. Sign up at [huggingface.co](https://huggingface.co/)
2. Go to Settings → Access Tokens → Create token (read)
3. Model used: `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions)
4. Endpoint: `https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2`

#### Supabase (Vector Database)
1. Create project at [supabase.com](https://supabase.com/)
2. Note your **Project URL** and **anon/service_role key**
3. Run the SQL migrations below

---

### 3. Supabase Database Setup

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Main documents table for storing file chunks with embeddings
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,          -- 'pdf', 'youtube', 'rss', 'web'
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(384),            -- 384 dims for all-MiniLM-L6-v2
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast vector similarity search
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- Index for filtering by user/file
CREATE INDEX idx_documents_user ON documents (user_id);
CREATE INDEX idx_documents_file ON documents (file_id);
CREATE INDEX idx_documents_user_file ON documents (user_id, file_id);

-- Quiz results table for tracking performance
CREATE TABLE quiz_results (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_id TEXT,
  difficulty TEXT NOT NULL,          -- 'easy', 'medium', 'hard'
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  questions JSONB NOT NULL,
  answers JSONB NOT NULL,
  gap_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_user ON quiz_results (user_id);

-- Flashcards table
CREATE TABLE flashcards (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  topic TEXT,
  difficulty TEXT DEFAULT 'medium',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flashcards_user ON flashcards (user_id);
CREATE INDEX idx_flashcards_file ON flashcards (file_id);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(384),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  filter_user_id TEXT DEFAULT NULL,
  filter_file_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  file_id TEXT,
  file_name TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.file_id,
    d.file_name,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE
    (filter_user_id IS NULL OR d.user_id = filter_user_id)
    AND (filter_file_id IS NULL OR d.file_id = filter_file_id)
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Cross-file search function (searches across ALL files for a user)
CREATE OR REPLACE FUNCTION cross_file_search(
  query_embedding VECTOR(384),
  p_user_id TEXT,
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  id BIGINT,
  file_id TEXT,
  file_name TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.file_id,
    d.file_name,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE
    d.user_id = p_user_id
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

### 4. n8n Credentials Setup

In n8n, create the following credentials:

| Credential Name | Type | Fields |
|---|---|---|
| `Groq API` | Header Auth | Name: `Authorization`, Value: `Bearer YOUR_GROQ_KEY` |
| `HuggingFace API` | Header Auth | Name: `Authorization`, Value: `Bearer YOUR_HF_TOKEN` |
| `Supabase API` | Header Auth | Name: `apikey`, Value: `YOUR_SUPABASE_ANON_KEY` |

Also set these as **environment variables** or hard-code in nodes:
- `SUPABASE_URL` → your Supabase project URL (e.g., `https://xyzxyz.supabase.co`)
- `SUPABASE_KEY` → your Supabase anon key

---

## How to Import Workflows

1. Open n8n at `http://localhost:5678`
2. Click **"Add workflow"** → **"Import from file"**
3. Select one of the `.json` files from this folder
4. Update credential references in each node
5. Replace placeholder URLs (`YOUR_SUPABASE_URL`) with your actual URLs
6. Activate the workflow

---

## Webhook Endpoints (Frontend Integration)

Once workflows are active, your frontend can call these endpoints:

### Base URL
```
http://localhost:5678/webhook
```
(For test mode: `http://localhost:5678/webhook-test`)

### 1. Process File
```http
POST /webhook/process-file
Content-Type: application/json

{
  "user_id": "user123",
  "file_id": "file_abc",
  "file_name": "lecture-notes.pdf",
  "file_type": "pdf",
  "source_url": "https://example.com/file.pdf",
  "content": "Raw text content if pre-extracted..."
}
```
- `file_type`: `"pdf"`, `"youtube"`, `"rss"`, `"web"`
- For YouTube: pass the video URL in `source_url`
- For RSS/Web: pass the feed/page URL in `source_url`
- For PDF: pass either a URL to download or pre-extracted text in `content`

### 2. Generate Quiz
```http
POST /webhook/generate-quiz
Content-Type: application/json

{
  "user_id": "user123",
  "file_id": "file_abc",
  "difficulty": "medium",
  "num_questions": 5,
  "topic_focus": "optional specific topic"
}
```

### 3. Evaluate Quiz
```http
POST /webhook/evaluate-quiz
Content-Type: application/json

{
  "user_id": "user123",
  "file_id": "file_abc",
  "questions": [...],
  "user_answers": [...]
}
```

### 4. Generate Flashcards
```http
POST /webhook/generate-flashcards
Content-Type: application/json

{
  "user_id": "user123",
  "file_id": "file_abc",
  "num_cards": 10,
  "focus_topics": ["optional", "topic", "list"]
}
```

### 5. Cross-File Linking
```http
POST /webhook/cross-link
Content-Type: application/json

{
  "user_id": "user123",
  "query": "How does photosynthesis relate to cellular respiration?"
}
```

---

## Architecture Diagram

```
Frontend (Any SPA/App)
    │
    ├─ POST /process-file ──────► [Workflow 1] ──► Supabase Vector DB
    │
    ├─ POST /generate-quiz ─────► [Workflow 2] ──► Groq LLM ──► Quiz JSON
    ├─ POST /evaluate-quiz ─────► [Workflow 2] ──► Groq LLM ──► Gap Analysis
    │
    ├─ POST /generate-flashcards ► [Workflow 3] ──► Groq LLM ──► Flashcards
    │
    └─ POST /cross-link ────────► [Workflow 4] ──► Multi-file Search ──► Insights
```

**Free APIs Used:**
- **Groq** — Fast LLM inference (Llama 3.3 70B)
- **Hugging Face** — Free embedding API (all-MiniLM-L6-v2, 384d)
- **Supabase** — Free tier PostgreSQL + pgvector

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Webhook returns 404 | Ensure workflow is **activated** (not just saved) |
| Embedding API returns 503 | HuggingFace model is loading; retry after 20s |
| Groq rate limit | Free tier has limits; add delay between calls |
| Vector search returns empty | Check that embeddings were stored with correct dimensions |
| yt-dlp not found | Install yt-dlp: `pip install yt-dlp` or use n8n Execute Command node |
