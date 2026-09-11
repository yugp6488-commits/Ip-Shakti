// lib/api.ts — API client for IP-SAKTI frontend

// ---------------------------------------------------------------------------
// Ollama direct chat (bypasses backend when backend services are unavailable)
// ---------------------------------------------------------------------------

const OLLAMA_URL = 'http://localhost:11434'
const OLLAMA_MODEL = 'qwen3:30b'

const SYSTEM_PROMPT = `You are IP-SAKTI Sahayak, an AI regulatory compliance copilot for Ayurveda, AYUSH, and Indian IP law.

Your expertise covers:
- Section 3(p) of the Indian Patents Act (traditional knowledge exclusion)
- Drug classification: Proprietary Ayurvedic Drug vs Ayurveda-Aahar vs Cosmetic vs Nutraceutical
- NBA (National Biodiversity Authority) clearance requirements under the Biological Diversity Act 2002
- AYUSH Ministry licensing, GMP, and labeling requirements
- Patent filing strategy for herbal formulations
- Traditional Knowledge Digital Library (TKDL) prior art risks
- CITES and Nagoya Protocol compliance for biological resources

Guidelines:
- Give clear, structured answers with headings and bullet points.
- Cite relevant Indian acts, sections, and rules.
- When uncertain, say so and recommend consulting a qualified IP attorney.
- Be concise but thorough.
- Do NOT hallucinate legal provisions — only reference real acts and sections.`

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Stream a chat completion from Ollama.
 * Yields partial content strings as they arrive.
 */
export async function* streamChat(
  messages: ChatMessage[],
): AsyncGenerator<string, void, unknown> {
  const fullMessages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ]

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: fullMessages,
      stream: true,
    }),
  })

  if (!res.ok) {
    throw new Error(`Ollama error ${res.status}: ${res.statusText}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Ollama streams one JSON object per line
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const data = JSON.parse(line)
        if (data.message?.content) {
          yield data.message.content
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  // Process any remaining buffer
  if (buffer.trim()) {
    try {
      const data = JSON.parse(buffer)
      if (data.message?.content) {
        yield data.message.content
      }
    } catch {
      // skip
    }
  }
}

/**
 * Check if Ollama is reachable and has the required model.
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return false
    const data = await res.json()
    return data.models?.some((m: { name: string }) => m.name.includes('qwen3'))
  } catch {
    return false
  }
}
