'use client'

import { deletePost } from '@/app/actions/posts'
import { useState } from 'react'

export function DeleteButton({ postId, unitId }: { postId: string; unitId: string }) {
    const [confirming, setConfirming] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        const formData = new FormData()
        formData.set('id', postId)
        formData.set('unit_id', unitId)
        await deletePost(formData)
        setLoading(false)
        setConfirming(false)
    }

    if (confirming) {
        return (
            <span className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">ยืนยันลบ?</span>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition"
                >
                    {loading ? '...' : 'ลบ'}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 transition"
                >
                    ยกเลิก
                </button>
            </span>
        )
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition"
        >
            ลบ
        </button>
    )
}
