import { PLATFORM_IDS, PlatformId } from './platforms'
import type { ListingDTO } from './types'

export function toDTO(listing: {
  id: string
  title: string
  price: number
  condition: string
  category: string
  area: string
  shipping: string
  description: string
  images: string
  status: string
  createdAt: Date
  platformPosts: {
    id: string
    listingId: string
    platform: string
    title: string
    content: string
    status: string
    postedAt: Date | null
  }[]
}): ListingDTO {
  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    condition: listing.condition,
    category: listing.category,
    area: listing.area,
    shipping: listing.shipping,
    description: listing.description,
    images: JSON.parse(listing.images || '[]'),
    status: listing.status as ListingDTO['status'],
    createdAt: listing.createdAt.toISOString(),
    platformPosts: listing.platformPosts
      .filter((p) => (PLATFORM_IDS as string[]).includes(p.platform))
      .map((p) => ({
        id: p.id,
        listingId: p.listingId,
        platform: p.platform as PlatformId,
        title: p.title,
        content: p.content,
        status: p.status as ListingDTO['platformPosts'][number]['status'],
        postedAt: p.postedAt ? p.postedAt.toISOString() : null,
      })),
  }
}
