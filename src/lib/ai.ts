import ZAI from 'z-ai-web-dev-sdk'
import {
  PLATFORM_IDS,
  PlatformId,
  ListingInput,
  PlatformVersion,
  buildFallbackVersions,
  conditionKr,
  conditionEn,
  shippingKr,
  formatKRW,
  areaEn,
} from './platforms'

export interface GeneratedVersions {
  versions: Record<PlatformId, PlatformVersion>
  aiUsed: boolean
}

function extractJson(raw: string): Record<string, unknown> | null {
  let s = raw.trim()
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) s = fence[1].trim()
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(s.slice(start, end + 1))
  } catch {
    return null
  }
}

function validateVersions(obj: Record<string, unknown>): Record<PlatformId, PlatformVersion> | null {
  const out = {} as Record<PlatformId, PlatformVersion>
  for (const id of PLATFORM_IDS) {
    const v = obj[id] as { title?: unknown; content?: unknown } | undefined
    if (!v || typeof v.title !== 'string' || typeof v.content !== 'string') return null
    if (!v.title.trim() || !v.content.trim()) return null
    out[id] = { title: v.title.trim(), content: v.content.trim() }
  }
  return out
}

const SYSTEM_PROMPT =
  'You are an expert Korean secondhand-marketplace copywriter. You know the posting culture of 당근마켓, 번개장터, 네이버 중고나라 카페 and Craigslist. You always respond with valid JSON only — no markdown fences, no commentary.'

function buildUserPrompt(input: ListingInput, only?: PlatformId): string {
  const targets = only ? [only] : PLATFORM_IDS
  const spec = targets
    .map((id) => {
      switch (id) {
        case 'KARROT':
          return `"KARROT": 당근마켓 style. Title: max 24 Korean chars, short & friendly, product name first, NO hashtags. Content: 200-350 chars, casual polite 요체, mention condition & area, end with "편하게 채팅 주세요! 😊". No phone numbers or external contact.`
        case 'BUNJANG':
          return `"BUNJANG": 번개장터 style. Title: max 40 chars, keyword-rich for search (brand/model/category keywords). Content: bullet-style info (상태/가격/거래방법), say price is 너고 가능, end with 3-5 relevant Korean hashtags starting with #중고.`
        case 'JOONGGONARA':
          return `"JOONGGONARA": 네이버 중고나라 카페 style. Title: exactly "[판매] ${input.area} {product} ${formatKRW(input.price)}" format, max 40 chars. Content: polite 존댓말, list 상태/가격/거래방법 with □ bullets, include reason for selling if inferable, no contact info, end politely.`
        case 'CLSEOUL':
          return `"CLSEOUL": Craigslist Seoul style, ENTIRELY IN ENGLISH for expat buyers. Title: max 60 chars, plain, no emoji. Content: 4-6 sentences in English — what it is, condition translated to natural English, price as ₩${input.price.toLocaleString('en-US')} KRW cash, ${shippingKr(input.shipping)} translated, pickup in ${areaEn(input.area)}. Simple & honest tone.`
      }
    })
    .join('\n')

  return `Write marketplace listing versions for this ONE item.

ITEM
- Product: ${input.title}
- Master category: ${input.category}
- Condition: ${conditionKr(input.condition)} (${conditionEn(input.condition)})
- Price: ${formatKRW(input.price)}
- Area: ${input.area}
- Trade method: ${shippingKr(input.shipping)}
- Seller notes: ${input.description?.trim() || '(none — infer natural details from product & category, do NOT invent defects or accessories)'}

PLATFORM RULES
${spec}

Respond with ONLY this JSON shape (keys exactly as quoted):
{
${targets.map((id) => `  "${id}": { "title": "...", "content": "..." }`).join(',\n')}
}`
}

function isPlatformId(x: string): x is PlatformId {
  return (PLATFORM_IDS as string[]).includes(x)
}

async function askAI(input: ListingInput, only?: PlatformId): Promise<Record<PlatformId, PlatformVersion> | null> {
  try {
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(input, only) },
      ],
      thinking: { type: 'disabled' },
    })
    const raw = completion.choices[0]?.message?.content
    if (!raw) return null
    const json = extractJson(raw)
    if (!json) return null
    return validateVersions(json)
  } catch (err) {
    console.error('[ai] generation failed:', err)
    return null
  }
}

export async function generateVersions(input: ListingInput): Promise<GeneratedVersions> {
  const ai = await askAI(input)
  if (ai) return { versions: ai, aiUsed: true }
  return { versions: buildFallbackVersions(input), aiUsed: false }
}

export async function regenerateVersion(input: ListingInput, platform: PlatformId): Promise<GeneratedVersions> {
  const ai = await askAI(input, platform)
  if (ai) return { versions: { [platform]: ai[platform] } as Record<PlatformId, PlatformVersion>, aiUsed: true }
  return {
    versions: { [platform]: buildFallbackVersions(input)[platform] } as Record<PlatformId, PlatformVersion>,
    aiUsed: false,
  }
}

export function parsePlatformId(x: unknown): PlatformId | null {
  return typeof x === 'string' && isPlatformId(x) ? x : null
}
