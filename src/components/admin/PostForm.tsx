'use client'

import { useRef, useState, useTransition } from 'react'
import { createPost, updatePost } from '@/app/actions/posts'
import { useRouter } from 'next/navigation'

interface Post {
    id: string
    title: string
    content: string | null
    image_url: string | null
}

interface PostFormProps {
    unitId: string
    post?: Post          // if provided → edit mode
    onCancel?: () => void
}

export function PostForm({ unitId, post, onCancel }: PostFormProps) {
    const isEdit = !!post
    const [preview, setPreview] = useState<string | null>(post?.image_url ?? null)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const formRef = useRef<HTMLFormElement>(null)
    const router = useRouter()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) setPreview(URL.createObjectURL(file))
        else setPreview(post?.image_url ?? null)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(formRef.current!)
        setError(null)

        startTransition(async () => {
            const result = isEdit
                ? await updatePost(formData)
                : await createPost(formData)

            if (result?.error) {
                setError(result.error)
            } else {
                router.refresh()
                if (onCancel) onCancel()
                else formRef.current?.reset()
            }
        })
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Hidden fields */}
            <input type="hidden" name="unit_id" value={unitId} />
            {isEdit && <input type="hidden" name="id" value={post.id} />}
            {isEdit && (
                <input type="hidden" name="current_image_url" value={post.image_url ?? ''} />
            )}

            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    หัวข้อรายงาน <span className="text-red-500">*</span>
                </label>
                <input
                    name="title"
                    type="text"
                    required
                    defaultValue={post?.title}
                    placeholder="ระบุหัวข้อรายงาน..."
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    เนื้อหา <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="content"
                    required
                    rows={5}
                    defaultValue={post?.content ?? ''}
                    placeholder="รายละเอียดการดำเนินงานของหน่วยงาน..."
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    รูปภาพประกอบ {isEdit && <span className="text-slate-400 font-normal">(เว้นว่างถ้าไม่ต้องการเปลี่ยน)</span>}
                </label>
                <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 transition"
                />
                {preview && (
                    <div className="mt-2 relative">
                        <img src={preview} alt="preview" className="h-40 w-full rounded-lg object-cover border border-slate-200" />
                        {isEdit && (
                            <span className="absolute top-2 left-2 rounded bg-black/40 px-2 py-0.5 text-xs text-white">
                                รูปปัจจุบัน
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
                    >
                        ยกเลิก
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition"
                >
                    {isPending ? (
                        <>
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            กำลังบันทึก...
                        </>
                    ) : isEdit ? 'บันทึกการแก้ไข' : 'เผยแพร่โพสต์'}
                </button>
            </div>
        </form>
    )
}
