import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }
    if (files.length > 10) {
      return NextResponse.json({ error: 'Max 10 photos per item' }, { status: 400 })
    }

    const dir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(dir, { recursive: true })

    const urls: string[] = []
    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 })
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: 'Photo too large (max 10MB)' }, { status: 400 })
      }
      const buf = Buffer.from(await file.arrayBuffer())
      const resized = await sharp(buf, { failOn: 'none' })
        .rotate()
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer()
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
      await writeFile(path.join(dir, name), resized)
      urls.push(`/uploads/${name}`)
    }

    return NextResponse.json({ urls })
  } catch (err) {
    console.error('[upload] failed:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
