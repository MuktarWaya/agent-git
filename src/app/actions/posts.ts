'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { convertGDriveUrl } from '@/lib/gdrive'

// ─── Create Post ─────────────────────────────────────────────────────────────
export async function createPost(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const unit_id = formData.get('unit_id') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const imageUrlInput = formData.get('image_url_input') as string | null

    let image_url: string | null = null

    // แปลง Google Drive link เป็น direct image URL
    if (imageUrlInput && imageUrlInput.trim()) {
        image_url = convertGDriveUrl(imageUrlInput.trim())
    }

    const { error } = await supabase.from('posts').insert({ unit_id, title, content, image_url })
    if (error) return { error: error.message }

    revalidatePath(`/dashboard/unit/${unit_id}`)
    revalidatePath('/')
    return { success: true }
}

// ─── Update Post ─────────────────────────────────────────────────────────────
export async function updatePost(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const id = formData.get('id') as string
    const unit_id = formData.get('unit_id') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const currentImageUrl = formData.get('current_image_url') as string | null
    const imageUrlInput = formData.get('image_url_input') as string | null

    let image_url = currentImageUrl || null

    // แปลง Google Drive link เป็น direct image URL (ถ้ามี URL ใหม่)
    if (imageUrlInput && imageUrlInput.trim()) {
        image_url = convertGDriveUrl(imageUrlInput.trim())
    }

    const { error } = await supabase
        .from('posts')
        .update({ title, content, image_url })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/unit/${unit_id}`)
    revalidatePath('/')
    return { success: true }
}

// ─── Delete Post ─────────────────────────────────────────────────────────────
export async function deletePost(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const id = formData.get('id') as string
    const unit_id = formData.get('unit_id') as string

    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath(`/dashboard/unit/${unit_id}`)
    revalidatePath('/')
    return { success: true }
}
