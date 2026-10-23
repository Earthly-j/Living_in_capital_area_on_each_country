import type { PlatformId } from './platforms'

export interface PlatformPostDTO {
  id: string
  listingId: string
  platform: PlatformId
  title: string
  content: string
  status: 'READY' | 'POSTED' | 'CHATTING' | 'SOLD'
  postedAt: string | null
}

export interface ListingDTO {
  id: string
  title: string
  price: number
  condition: string
  category: string
  area: string
  shipping: string
  description: string
  images: string[]
  status: 'ACTIVE' | 'SOLD'
  createdAt: string
  platformPosts: PlatformPostDTO[]
}

export const POST_STATUS_ORDER = ['READY', 'POSTED', 'CHATTING', 'SOLD'] as const

export const STATUS_LABELS: Record<string, string> = {
  READY: 'Ready',
  POSTED: 'Posted',
  CHATTING: 'Chatting',
  SOLD: 'Sold',
}
