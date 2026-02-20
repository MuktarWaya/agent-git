'use client'

import { useState } from 'react'
import { PostForm } from './PostForm'
import { DeleteButton } from './DeleteButton'

interface Post {
    id: string
    title: string
    content: string | null
    image_url: string | null
    created_at: string
}

interface PostListProps {
    posts: Post[]
    unitId: string
}

export function PostList({ posts, unitId }: PostListProps) {
    const [editingId, setEditingId] = useState<string | null>(null)

    if (posts.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">ยังไม่มีโพสต์ เริ่มสร้างโพสต์แรกได้เลย</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {posts.map((post) => (
                <div key={post.id} className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden transition hover:shadow">
                    {editingId === post.id ? (
                        /* ── Edit Mode ── */
                        <div className="p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-700">แก้ไขโพสต์</h3>
                            </div>
                            <PostForm
                                unitId={unitId}
                                post={post}
                                onCancel={() => setEditingId(null)}
                            />
                        </div>
                    ) : (
                        /* ── View Mode ── */
                        <div className="flex gap-4 p-4">
                            {/* Thumbnail */}
                            {post.image_url ? (
                                <img
                                    src={post.image_url}
                                    alt={post.title}
                                    className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                    <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex flex-1 flex-col justify-between min-w-0">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 truncate">{post.title}</p>
                                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{post.content}</p>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-slate-400">
                                        {new Date(post.created_at).toLocaleDateString('th-TH', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                        })}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                            เผยแพร่แล้ว
                                        </span>
                                        <button
                                            onClick={() => setEditingId(post.id)}
                                            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                                        >
                                            แก้ไข
                                        </button>
                                        <DeleteButton postId={post.id} unitId={unitId} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
