'use client'

import { useCallback, useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import { Dashboard } from '@/components/app/dashboard'
import { ListingForm } from '@/components/app/listing-form'
import { Workspace } from '@/components/app/workspace'
import { useToast } from '@/hooks/use-toast'
import { PLATFORMS, PlatformId } from '@/lib/platforms'
import type { ListingDTO, PlatformPostDTO } from '@/lib/types'

type View = { name: 'dashboard' } | { name: 'form' } | { name: 'workspace'; listingId: string }

export default function Home() {
  const [view, setView] = useState<View>({ name: 'dashboard' })
  const [listings, setListings] = useState<ListingDTO[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch('/api/listings')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setListings(data.listings)
    } catch (e) {
      toast({
        title: 'Could not load listings',
        description: e instanceof Error ? e.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const applyUpdatedPost = useCallback((postId: string, status: PlatformPostDTO['status']) => {
    setListings((prev) =>
      prev.map((l) => ({
        ...l,
        platformPosts: l.platformPosts.map((p) =>
          p.id === postId ? { ...p, status, postedAt: status === 'POSTED' ? new Date().toISOString() : p.postedAt } : p
        ),
      }))
    )
    fetch('/api/platform-posts/' + postId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {
      toast({ title: 'Status sync failed', description: 'Check your connection and retry', variant: 'destructive' })
    })
  }, [toast])

  const handleRegenerate = useCallback(
    async (listingId: string, platform: PlatformId) => {
      try {
        const res = await fetch(`/api/listings/${listingId}/regenerate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Rewrite failed')
        setListings((prev) =>
          prev.map((l) =>
            l.id === listingId
              ? {
                  ...l,
                  platformPosts: l.platformPosts.map((p) =>
                    p.id === data.post.id ? { ...p, title: data.post.title, content: data.post.content } : p
                  ),
                }
              : l
          )
        )
        toast({ title: `${PLATFORMS[platform].shortName} version rewritten${data.aiUsed ? ' with AI' : ''}` })
      } catch (e) {
        toast({
          title: 'Rewrite failed',
          description: e instanceof Error ? e.message : 'Please try again',
          variant: 'destructive',
        })
      }
    },
    [toast]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      setListings((prev) => prev.filter((l) => l.id !== id))
      try {
        const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Delete failed')
        toast({ title: 'Listing deleted' })
      } catch {
        toast({ title: 'Delete failed', variant: 'destructive' })
        fetchListings()
      }
    },
    [toast, fetchListings]
  )

  const activeListing =
    view.name === 'workspace' ? listings.find((l) => l.id === view.listingId) ?? null : null

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50/60 to-background dark:from-orange-950/10">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-4 py-3">
          <button
            className="flex items-center gap-2.5"
            onClick={() => setView({ name: 'dashboard' })}
            aria-label="OneShot home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-orange-600/25">
              <Zap className="h-5 w-5 text-white" fill="currentColor" />
            </span>
            <span className="text-left">
              <span className="block text-lg font-extrabold leading-none">OneShot</span>
              <span className="block text-[11px] font-medium text-muted-foreground">Write once. Post everywhere.</span>
            </span>
          </button>
          <span className="ml-auto hidden items-center gap-2 text-[11px] font-medium text-muted-foreground sm:flex">
            {(['KARROT', 'BUNJANG', 'JOONGGONARA', 'CLSEOUL'] as PlatformId[]).map((pid) => (
              <span key={pid} className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLATFORMS[pid].color }} />
                {PLATFORMS[pid].shortName}
              </span>
            ))}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {view.name === 'dashboard' && (
          <Dashboard
            listings={listings}
            loading={loading}
            onNew={() => setView({ name: 'form' })}
            onOpen={(id) => setView({ name: 'workspace', listingId: id })}
            onDelete={handleDelete}
          />
        )}
        {view.name === 'form' && (
          <ListingForm
            onCancel={() => setView({ name: 'dashboard' })}
            onCreated={(listing) => {
              setListings((prev) => [listing, ...prev])
              setView({ name: 'workspace', listingId: listing.id })
              toast({ title: '4 platform versions ready 🎉', description: 'Run the posting queue now.' })
            }}
          />
        )}
        {view.name === 'workspace' && activeListing && (
          <Workspace
            listing={activeListing}
            onBack={() => setView({ name: 'dashboard' })}
            onSetStatus={applyUpdatedPost}
            onRegenerate={(platform) => handleRegenerate(activeListing.id, platform)}
          />
        )}
      </main>

      <footer className="mt-auto border-t border-border/60 bg-background">
        <div className="mx-auto max-w-5xl px-4 py-3 text-center text-[11px] leading-relaxed text-muted-foreground">
          v0 prototype · assisted posting only (no bots — accounts stay safe) · 당근 · 번개장터 · 중고나라 · Craigslist Seoul
        </div>
      </footer>
    </div>
  )
}
