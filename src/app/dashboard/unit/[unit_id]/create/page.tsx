'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
    params: { unit_id: string }
}

export default function CreatePostPage({ params }: Props) {
    const { unit_id } = params
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setImage(file)
        if (file) setPreview(URL.createObjectURL(file))
        else setPreview(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        let imageUrl: string | null = null

        if (image) {
            const fileExt = image.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('post_images')
                .upload(fileName, image)

            if (uploadError) {
                setError('อัปโหลดรูปภาพไม่สำเร็จ: ' + uploadError.message)
                setLoading(false)
                return
            }
            imageUrl = supabase.storage.from('post_images').getPublicUrl(fileName).data.publicUrl
        }

        const { error: insertError } = await supabase.from('posts').insert({
            title,
            content,
            image_url: imageUrl,
            unit_id,
        })

        if (insertError) {
            setError('บันทึกโพสต์ไม่สำเร็จ: ' + insertError.message)
            setLoading(false)
        } else {
            router.push(`/dashboard/unit/${unit_id}`)
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-2xl px-4 py-10">
                <div className="mb-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">
                        ← ย้อนกลับ
                    </button>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
                    <h1 className="text-xl font-bold text-slate-900 mb-6">สร้างโพสต์ใหม่</h1>

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">หัวข้อรายงาน *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                placeholder="ระบุหัวข้อรายงาน..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">เนื้อหา *</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={6}
                                className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                                placeholder="รายละเอียดการดำเนินงาน..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">รูปภาพประกอบ (ถ้ามี)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 transition"
                            />
                            {preview && (
                                <img src={preview} alt="preview" className="mt-3 h-40 w-full rounded-lg object-cover border border-slate-200" />
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition"
                            >
                                {loading ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        กำลังบันทึก...
                                    </>
                                ) : 'เผยแพร่โพสต์'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
