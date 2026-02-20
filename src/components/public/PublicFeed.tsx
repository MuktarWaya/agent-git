'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UnitFilterBar } from './UnitFilterBar'

interface Post {
    id: string
    title: string
    content: string | null
    image_url: string | null
    created_at: string
    unit_id: string
    units: { name: string; cover_image: string | null } | null
}

interface Unit {
    id: string
    name: string
}

interface PublicFeedProps {
    posts: Post[]
    units: Unit[]
}

export function PublicFeed({ posts, units }: PublicFeedProps) {
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const filtered = posts.filter((p) => {
        const matchUnit = selectedUnitId ? p.unit_id === selectedUnitId : true
        const matchSearch = search.trim()
            ? p.title.toLowerCase().includes(search.toLowerCase()) ||
            (p.content ?? '').toLowerCase().includes(search.toLowerCase())
            : true
        return matchUnit && matchSearch
    })

    return (
        <div>
            {/* Filter + Search Bar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <UnitFilterBar
                    units={units}
                    selectedUnitId={selectedUnitId}
                    onSelect={setSelectedUnitId}
                />
                {/* Search */}
                <div className="relative flex-shrink-0 sm:w-56">
                    <svg
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="ค้นหารายงาน..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-full border border-slate-200 bg-white py-1.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition"
                    />
                </div>
            </div>

            {/* Result Count */}
            <p className="mb-4 text-sm text-slate-400">
                แสดง{' '}
                <span className="font-semibold text-slate-700">{filtered.length}</span>{' '}
                รายการ{selectedUnitId ? ` จากหน่วยงาน ${units.find(u => u.id === selectedUnitId)?.name}` : ''}
            </p>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((post) => (
                        <article
                            key={post.id}
                            className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        >
                            {/* Image */}
                            <div className="relative h-44 flex-shrink-0 overflow-hidden bg-slate-100">
                                {post.image_url ? (
                                    <img
                                        src={post.image_url}
                                        alt={post.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                {/* Unit badge */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pt-6 pb-2">
                                    <Link
                                        href={`/unit/${post.unit_id}`}
                                        className="inline-block text-xs font-semibold text-white/90 hover:text-white hover:underline"
                                    >
                                        {post.units?.name ?? 'หน่วยงาน'}
                                    </Link>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex flex-1 flex-col p-5">
                                <h2 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                                    {post.title}
                                </h2>
                                {post.content && (
                                    <p className="mt-2 text-sm text-slate-500 line-clamp-3 leading-relaxed flex-1">
                                        {post.content}
                                    </p>
                                )}
                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <time className="text-xs text-slate-400">
                                        {new Date(post.created_at).toLocaleDateString('th-TH', {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                        })}
                                    </time>
                                    <Link
                                        href={`/unit/${post.unit_id}`}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                                    >
                                        ดูหน่วยงาน →
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
                    <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <p className="mt-3 text-sm font-medium text-slate-500">ไม่พบรายงานที่ตรงกับการค้นหา</p>
                    <button
                        onClick={() => { setSearch(''); setSelectedUnitId(null) }}
                        className="mt-3 text-xs text-indigo-500 hover:underline"
                    >
                        ล้างตัวกรอง
                    </button>
                </div>
            )}
        </div>
    )
}
