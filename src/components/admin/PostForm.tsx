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
    post?: Post
    onCancel?: () => void
}

export function PostForm({ unitId, post, onCancel }: PostFormProps) {
    const isEdit = !!post
    const [preview, setPreview] = useState<string | null>(post?.image_url ?? null)
    const [urlInput, setUrlInput] = useState<string>(
        isEdit && post?.image_url ? post.image_url : ''
    )
    const [isValidUrl, setIsValidUrl] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const formRef = useRef<HTMLFormElement>(null)
    const router = useRouter()

    const validateGDriveUrl = (url: string): boolean => {
        if (!url.trim()) return false
        // Accept Google Drive links or any direct image URL
        return url.includes('drive.google.com') || url.match(/^https?:\/\/.+/) !== null
    }

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
        setUrlInput(url)
        setIsValidUrl(validateGDriveUrl(url))

        if (url.trim()) {
            if (url.includes('drive.google.com')) {
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
                    setIsValidUrl(false)
                }
            }
        })
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            {/* Hidden fields */}
            <input type="hidden" name="unit_id" value={unitId} />
            {isEdit && <input type="hidden" name="id" value={post.id} />}
            {isEdit && (
                <input type="hidden" name="current_image_url" value={post.image_url ?? ''} />
            )}

            {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Title */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    หัวข้อรายงาน <span className="text-red-500">*</span>
                </label>
                <input
                    name="title"
                    type="text"
                    required
                    defaultValue={post?.title}
                    placeholder="ระบุหัวข้อรายงาน..."
                    className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
            </div>

            {/* Content */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    เนื้อหา <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="content"
                    required
                    rows={5}
                    defaultValue={post?.content ?? ''}
                    placeholder="รายละเอียดการดำเนินงานของหน่วยงาน..."
                    className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition"
                />
            </div>

            {/* ── Google Drive URL ── */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    รูปภาพจาก Google Drive
                </label>

                <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <input
                        name="image_url_input"
                        type="url"
                        value={urlInput}
                        onChange={handleUrlChange}
                        placeholder="วางลิงก์ Google Drive ที่นี่..."
                        className={`block w-full rounded-xl border px-4 py-2.5 pl-10 pr-10 text-sm shadow-sm focus:outline-none transition ${urlInput.trim()
                                ? isValidUrl
                                    ? 'border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                                    : 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                                : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                            }`}
                    />
                    {urlInput.trim() && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            {isValidUrl ? (
                                <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="mt-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 px-3.5 py-2.5">
                    <p className="text-xs font-semibold text-indigo-700 mb-1">📌 วิธีใช้ Google Drive</p>
                    <ol className="text-xs text-indigo-600/80 space-y-0.5 list-decimal list-inside">
                        <li>อัปโหลดรูปขึ้น Google Drive</li>
                        <li>คลิกขวา → แชร์ → เปลี่ยนเป็น <strong>&ldquo;ทุกคนที่มีลิงก์&rdquo;</strong></li>
                        <li>คัดลอกลิงก์มาวางที่นี่</li>
                    </ol>
                </div>
            </div>

            {/* Image Preview */}
            {preview && (
                <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={preview}
                        alt="preview"
                        className="h-48 w-full object-cover"
                        onError={() => setPreview(null)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {isEdit && (
                        <span className="absolute top-2 left-2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            รูปปัจจุบัน
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => { setPreview(null); setUrlInput(''); setIsValidUrl(false) }}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                        ยกเลิก
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100 transition-all"
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
