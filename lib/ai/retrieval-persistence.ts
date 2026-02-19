type RetrievalPersistenceConfig = {
  baseUrl: string;
  serviceKey: string;
  table: string;
};

export type PersistedRetrievalEmbeddingRow = {
  id: string;
  created_at: string;
  updated_at: string;
  model: string;
  doc_id: string;
  title: string;
  path: string;
  source_type: "route" | "doc";
  chunk_index: number;
  content_hash: string;
  text: string;
  tags: string[];
  embedding: number[];
};

export type RetrievalEmbeddingInputRow = {
  id: string;
  model: string;
  doc_id: string;
  title: string;
  path: string;
  source_type: "route" | "doc";
  chunk_index: number;
  content_hash: string;
  text: string;
  tags: string[];
  embedding: number[];
};

function getConfig() {
  const baseUrl = String(process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const table = String(process.env.TRADEHAX_SUPABASE_AI_RETRIEVAL_TABLE || "ai_retrieval_embeddings").trim();

  const configured = Boolean(baseUrl && serviceKey && table);
  return {
    configured,
    config: configured
      ? {
          baseUrl,
          serviceKey,
          table,
        }
      : null,
  };
}

function headers(config: RetrievalPersistenceConfig, extra?: HeadersInit) {
  return {
    apikey: config.serviceKey,
    Authorization: `Bearer ${config.serviceKey}`,
    "Content-Type": "application/json",
    ...(extra || {}),
  };
}

async function requestJson<T>(config: RetrievalPersistenceConfig, path: string, init: RequestInit, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${config.baseUrl}/rest/v1/${path}`, {
      ...init,
      headers: headers(config, init.headers),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase ${response.status}: ${text.slice(0, 280)}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    const text = await response.text();
    if (!text) {
      return null as T;
    }

    return JSON.parse(text) as T;
  } finally {
    clearTimeout(timer);
  }
}

function encodeEq(value: string) {
  return `eq.${encodeURIComponent(value)}`;
}

export async function listPersistedRetrievalEmbeddings(model: string, limit = 6000) {
  const { configured, config } = getConfig();
  if (!configured || !config) {
    return [] as PersistedRetrievalEmbeddingRow[];
  }

  const bounded = Math.min(10_000, Math.max(1, Math.floor(limit)));
  const query = `${config.table}?select=*&model=${encodeEq(model)}&order=updated_at.desc&limit=${bounded}`;
  const rows = await requestJson<PersistedRetrievalEmbeddingRow[]>(config, query, { method: "GET" });
  return Array.isArray(rows) ? rows : [];
}

export async function persistRetrievalEmbeddingsSnapshot(input: {
  model: string;
  rows: RetrievalEmbeddingInputRow[];
}) {
  const { configured, config } = getConfig();
  if (!configured || !config) {
    return {
      persisted: false,
      reason: "supabase_not_configured",
      count: 0,
      table: "memory_only",
    };
  }

  const now = new Date().toISOString();
  const payload: PersistedRetrievalEmbeddingRow[] = input.rows.map((row) => ({
    id: row.id,
    created_at: now,
    updated_at: now,
    model: row.model,
    doc_id: row.doc_id,
    title: row.title,
    path: row.path,
    source_type: row.source_type,
    chunk_index: row.chunk_index,
    content_hash: row.content_hash,
    text: row.text,
    tags: row.tags,
    embedding: row.embedding,
  }));

  const BATCH_SIZE = 40;
  for (let index = 0; index < payload.length; index += BATCH_SIZE) {
    const batch = payload.slice(index, index + BATCH_SIZE);
    await requestJson<unknown>(
      config,
      `${config.table}?on_conflict=id`,
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(batch),
      },
      30_000,
    );
  }

  return {
    persisted: true,
    count: payload.length,
    table: config.table,
  };
}
