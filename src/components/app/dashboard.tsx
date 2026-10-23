'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PLATFORM_IDS, PLATFORMS, formatKRW, conditionKr } from '@/lib/platforms'
import type { ListingDTO } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Plus, Trash2, PackageOpen, Camera } from 'lucide-react'

interface DashboardProps {
  listings: ListingDTO[]
  loading: boolean
  onNew: () => void
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

const POST_DOT_STATUS: Record<string, string> = {
  READY: 'bg-muted-foreground/25',
  POSTED: '',
  CHATTING: '',
  SOLD: '',
}

export function Dashboard({ listings, loading, onNew, onOpen, onDelete }: DashboardProps) {
  const postedCount = listings.reduce(
    (n, l) => n + l.platformPosts.filter((p) => p.status === 'POSTED' || p.status === 'CHATTING').length,
    0
  )
  const soldCount = listings.reduce((n, l) => n + l.platformPosts.filter((p) => p.status === 'SOLD').length, 0)

  return (
    <div className="space-y-6">
      {/* stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Items', value: listings.length },
          { label: 'Live posts', value: postedCount },
          { label: 'Sold', value: soldCount },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-extrabold text-primary">{s.value}</div>
              <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Your items</h2>
        <Button onClick={onNew} className="rounded-full font-semibold shadow-md shadow-orange-600/20">
          <Plus className="mr-1 h-4 w-4" /> New listing
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Card className="rounded-3xl border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
              <PackageOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-bold">Nothing here yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Write your item once — OneShot generates optimized versions for 당근, 번개장터, 중고나라 and
                Craigslist, then walks you through posting everywhere.
              </p>
            </div>
            <Button onClick={onNew} size="lg" className="mt-2 rounded-full font-semibold shadow-md shadow-orange-600/20">
              <Plus className="mr-1 h-4 w-4" /> Create your first listing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <Card
              key={l.id}
              className="group cursor-pointer rounded-2xl border-border/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => onOpen(l.id)}
            >
              <CardContent className="p-0">
                <div className="relative h-36 overflow-hidden rounded-t-2xl bg-muted">
                  {l.images[0] ? (
                    <img src={l.images[0]} alt={l.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Camera className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <button
                    aria-label="Delete listing"
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm('Delete this listing and all platform versions?')) onDelete(l.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {l.status === 'SOLD' && (
                    <span className="absolute left-2 top-2 rounded-full bg-zinc-900/80 px-2 py-0.5 text-xs font-bold text-white">
                      SOLD
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <p className="truncate font-semibold">{l.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-primary">{formatKRW(l.price)}</span>
                    <span className="text-xs text-muted-foreground">· {conditionKr(l.condition)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      {PLATFORM_IDS.map((pid) => {
                        const post = l.platformPosts.find((p) => p.platform === pid)
                        const posted = post && post.status !== 'READY'
                        return (
                          <span
                            key={pid}
                            title={`${PLATFORMS[pid].shortName}: ${post?.status ?? 'READY'}`}
                            className={cn(
                              'h-2.5 w-2.5 rounded-full',
                              POST_DOT_STATUS[post?.status ?? 'READY'] || ''
                            )}
                            style={{
                              backgroundColor: posted ? PLATFORMS[pid].color : undefined,
                              boxShadow: posted ? `0 0 0 3px ${PLATFORMS[pid].color}33` : undefined,
                            }}
                          />
                        )
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground">{l.area}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
