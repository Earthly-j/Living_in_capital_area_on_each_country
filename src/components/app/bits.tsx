'use client'

import { Badge } from '@/components/ui/badge'
import { PLATFORMS, PlatformId } from '@/lib/platforms'
import { STATUS_LABELS } from '@/lib/types'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PlatformChip({ platform, className }: { platform: PlatformId; className?: string }) {
  const p = PLATFORMS[platform]
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', className)}
      style={{ color: p.color }}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
      {p.shortName}
    </span>
  )
}

const STATUS_STYLES: Record<string, string> = {
  READY: 'bg-muted text-muted-foreground',
  POSTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  CHATTING: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  SOLD: 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="secondary" className={cn('rounded-full px-2.5 font-semibold', STATUS_STYLES[status], className)}>
      {status === 'POSTED' && <Check className="mr-0.5 h-3 w-3" />}
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

export function ModeBadge({ mode }: { mode: 'assist' | 'api-ready' }) {
  return mode === 'api-ready' ? (
    <Badge className="rounded-full bg-emerald-600 px-2 text-[10px] font-bold uppercase tracking-wide text-white">
      API auto v1
    </Badge>
  ) : (
    <Badge variant="outline" className="rounded-full px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      1-click assist
    </Badge>
  )
}
