import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { toDTO } from '@/lib/dto'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: { status?: string } = {}
    if (body.status === 'SOLD' || body.status === 'ACTIVE') data.status = body.status
    const listing = await db.listing.update({ where: { id }, data, include: { platformPosts: true } })
    return NextResponse.json({ listing: toDTO(listing) })
  } catch (err) {
    console.error('[listing:PATCH] failed:', err)
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.listing.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[listing:DELETE] failed:', err)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
