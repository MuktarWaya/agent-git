import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default async function SuperAdminDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Verify super_admin role
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') redirect('/')

    // Fetch all units with post counts
    const { data: units } = await supabase
        .from('units')
        .select('id, name, address, cover_image')
        .order('name')

    // Fetch all unit_admin users
    const { data: adminUsers } = await supabase
        .from('users')
        .select('id, role, unit_id')
        .eq('role', 'unit_admin')

    const adminsByUnit = (adminUsers ?? []).reduce<Record<string, number>>((acc, u) => {
        if (u.unit_id) acc[u.unit_id] = (acc[u.unit_id] ?? 0) + 1
        return acc
    }, {})

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 leading-none">Super Admin</p>
                            <p className="text-sm font-semibold text-slate-800 leading-tight">จัดการระบบ</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">ดูหน้าหลัก</Link>
                        <form action={logout}>
                            <button type="submit" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition">
                                ออกจากระบบ
                            </button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">ภาพรวมทุกหน่วยงาน</h1>
                        <p className="text-sm text-slate-500 mt-0.5">จัดการ {units?.length ?? 0} หน่วยงานในระบบ</p>
                    </div>
                </div>

                {/* Units Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {units?.map((unit) => (
                        <div key={unit.id} className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition group">
                            {/* Cover */}
                            <div
                                className="h-36 bg-cover bg-center bg-slate-100"
                                style={{ backgroundImage: unit.cover_image ? `url(${unit.cover_image})` : undefined }}
                            >
                                {!unit.cover_image && (
                                    <div className="h-full flex items-center justify-center">
                                        <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-slate-800 text-sm">{unit.name}</h3>
                                {unit.address && <p className="text-xs text-slate-400 mt-0.5 truncate">{unit.address}</p>}
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">
                                        Admin: <span className="font-medium text-slate-700">{adminsByUnit[unit.id] ?? 0} คน</span>
                                    </span>
                                    <Link
                                        href={`/dashboard/unit/${unit.id}`}
                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                                    >
                                        ดู Dashboard →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
