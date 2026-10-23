import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const VALID = ['READY', 'POSTED', 'CHATTING', 'SOLD']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const status = String(body.status || '')
    if (!VALID.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    const post = await db.platformPost.update({
      where: { id },
      data: { status, postedAt: status === 'POSTED' ? new Date() : undefined },
    })
    return NextResponse.json({ post })
  } catch (err) {
    console.error('[platform-post:PATCH] failed:', err)
    return NextResponse.json({ error: 'Failed to update post status' }, { status: 500 })
  }
}
