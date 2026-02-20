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
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <UnitFilterBar
                    units={units}
                    selectedUnitId={selectedUnitId}
                    onSelect={setSelectedUnitId}
                />
                {/* Search */}
                <div className="relative flex-shrink-0 sm:w-64">
                    <svg
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="ค้นหารายงาน..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm backdrop-blur-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all"
                    />
                </div>
            </div>

            {/* Result Count */}
            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                    แสดง{' '}
                    <span className="font-bold text-slate-700">{filtered.length}</span>{' '}
                    รายการ{selectedUnitId ? ` จาก ${units.find(u => u.id === selectedUnitId)?.name}` : ''}
                </p>
                {(selectedUnitId || search) && (
                    <button
                        onClick={() => { setSearch(''); setSelectedUnitId(null) }}
                        className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                        ล้างตัวกรอง ✕
                    </button>
                )}
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((post, i) => (
                        <article
                            key={post.id}
                            className="card-hover group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            {/* Image */}
                            <div className="relative h-48 flex-shrink-0 overflow-hidden bg-gradient-to-br from-indigo-50 to-violet-50">
                                {post.image_url ? (
                                    <img
                                        src={post.image_url}
                                        alt={post.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                                            <svg className="h-8 w-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                {/* Unit badge */}
                                <div className="absolute top-3 left-3">
                                    <Link
                                        href={`/unit/${post.unit_id}`}
                                        className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white transition-colors"
                                    >
                                        {post.units?.name ?? 'หน่วยงาน'}
                                    </Link>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex flex-1 flex-col p-5">
                                <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                                    {post.title}
                                </h3>
                                {post.content && (
                                    <p className="mt-2 text-sm text-slate-500 line-clamp-3 leading-relaxed flex-1">
                                        {post.content}
                                    </p>
                                )}
                                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                                    <time className="text-xs text-slate-400 font-medium">
                                        {new Date(post.created_at).toLocaleDateString('th-TH', {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                        })}
                                    </time>
                                    <Link
                                        href={`/unit/${post.unit_id}`}
                                        className="group/link flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                        ดูหน่วยงาน
                                        <svg className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-white to-slate-50 py-24 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                        <svg className="h-8 w-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-500">ไม่พบรายงานที่ตรงกับการค้นหา</p>
                    <p className="mt-1 text-xs text-slate-400">ลองเปลี่ยนตัวกรองหรือคำค้นหาดูใหม่</p>
                    <button
                        onClick={() => { setSearch(''); setSelectedUnitId(null) }}
                        className="mt-4 rounded-full bg-indigo-50 px-5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                    >
                        ล้างตัวกรองทั้งหมด
                    </button>
                </div>
            )}
        </div>
    )
}
