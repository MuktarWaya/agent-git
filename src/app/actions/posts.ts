'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Create Post ─────────────────────────────────────────────────────────────
export async function createPost(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const unit_id = formData.get('unit_id') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const imageFile = formData.get('image') as File | null

    let image_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        const ext = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
            .from('post_images')
            .upload(fileName, imageFile)

        if (uploadError) return { error: 'Image upload failed: ' + uploadError.message }

        image_url = supabase.storage.from('post_images').getPublicUrl(fileName).data.publicUrl
    }

    const { error } = await supabase.from('posts').insert({ unit_id, title, content, image_url })
    if (error) return { error: error.message }

    revalidatePath(`/admin/${unit_id}/dashboard`)
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
    const imageFile = formData.get('image') as File | null

    let image_url = currentImageUrl || null

    if (imageFile && imageFile.size > 0) {
        const ext = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
            .from('post_images')
            .upload(fileName, imageFile)

        if (uploadError) return { error: 'Image upload failed: ' + uploadError.message }

        image_url = supabase.storage.from('post_images').getPublicUrl(fileName).data.publicUrl
    }

    const { error } = await supabase
        .from('posts')
        .update({ title, content, image_url })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath(`/admin/${unit_id}/dashboard`)
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

    revalidatePath(`/admin/${unit_id}/dashboard`)
    return { success: true }
}
