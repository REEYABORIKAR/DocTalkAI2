export type SSEEvent =
  | { type: 'step'; data: string }
  | { type: 'answer_chunk'; data: string }
  | { type: 'sources'; data: Source[] }
  | { type: 'meta'; data: { domain: string; verified: boolean } }
  | { type: 'done'; data: boolean }
  | { type: 'error'; data: string }

export interface Source {
  file: string
  page: number
  text: string
  domain: string
}

export interface StreamCallbacks {
  onStep: (step: string) => void
  onAnswerChunk: (chunk: string) => void
  onSources: (sources: Source[]) => void
  onMeta: (meta: { domain: string; verified: boolean }) => void
  onDone: () => void
  onError: (error: string) => void
}

export async function streamChat(
  query: string,
  mode: string,
  token: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const BASE_URL = import.meta.env.VITE_API_URL || '/api'

  const response = await fetch(`${BASE_URL}/chat/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, mode }),
  })

  if (!response.ok) {
    callbacks.onError(`Server error: ${response.status}`)
    return
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const raw = line.slice(6).trim()
        if (!raw) continue
        try {
          const event: SSEEvent = JSON.parse(raw)
          switch (event.type) {
            case 'step':        callbacks.onStep(event.data); break
            case 'answer_chunk': callbacks.onAnswerChunk(event.data); break
            case 'sources':     callbacks.onSources(event.data); break
            case 'meta':        callbacks.onMeta(event.data); break
            case 'done':        callbacks.onDone(); break
            case 'error':       callbacks.onError(event.data); break
          }
        } catch {
          // ignore malformed SSE lines
        }
      }
    }
  }
}
