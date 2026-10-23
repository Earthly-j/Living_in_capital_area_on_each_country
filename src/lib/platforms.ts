// ─── Platform adapter configuration ────────────────────────────────────────
// Each marketplace has its own culture, title rules and posting surface.
// This is the "adapter layer": v1/v2 will grow API connectors from here.

export type PlatformId = 'KARROT' | 'BUNJANG' | 'JOONGGONARA' | 'CLSEOUL'

export interface PlatformConfig {
  id: PlatformId
  name: string
  shortName: string
  color: string
  uploadUrl: string
  mode: 'assist' | 'api-ready'
  howTo: string
  titleRule: string
  maxTitleChars: number
}

export const PLATFORM_IDS: PlatformId[] = ['KARROT', 'BUNJANG', 'JOONGGONARA', 'CLSEOUL']

export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  KARROT: {
    id: 'KARROT',
    name: '당근마켓 (Karrot)',
    shortName: '당근',
    color: '#FF6F0F',
    uploadUrl: 'https://www.daangn.com/',
    mode: 'assist',
    howTo:
      'Karrot only allows posting inside the app. On mobile, opening the link jumps into the app. Paste the title & description, pick your photos from the gallery, set the category, then tap 등록완료. (~30 sec)',
    titleRule: 'Short & friendly, product name first, no hashtags (max ~24 chars)',
    maxTitleChars: 24,
  },
  BUNJANG: {
    id: 'BUNJANG',
    name: '번개장터 (Bunjang)',
    shortName: '번개장터',
    color: '#FF4E45',
    uploadUrl: 'https://web.bunjang.co.kr/upload',
    mode: 'assist',
    howTo:
      'Bunjang web upload opens in a new tab. Log in, paste the keyword-rich title & description, upload your photos, choose the category, then post. (~30 sec)',
    titleRule: 'Keyword-rich: brand + model + condition keywords for search (max ~40 chars)',
    maxTitleChars: 40,
  },
  JOONGGONARA: {
    id: 'JOONGGONARA',
    name: '중고나라 (Naver Cafe)',
    shortName: '중고나라',
    color: '#03C75A',
    uploadUrl: 'https://cafe.naver.com/joonggonara',
    mode: 'api-ready',
    howTo:
      'Open the cafe, tap 글쓰기, paste the "[판매] ..." title & polite description, attach photos. Follows 중고나라 title conventions. (v1 will auto-post this via the official Naver Cafe API)',
    titleRule: 'Cafe convention: "[판매] 지역 제품명 가격원" (max ~40 chars)',
    maxTitleChars: 40,
  },
  CLSEOUL: {
    id: 'CLSEOUL',
    name: 'Craigslist Seoul',
    shortName: 'Craigslist',
    color: '#8B2FA8',
    uploadUrl: 'https://seoul.craigslist.org/',
    mode: 'assist',
    howTo:
      'English version ready for expat buyers. Tap "post" on Craigslist, choose "for sale by owner", paste the English title & description, upload photos. Cash & pickup noted. (~30 sec)',
    titleRule: 'English, plain & simple, no emoji (max ~60 chars)',
    maxTitleChars: 60,
  },
}

// ─── Master listing options ────────────────────────────────────────────────

export const CONDITIONS = [
  { value: 'NEW', kr: '새제품 (미개봉)', en: 'Brand new, unopened' },
  { value: 'LIKE_NEW', kr: '거의 새것', en: 'Like new' },
  { value: 'USED', kr: '사용감 있음', en: 'Used, good condition' },
  { value: 'NEEDS_CARE', kr: '주의 필요', en: 'Well used, visible wear' },
] as const

export const CATEGORIES = [
  '디지털기기',
  '가구/인테리어',
  '유아동',
  '생활/주방',
  '스포츠/레저',
  '여성의류',
  '남성의류',
  '게임/취미',
  '뷰티/미용',
  '반려동물용품',
  '도서/음반',
  '기타',
] as const

export const SHIPPING_OPTIONS = [
  { value: 'DIRECT', kr: '직거래만' },
  { value: 'DELIVERY', kr: '택배만' },
  { value: 'BOTH', kr: '직거래 + 택배' },
] as const

export function conditionKr(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.kr ?? value
}

export function conditionEn(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.en ?? value
}

export function shippingKr(value: string): string {
  return SHIPPING_OPTIONS.find((s) => s.value === value)?.kr ?? value
}

export function formatKRW(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`
}

export function areaEn(area: string): string {
  const map: Record<string, string> = {
    강남구: 'Gangnam, Seoul', 강서구: 'Gangseo, Seoul', 강북구: 'Gangbuk, Seoul',
    관악구: 'Gwanak, Seoul', 광진구: 'Gwangjin, Seoul', 구로구: 'Guro, Seoul',
    금천구: 'Geumcheon, Seoul', 노원구: 'Nowon, Seoul', 도봉구: 'Dobong, Seoul',
    동대문구: 'Dongdaemun, Seoul', 동작구: 'Dongjak, Seoul', 마포구: 'Mapo, Seoul',
    서대문구: 'Seodaemun, Seoul', 서초구: 'Seocho, Seoul', 성동구: 'Seongdong, Seoul',
    성북구: 'Seongbuk, Seoul', 송파구: 'Songpa, Seoul', 양천구: 'Yangcheon, Seoul',
    영등포구: 'Yeongdeungpo, Seoul', 용산구: 'Yongsan, Seoul', 은평구: 'Eunpyeong, Seoul',
    종로구: 'Jongno, Seoul', 중구: 'Jung-gu, Seoul', 중랑구: 'Jungnang, Seoul',
    서울: 'Seoul', 부산: 'Busan', 인천: 'Incheon', 대구: 'Daegu', 대전: 'Daejeon',
    광주: 'Gwangju', 울산: 'Ulsan', 수원: 'Suwon', 성남: 'Seongnam', 고양: 'Goyang',
    용인: 'Yongin', 부천: 'Bucheon', 안양: 'Anyang', 안산: 'Ansan', 전주: 'Jeonju',
  }
  for (const [kr, en] of Object.entries(map)) {
    if (area.includes(kr)) return en
  }
  return area || 'Seoul'
}

// ─── Rule-based fallback versions (used when AI is unavailable) ───────────

export interface ListingInput {
  title: string
  price: number
  condition: string
  category: string
  area: string
  shipping: string
  description: string
}

export type PlatformVersion = { title: string; content: string }

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

export function buildFallbackVersions(input: ListingInput): Record<PlatformId, PlatformVersion> {
  const condKr = conditionKr(input.condition)
  const condEn = conditionEn(input.condition)
  const shipKr = shippingKr(input.shipping)
  const shipEn =
    input.shipping === 'DELIVERY' ? 'Shipping available' : input.shipping === 'DIRECT' ? 'Meetup only' : 'Meetup preferred, shipping possible'
  const notes = input.description?.trim()

  return {
    KARROT: {
      title: truncate(`${input.title} ${input.condition === 'NEW' ? '새제품' : condKr.replace(' (미개봉)', '')}`, 24),
      content: [
        `${input.title} 판매해요.`,
        `상태: ${condKr}${notes ? `\n${notes}` : ''}`,
        ``,
        `📍 ${input.area} ${input.shipping === 'DELIVERY' ? '택배 거래 가능해요' : '직거래 환영해요'}${input.shipping === 'BOTH' ? ' (택배도 가능해요)' : ''}`,
        `💰 ${formatKRW(input.price)}`,
        ``,
        `편하게 채팅 주세요! 😊`,
      ].join('\n'),
    },
    BUNJANG: {
      title: truncate(`${input.category} ${input.title} ${input.condition === 'NEW' ? '미개봉' : '급판'} `, 40),
      content: [
        `${input.title} 판매합니다.`,
        `• 상태: ${condKr}`,
        `• 가격: ${formatKRW(input.price)} (너고 가능)`,
        `• 거래: ${shipKr}`,
        notes ? `\n${notes}\n` : '',
        `#중고 #${input.category.replace('/', '')} #${input.title.split(' ')[0]}`,
      ]
        .filter((s) => s !== '')
        .join('\n'),
    },
    JOONGGONARA: {
      title: truncate(`[판매] ${input.area} ${input.title} ${formatKRW(input.price)}`, 40),
      content: [
        `안녕하세요, ${input.title} 판매합니다.`,
        ``,
        `□ 상태: ${condKr}`,
        `□ 가격: ${formatKRW(input.price)}${notes ? `\n${notes}` : ''}`,
        `□ 거래 방법: ${shipKr}`,
        ``,
        `궁금하신 점은 댓글이나 쪽지 주세요. 감사합니다.`,
      ].join('\n'),
    },
    CLSEOUL: {
      title: truncate(`${input.title} - ${condEn}`, 60),
      content: [
        `Selling: ${input.title} (${input.category})`,
        ``,
        `Condition: ${condEn}.`,
        notes ? `Details: ${notes}.` : '',
        `Price: ₩${input.price.toLocaleString('en-US')} KRW, cash.`,
        `${shipEn}. Pickup in ${areaEn(input.area)}.`,
        ``,
        `Text through Craigslist email relay. Thanks!`,
      ]
        .filter((s) => s !== '')
        .join('\n'),
    },
  }
}
