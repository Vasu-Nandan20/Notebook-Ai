-- =============================================
-- Supabase Schema for NotebookAI Backend
-- =============================================

CREATE EXTENSION IF NOT EXISTS vector;

-- Documents (used by n8n file processing)
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(384),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_user_file ON documents(user_id, file_id);
CREATE INDEX idx_documents_embedding ON documents USING hnsw (embedding vector_cosine_ops);

-- Chat History
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT DEFAULT 'New Chat',
  share_id UUID DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  output_type TEXT,
  persona TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz & Flashcards
CREATE TABLE IF NOT EXISTS quiz_results (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_id TEXT,
  difficulty TEXT,
  total_questions INTEGER,
  correct_answers INTEGER,
  questions JSONB,
  answers JSONB,
  gap_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flashcards (
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

-- Admin Monitoring
CREATE TABLE IF NOT EXISTS usage_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  endpoint TEXT,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector Search Functions
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(384),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 10,
  filter_user_id TEXT DEFAULT NULL,
  filter_file_id TEXT DEFAULT NULL
)
RETURNS TABLE (id BIGINT, file_id TEXT, file_name TEXT, content TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE sql STABLE AS $$
  SELECT
    d.id, d.file_id, d.file_name, d.content, d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE (filter_user_id IS NULL OR d.user_id = filter_user_id)
    AND (filter_file_id IS NULL OR d.file_id = filter_file_id)
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
$$;

CREATE OR REPLACE FUNCTION cross_file_search(
  query_embedding VECTOR(384),
  p_user_id TEXT,
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 20
)
RETURNS TABLE (id BIGINT, file_id TEXT, file_name TEXT, content TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE sql STABLE AS $$
  SELECT
    d.id, d.file_id, d.file_name, d.content, d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE d.user_id = p_user_id
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- RLS Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust 'sub' based on your JWT setup)
CREATE POLICY "users_own_documents" ON documents USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "users_own_chats" ON chats USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "users_own_messages" ON messages USING (chat_id IN (SELECT id FROM chats WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'));