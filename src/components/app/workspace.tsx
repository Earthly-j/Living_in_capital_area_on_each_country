'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { copyText } from '@/lib/copy'
import { PLATFORMS, conditionKr, formatKRW, PlatformId } from '@/lib/platforms'
import type { ListingDTO, PlatformPostDTO } from '@/lib/types'
import { ModeBadge, StatusBadge } from './bits'
import { GuidedQueue } from './guided-queue'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Rocket,
  Sparkles,
  Tag,
} from 'lucide-react'

interface WorkspaceProps {
  listing: ListingDTO
  onBack: () => void
  onSetStatus: (postId: string, status: PlatformPostDTO['status']) => void
  onRegenerate: (platform: PlatformId) => Promise<void>
}

export function Workspace({ listing, onBack, onSetStatus, onRegenerate }: WorkspaceProps) {
  const [queueOpen, setQueueOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [regen, setRegen] = useState<PlatformId | null>(null)

  const readyCount = listing.platformPosts.filter((p) => p.status === 'READY').length

  async function doCopy(key: string, text: string) {
    if (await copyText(text)) {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey((c) => (c === key ? null : c)), 1800)
    }
  }

  async function handleRegenerate(platform: PlatformId) {
    setRegen(platform)
    try {
      await onRegenerate(platform)
    } finally {
      setRegen(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to dashboard">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold">{listing.title}</h1>
          <p className="text-sm font-bold text-primary">{formatKRW(listing.price)}</p>
        </div>
      </div>

      {/* master summary */}
      <Card className="rounded-3xl">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            {listing.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 sm:w-48 sm:flex-wrap sm:overflow-visible">
                {listing.images.slice(0, 4).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`${listing.title} photo ${i + 1}`}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-[5.5rem] sm:w-[5.5rem]"
                  />
                ))}
              </div>
            )}
            <div className="flex flex-1 flex-wrap content-center items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                <Tag className="h-3 w-3" /> {listing.category}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                {conditionKr(listing.condition)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                <MapPin className="h-3 w-3" /> {listing.area}
              </span>
              {listing.description && (
                <p className="mt-1 w-full text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
              )}
            </div>
          </div>
          <Button
            size="lg"
            className="mt-4 w-full rounded-2xl text-base font-bold shadow-lg shadow-orange-600/25"
            onClick={() => setQueueOpen(true)}
          >
            <Rocket className="mr-2 h-5 w-5" />
            {readyCount > 0 ? `Post everywhere — ${readyCount} platform${readyCount > 1 ? 's' : ''} to go` : 'Re-run the posting queue'}
          </Button>
        </CardContent>
      </Card>

      {/* platform cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {listing.platformPosts.map((post) => {
          const cfg = PLATFORMS[post.platform]
          const busy = regen === post.platform
          return (
            <Card key={post.id} className="overflow-hidden rounded-3xl border-border/70 shadow-sm">
              <div
                className="flex items-center justify-between px-4 py-2.5 text-white"
                style={{ backgroundColor: cfg.color }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">{cfg.name}</span>
                  <ModeBadge mode={cfg.mode} />
                </div>
                <StatusBadge status={post.status} className="bg-white/95" />
              </div>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-bold">{post.title}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 shrink-0 rounded-full text-xs"
                    onClick={() => doCopy(`t-${post.id}`, post.title)}
                  >
                    {copiedKey === `t-${post.id}` ? (
                      <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="mr-1 h-3 w-3" />
                    )}
                    Title
                  </Button>
                </div>
                <div className="relative max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/60 px-3 py-2 text-sm leading-relaxed">
                  {post.content}
                  {busy && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full text-xs"
                    onClick={() => doCopy(`c-${post.id}`, `${post.title}\n\n${post.content}`)}
                  >
                    {copiedKey === `c-${post.id}` ? (
                      <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="mr-1 h-3 w-3" />
                    )}
                    {copiedKey === `c-${post.id}` ? 'Copied all!' : 'Copy all'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full text-xs"
                    onClick={() => handleRegenerate(post.platform)}
                    disabled={busy}
                  >
                    <Sparkles className={cn('mr-1 h-3 w-3', busy && 'animate-spin')} /> Rewrite
                  </Button>
                  <a
                    href={cfg.uploadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: cfg.color }}
                  >
                    <ExternalLink className="mr-1 h-3 w-3" /> Open
                  </a>
                  <div className="ml-auto">
                    <Select
                      value={post.status}
                      onValueChange={(v) => onSetStatus(post.id, v as PlatformPostDTO['status'])}
                    >
                      <SelectTrigger className="h-8 w-32 rounded-full text-xs" aria-label={`${cfg.shortName} status`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['READY', 'POSTED', 'CHATTING', 'SOLD'].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s === 'READY' ? 'Ready' : s === 'POSTED' ? 'Posted' : s === 'CHATTING' ? 'Chatting' : 'Sold'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <GuidedQueue
        listing={listing}
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        onSetStatus={onSetStatus}
      />
    </div>
  )
}
