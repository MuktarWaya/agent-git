import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { PostList } from '@/components/admin/PostList'
import { PostForm } from '@/components/admin/PostForm'

type Props = {
    params: Promise<{ unit_id: string }>
}

export default async function AdminDashboard({ params }: Props) {
    const { unit_id } = await params
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Verify access to this unit
    const { data: profile } = await supabase
        .from('users')
        .select('role, unit_id')
        .eq('id', user.id)
        .single()

    if (!profile) redirect('/login')

    const isSuperAdmin = profile.role === 'super_admin'
    const isUnitAdmin = profile.role === 'unit_admin' && profile.unit_id === unit_id

    if (!isSuperAdmin && !isUnitAdmin) {
        // Redirect unit_admin to their own dashboard
        if (profile.role === 'unit_admin' && profile.unit_id) {
            redirect(`/admin/${profile.unit_id}/dashboard`)
        }
        redirect('/')
    }

    // Fetch unit info
    const { data: unit } = await supabase
        .from('units')
        .select('id, name, address, cover_image')
        .eq('id', unit_id)
        .single()

    if (!unit) redirect('/')

    // Fetch posts for this unit
    const { data: posts } = await supabase
        .from('posts')
        .select('id, title, content, image_url, created_at')
        .eq('unit_id', unit_id)
        .order('created_at', { ascending: false })

    const postList = posts ?? []

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ── Top Navigation ── */}
            <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div className="leading-tight">
                            <p className="text-[11px] uppercase tracking-widest text-slate-400">Admin Panel</p>
                            <p className="text-sm font-bold text-slate-800">{unit.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/" className="hidden text-sm text-slate-500 hover:text-slate-700 sm:block">
                            ← หน้าหลัก
                        </Link>
                        {isSuperAdmin && (
                            <Link
                                href="/dashboard/super"
                                className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 transition"
                            >
                                Super Admin
                            </Link>
                        )}
                        <form action={logout}>
                            <button
                                type="submit"
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition"
                            >
                                ออกจากระบบ
                            </button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* ── Header ── */}
                <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">จัดการโพสต์</h1>
                        <p className="text-sm text-slate-500">
                            {unit.address || 'หน่วยงาน'} · {postList.length} รายการ
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                            {isSuperAdmin ? 'Super Admin' : 'Unit Admin'}
                        </span>
                        {user.email}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* ── Left: Post List ── */}
                    <div className="lg:col-span-2">
                        {/* Summary Stats */}
                        <div className="mb-4 grid grid-cols-3 gap-3">
                            {[
                                { label: 'ทั้งหมด', value: postList.length, color: 'bg-indigo-50 text-indigo-700' },
                                { label: 'เดือนนี้', value: postList.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).length, color: 'bg-emerald-50 text-emerald-700' },
                                { label: 'มีรูปภาพ', value: postList.filter(p => p.image_url).length, color: 'bg-amber-50 text-amber-700' },
                            ].map((stat) => (
                                <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs font-medium opacity-80">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        <h2 className="mb-3 text-base font-semibold text-slate-800">รายการโพสต์</h2>
                        <PostList posts={postList} unitId={unit_id} />
                    </div>

                    {/* ── Right: Create Post Form ── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-1 text-base font-bold text-slate-900">+ สร้างโพสต์ใหม่</h2>
                            <p className="mb-5 text-xs text-slate-400">เพิ่มรายงานการดำเนินงานของหน่วยงาน</p>
                            <PostForm unitId={unit_id} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
