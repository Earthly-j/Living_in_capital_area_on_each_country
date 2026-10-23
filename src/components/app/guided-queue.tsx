'use client'

import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { copyText } from '@/lib/copy'
import { PLATFORM_IDS, PLATFORMS, formatKRW, PlatformId } from '@/lib/platforms'
import type { ListingDTO, PlatformPostDTO } from '@/lib/types'
import { ModeBadge } from './bits'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Copy,
  ExternalLink,
  PartyPopper,
} from 'lucide-react'

interface GuidedQueueProps {
  listing: ListingDTO
  open: boolean
  onClose: () => void
  onSetStatus: (postId: string, status: PlatformPostDTO['status']) => void
}

export function GuidedQueue({ listing, open, onClose, onSetStatus }: GuidedQueueProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())

  const steps = useMemo(
    () => PLATFORM_IDS.map((pid) => listing.platformPosts.find((p) => p.platform === pid)).filter(Boolean) as PlatformPostDTO[],
    [listing]
  )
  const [index, setIndex] = useState(0)
  const finished = index >= steps.length
  const current = finished ? null : steps[index]
  const config = current ? PLATFORMS[current.platform] : null

  async function doCopy(key: string, text: string) {
    const ok = await copyText(text)
    if (ok) {
      setCopied(key)
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800)
    }
  }

  function advance(postId: string | null, status?: PlatformPostDTO['status']) {
    if (postId && status) onSetStatus(postId, status)
    if (postId) setDoneIds((s) => new Set(s).add(postId))
    setIndex((i) => i + 1)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-left">
            {finished ? 'All platforms done!' : `Post everywhere — step ${index + 1} of ${steps.length}`}
          </DialogTitle>
        </DialogHeader>

        {/* progress dots */}
        <div className="flex items-center gap-1.5">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                i < index || doneIds.has(s.id)
                  ? ''
                  : i === index
                    ? 'bg-primary'
                    : 'bg-muted'
              )}
              style={i < index || doneIds.has(s.id) ? { backgroundColor: PLATFORMS[s.platform].color } : undefined}
            />
          ))}
        </div>

        {finished || !current || !config ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
              <PartyPopper className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-extrabold">Your item is live everywhere 🎉</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Total time: about 2 minutes instead of 20. Track chats & sales from the workspace.
              </p>
            </div>
            <div className="w-full space-y-2">
              {steps.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                  <span className="text-sm font-semibold" style={{ color: PLATFORMS[s.platform].color }}>
                    {PLATFORMS[s.platform].shortName}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {s.status === 'READY' ? 'Skipped' : s.status}
                  </span>
                </div>
              ))}
            </div>
            <Button onClick={onClose} className="w-full rounded-2xl font-bold">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* platform header */}
            <div
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-white"
              style={{ backgroundColor: config.color }}
            >
              <div>
                <p className="font-extrabold">{config.name}</p>
                <p className="text-xs opacity-90">{config.titleRule}</p>
              </div>
              <ModeBadge mode={config.mode} />
            </div>

            {/* content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Title</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-full text-xs"
                  onClick={() => doCopy(`t-${current.id}`, current.title)}
                >
                  {copied === `t-${current.id}` ? <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" /> : <Copy className="mr-1 h-3 w-3" />}
                  {copied === `t-${current.id}` ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm font-semibold">{current.title}</p>

              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Description</p>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full text-xs"
                    onClick={() => doCopy(`c-${current.id}`, current.content)}
                  >
                    {copied === `c-${current.id}` ? <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" /> : <Copy className="mr-1 h-3 w-3" />}
                    {copied === `c-${current.id}` ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full text-xs"
                    onClick={() => doCopy(`a-${current.id}`, `${current.title}\n\n${current.content}`)}
                  >
                    {copied === `a-${current.id}` ? <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" /> : <Copy className="mr-1 h-3 w-3" />}
                    {copied === `a-${current.id}` ? 'Copied!' : 'Copy all'}
                  </Button>
                </div>
              </div>
              <div className="max-h-44 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/60 px-3 py-2 text-sm leading-relaxed">
                {current.content}
              </div>
            </div>

            {/* photos reminder */}
            <div className="flex items-start gap-2 rounded-xl border border-dashed border-border px-3 py-2.5">
              <Camera className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {listing.images.length > 0
                  ? `Photos: pick the ${listing.images.length} saved photo${listing.images.length > 1 ? 's' : ''} from your gallery (already resized).`
                  : 'Photos: add a few from your gallery inside the app.'}
              </p>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">💡 {config.howTo}</p>

            {/* actions */}
            <div className="space-y-2">
              <Button
                className="w-full rounded-2xl font-bold text-white"
                style={{ backgroundColor: config.color }}
                onClick={() => window.open(config.uploadUrl, '_blank', 'noopener')}
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Open {config.shortName}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="rounded-2xl font-semibold"
                  onClick={() => advance(null)}
                >
                  Skip
                </Button>
                <Button
                  className="rounded-2xl font-bold"
                  onClick={() => advance(current.id, current.status === 'READY' ? 'POSTED' : undefined)}
                >
                  Posted — next <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-center text-[11px] text-muted-foreground">
              Price on this platform: {formatKRW(listing.price)} · Area: {listing.area}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
