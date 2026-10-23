import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateVersions } from '@/lib/ai'
import { PLATFORM_IDS } from '@/lib/platforms'
import { toDTO } from '@/lib/dto'

export async function GET() {
  try {
    const listings = await db.listing.findMany({
      include: { platformPosts: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ listings: listings.map(toDTO) })
  } catch (err) {
    console.error('[listings:GET] failed:', err)
    return NextResponse.json({ error: 'Failed to load listings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const title = String(body.title || '').trim()
    const price = Number(body.price)
    const condition = String(body.condition || 'LIKE_NEW')
    const category = String(body.category || '기타')
    const area = String(body.area || '').trim()
    const shipping = String(body.shipping || 'BOTH')
    const description = String(body.description || '').trim()
    const images = Array.isArray(body.images) ? body.images.map(String).slice(0, 10) : []

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    if (!Number.isFinite(price) || price <= 0)
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 })
    if (!area) return NextResponse.json({ error: 'Area is required' }, { status: 400 })

    const input = { title, price, condition, category, area, shipping, description }

    const { versions, aiUsed } = await generateVersions(input)

    const listing = await db.listing.create({
      data: {
        title,
        price,
        condition,
        category,
        area,
        shipping,
        description,
        images: JSON.stringify(images),
        status: 'ACTIVE',
        platformPosts: {
          create: PLATFORM_IDS.map((platform) => ({
            platform,
            title: versions[platform].title,
            content: versions[platform].content,
            status: 'READY',
          })),
        },
      },
      include: { platformPosts: true },
    })

    return NextResponse.json({ listing: toDTO(listing), aiUsed })
  } catch (err) {
    console.error('[listings:POST] failed:', err)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
