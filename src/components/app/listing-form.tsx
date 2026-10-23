'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES, CONDITIONS, SHIPPING_OPTIONS } from '@/lib/platforms'
import type { ListingDTO } from '@/lib/types'
import { ArrowLeft, Camera, Loader2, Sparkles, X } from 'lucide-react'

interface ListingFormProps {
  onCreated: (listing: ListingDTO) => void
  onCancel: () => void
}

const AI_STEPS = [
  'Analyzing your item…',
  'Writing your 당근 version…',
  'Writing 번개장터 & 중고나라 versions…',
  'Translating English for Craigslist…',
]

export function ListingForm({ onCreated, onCancel }: ListingFormProps) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('LIKE_NEW')
  const [category, setCategory] = useState('디지털기기')
  const [area, setArea] = useState('')
  const [shipping, setShipping] = useState('BOTH')
  const [description, setDescription] = useState('')

  const [images, setImages] = useState<string[]>([])
  const [previews, setPreviews] = useState<{ url: string; uploading: boolean }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!submitting) return
    const t = setInterval(() => setStep((s) => (s + 1) % AI_STEPS.length), 1600)
    return () => clearInterval(t)
  }, [submitting])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const room = 10 - images.length
    if (room <= 0) {
      setError('Max 10 photos per item')
      return
    }
    const picked = Array.from(files).slice(0, room)
    const startIndex = previews.length
    setPreviews((p) => [...p, ...picked.map((f) => ({ url: URL.createObjectURL(f), uploading: true }))])

    const fd = new FormData()
    picked.forEach((f) => fd.append('files', f))
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setImages((prev) => [...prev, ...data.urls])
      setPreviews((p) =>
        p.map((x, i) => (i >= startIndex && i < startIndex + picked.length ? { ...x, uploading: false } : x))
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Photo upload failed')
      setPreviews((p) => p.slice(0, startIndex))
    }
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((p) => p.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    setError(null)
    if (!title.trim()) return setError('Please enter the item name')
    const p = Number(price.replace(/[^0-9]/g, ''))
    if (!p || p <= 0) return setError('Please enter a valid price in KRW')
    if (!area.trim()) return setError('Please enter your trading area (e.g. 강남구)')
    if (previews.some((x) => x.uploading)) return setError('Photos are still uploading…')

    setSubmitting(true)
    setStep(0)
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          price: p,
          condition,
          category,
          area: area.trim(),
          shipping,
          description,
          images,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create listing')
      onCreated(data.listing)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-extrabold">New item</h1>
          <p className="text-sm text-muted-foreground">Write it once — we generate all 4 platform versions.</p>
        </div>
      </div>

      <Card className="rounded-3xl">
        <CardContent className="space-y-5 p-6">
          {/* photos */}
          <div className="space-y-2">
            <Label>
              Photos <span className="text-muted-foreground">({images.length}/10 · resized automatically)</span>
            </Label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {previews.map((img, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <img src={img.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  {img.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                  <button
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                    onClick={() => removeImage(i)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <button
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <p className="text-xs text-muted-foreground">
              Tip: these exact photos are saved for you — pick the same ones from your gallery when posting in apps.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title">Item name *</Label>
              <Input
                id="title"
                placeholder="e.g. 아이패드 에어 5세대 64GB 스타라이트"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (KRW) *</Label>
              <div className="relative">
                <Input
                  id="price"
                  inputMode="numeric"
                  placeholder="800000"
                  value={price ? Number(price.replace(/[^0-9]/g, '')).toLocaleString('ko-KR') : ''}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pr-9"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₩</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Trading area *</Label>
              <Input placeholder="e.g. 강남구" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger aria-label="Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Trade method</Label>
              <Select value={shipping} onValueChange={setShipping}>
                <SelectTrigger aria-label="Trade method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIPPING_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.kr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Condition</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCondition(c.value)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                    condition === c.value
                      ? 'border-primary bg-orange-50 text-primary dark:bg-orange-950'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {c.kr}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc">Anything buyers should know?</Label>
            <Textarea
              id="desc"
              rows={4}
              placeholder="Condition details, reason for selling, included accessories, quirks…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          <Button
            size="lg"
            className="w-full rounded-2xl text-base font-bold shadow-lg shadow-orange-600/25"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {AI_STEPS[step]}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" /> Write my 4 platform versions
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
