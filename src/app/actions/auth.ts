'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Step 1: Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (authError || !authData.user) {
        return { error: authError?.message ?? 'Login failed' }
    }

    // Step 2: Fetch user profile (role + unit_id) from public.users
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, unit_id')
        .eq('id', authData.user.id)
        .single()

    if (profileError || !profile) {
        return { error: 'User profile not found. Please contact your administrator.' }
    }

    // Step 3: Redirect based on role
    if (profile.role === 'super_admin') {
        redirect('/dashboard/super')
    } else if (profile.role === 'unit_admin') {
        if (!profile.unit_id) {
            return { error: 'Your account is not assigned to any unit. Contact your administrator.' }
        }
        redirect(`/dashboard/unit/${profile.unit_id}`)
    } else {
        // Public role — redirect to homepage
        redirect('/')
    }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
