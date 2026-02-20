'use client'

import { useRouter } from 'next/navigation'
import { PostForm } from '@/components/admin/PostForm'

interface Props {
    unitId: string
}

export function CreatePostForm({ unitId }: Props) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-2xl px-4 py-10">
                <div className="mb-6 flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        ย้อนกลับ
                    </button>
                    <div className="h-4 w-px bg-slate-300 mx-1" />
                    <span className="text-sm text-slate-400 font-medium">เพิ่มรายงานใหม่</span>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-slate-900">สร้างโพสต์ใหม่</h1>
                        <p className="text-sm text-slate-500 mt-1">กรอกข้อมูลรายงานการดำเนินงานของหน่วยงาน</p>
                        <p className="text-xs text-indigo-600 mt-0.5 font-mono">unit_id: {unitId}</p>
                    </div>

                    <PostForm
                        unitId={unitId}
                        onCancel={() => router.back()}
                    />
                </div>
            </div>
        </div>
    )
}
