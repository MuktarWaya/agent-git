import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'

type Props = {
    params: Promise<{ unit_id: string }>
}

export default async function UnitAdminDashboard({ params }: Props) {
    const { unit_id } = await params
    const supabase = await createClient()

    // Verify the current session (middleware already validated, but double-check in UI)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch unit info
    const { data: unit } = await supabase
        .from('units')
        .select('id, name, address, cover_image')
        .eq('id', unit_id)
        .single()

    if (!unit) redirect('/login')

    // Fetch posts for this unit
    const { data: posts } = await supabase
        .from('posts')
        .select('id, title, content, image_url, created_at')
        .eq('unit_id', unit_id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 leading-none">Dashboard</p>
                            <p className="text-sm font-semibold text-slate-800 leading-tight">{unit.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">ดูหน้าหลัก</Link>
                        <form action={logout}>
                            <button type="submit" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition">
                                ออกจากระบบ
                            </button>
                        </form>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{unit.name}</h1>
                        {unit.address && <p className="text-sm text-slate-500 mt-0.5">{unit.address}</p>}
                    </div>
                    <Link
                        href={`/dashboard/unit/${unit_id}/create`}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        สร้างโพสต์ใหม่
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
                        <p className="text-sm text-slate-500">โพสต์ทั้งหมด</p>
                        <p className="text-3xl font-bold text-indigo-600 mt-1">{posts?.length ?? 0}</p>
                    </div>
                </div>

                {/* Posts List */}
                <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-semibold text-slate-800">รายการโพสต์</h2>
                    </div>

                    {posts && posts.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                            {posts.map((post) => (
                                <li key={post.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition group">
                                    {post.image_url ? (
                                        <img src={post.image_url} alt="" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{post.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 truncate">{post.content}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-xs text-slate-400">
                                            {new Date(post.created_at).toLocaleDateString('th-TH')}
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                            เผยแพร่แล้ว
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="py-16 text-center">
                            <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <p className="mt-3 text-sm text-slate-500">ยังไม่มีโพสต์ในหน่วยงานนี้</p>
                            <Link
                                href={`/dashboard/unit/${unit_id}/create`}
                                className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                            >
                                สร้างโพสต์แรก
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
