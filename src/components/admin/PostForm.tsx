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
    const [imageMode, setImageMode] = useState<'url' | 'file'>(
        post?.image_url && !post.image_url.includes('supabase') ? 'url' : 'url'
    )
    const [urlInput, setUrlInput] = useState<string>(
        isEdit && post?.image_url ? post.image_url : ''
    )
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const formRef = useRef<HTMLFormElement>(null)
    const router = useRouter()

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
        setUrlInput(url)
        if (url.trim()) {
            // แสดง preview ทันทีเมื่อวาง URL
            if (url.includes('drive.google.com')) {
                // แปลง Google Drive link เป็น direct image URL สำหรับ preview
                const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
                const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
                const fileId = fileMatch?.[1] || idMatch?.[1]
                if (fileId) {
                    setPreview(`https://lh3.googleusercontent.com/d/${fileId}`)
                } else {
                    setPreview(url)
                }
            } else {
                setPreview(url)
            }
        } else {
            setPreview(null)
        }
    }

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
                else {
                    formRef.current?.reset()
                    setPreview(null)
                    setUrlInput('')
                }
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

            {/* ── Image Section ── */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    รูปภาพประกอบ
                </label>

                {/* Tab Toggle */}
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 mb-3">
                    <button
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${imageMode === 'url'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        📎 วาง URL (Google Drive)
                    </button>
                    <button
                        type="button"
                        onClick={() => setImageMode('file')}
                        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${imageMode === 'file'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        📁 เลือกไฟล์
                    </button>
                </div>

                {imageMode === 'url' ? (
                    <div>
                        <input
                            name="image_url_input"
                            type="url"
                            value={urlInput}
                            onChange={handleUrlChange}
                            placeholder="วางลิงก์ Google Drive ที่นี่ เช่น https://drive.google.com/file/d/..."
                            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                        />
                        <p className="mt-1 text-xs text-slate-400">
                            💡 วิธีใช้: เปิดรูปใน Google Drive → คลิกขวา → แชร์ → คัดลอกลิงก์ → วางที่นี่
                        </p>
                    </div>
                ) : (
                    <div>
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 transition"
                        />
                        <p className="mt-1 text-xs text-slate-400">
                            ⚠️ ขนาดไฟล์ไม่เกิน 4MB (แนะนำใช้วาง URL แทนเพื่อประหยัดพื้นที่)
                        </p>
                    </div>
                )}

                {preview && (
                    <div className="mt-2 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
