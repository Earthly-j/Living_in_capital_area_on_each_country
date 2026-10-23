import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { regenerateVersion, parsePlatformId } from '@/lib/ai'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const platform = parsePlatformId(body.platform)
    if (!platform) return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })

    const listing = await db.listing.findUnique({ where: { id }, include: { platformPosts: true } })
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    const input = {
      title: listing.title,
      price: listing.price,
      condition: listing.condition,
      category: listing.category,
      area: listing.area,
      shipping: listing.shipping,
      description: listing.description,
    }

    const { versions, aiUsed } = await regenerateVersion(input, platform)
    const version = versions[platform]

    const existing = listing.platformPosts.find((p) => p.platform === platform)
    let post
    if (existing) {
      post = await db.platformPost.update({
        where: { id: existing.id },
        data: { title: version.title, content: version.content },
      })
    } else {
      post = await db.platformPost.create({
        data: { listingId: listing.id, platform, title: version.title, content: version.content },
      })
    }

    return NextResponse.json({ post, aiUsed })
  } catch (err) {
    console.error('[regenerate] failed:', err)
    return NextResponse.json({ error: 'Failed to regenerate version' }, { status: 500 })
  }
}
