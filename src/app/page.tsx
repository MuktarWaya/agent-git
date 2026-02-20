import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PublicFeed } from '@/components/public/PublicFeed'

export const revalidate = 60

export default async function Home() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, content, image_url, created_at, unit_id, units(name, cover_image)')
    .order('created_at', { ascending: false })

  const { data: units } = await supabase
    .from('units')
    .select('id, name, address, cover_image')
    .order('name')

  const postList = (posts ?? []) as any[]
  const unitList = (units ?? []) as any[]

  const totalPosts = postList.length
  const totalUnits = unitList.length
  const thisMonth = postList.filter(
    (p) => new Date(p.created_at).getMonth() === new Date().getMonth()
  ).length

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ══════════════════════════════════════════
          NAVBAR — Glassmorphism sticky nav
      ══════════════════════════════════════════ */}
      <header className="glass sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">ศูนย์รายงาน</span>
              <span className="ml-1.5 hidden text-xs font-medium text-slate-400 sm:inline">หน่วยงาน</span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="#units"
              className="hidden sm:inline-flex text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              หน่วยงาน
            </Link>
            <Link
              href="#reports"
              className="hidden sm:inline-flex text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              รายงาน
            </Link>
            <Link
              href="/login"
              className="relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Admin
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          HERO — Bold gradient section
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-24 sm:py-32 lg:py-36">
        {/* Animated background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-0 -left-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl animate-pulse-soft delay-200" />
          <div className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-500/5 blur-3xl animate-pulse-soft delay-400" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-medium text-slate-300">ระบบรายงานผลการดำเนินงาน</span>
            </div>

            {/* Title */}
            <h1 className="animate-fade-in-up delay-100 mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-white">ศูนย์กลาง</span>
              <br />
              <span className="gradient-text">รายงาน 13 หน่วยงาน</span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              ติดตามผลการดำเนินงาน ข่าวสาร และรายงานล่าสุดจากทุกหน่วยงานในสังกัด ได้ในที่เดียว
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up delay-300 mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#reports"
                className="rounded-full bg-white px-8 py-3 text-sm font-bold text-slate-900 shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                ดูรายงานทั้งหมด
              </a>
              <a
                href="#units"
                className="group flex items-center gap-2 rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 transition-all"
              >
                สำรวจหน่วยงาน
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Stat Chips ── */}
          <div className="animate-fade-in-up delay-400 mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: '🏛️', value: totalUnits, label: 'หน่วยงาน', color: 'from-indigo-500/20 to-indigo-500/5' },
              { icon: '📄', value: totalPosts, label: 'รายงานทั้งหมด', color: 'from-violet-500/20 to-violet-500/5' },
              { icon: '📅', value: thisMonth, label: 'เดือนนี้', color: 'from-amber-500/20 to-amber-500/5' },
            ].map((s) => (
              <div
                key={s.label}
                className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br ${s.color} border border-white/10 px-6 py-3 backdrop-blur-sm`}
              >
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="text-3xl font-extrabold text-white">{s.value}</div>
                  <div className="text-xs font-medium text-slate-400">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          UNITS SHOWCASE
      ══════════════════════════════════════════ */}
      {unitList.length > 0 && (
        <section id="units" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="animate-fade-in-up flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
                หน่วยงานทั้งหมด
              </h2>
              <p className="mt-2 text-sm text-slate-500">เลือกหน่วยงานเพื่อดูรายงานและข้อมูลเพิ่มเติม</p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-400">
              <span className="font-bold text-indigo-600">{totalUnits}</span> หน่วยงาน
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
            {unitList.map((unit: any, i: number) => (
              <Link
                key={unit.id}
                href={`/unit/${unit.id}`}
                className="card-hover group flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                style={{
                  width: '200px',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-50">
                  {unit.cover_image ? (
                    <img
                      src={unit.cover_image}
                      alt={unit.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                        <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="px-4 py-3">
                  <p className="truncate text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {unit.name}
                  </p>
                  {unit.address && (
                    <p className="mt-0.5 truncate text-xs text-slate-400">{unit.address}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          POST FEED
      ══════════════════════════════════════════ */}
      <section id="reports" className="bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="animate-fade-in-up flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
                รายงานล่าสุด
              </h2>
              <p className="mt-2 text-sm text-slate-500">อัปเดตผลการดำเนินงานจากทุกหน่วยงาน</p>
            </div>
          </div>

          <PublicFeed
            posts={postList}
            units={unitList.map((u: any) => ({ id: u.id, name: u.name }))}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-0 -left-20 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            เป็นส่วนหนึ่งของระบบรายงาน
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-indigo-100 leading-relaxed">
            Admin หน่วยงานสามารถเข้าสู่ระบบเพื่อสร้าง แก้ไข และจัดการรายงานได้ทันที
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-indigo-700 shadow-xl shadow-indigo-900/20 hover:shadow-indigo-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              เข้าสู่ระบบ Admin
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="gradient-border bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-bold text-white">ศูนย์รายงานหน่วยงาน</span>
                <p className="text-xs text-slate-500">ระบบรายงานผลการดำเนินงาน</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link href="#units" className="text-xs text-slate-400 hover:text-white transition-colors">หน่วยงาน</Link>
              <Link href="#reports" className="text-xs text-slate-400 hover:text-white transition-colors">รายงาน</Link>
              <Link href="/login" className="text-xs text-slate-400 hover:text-white transition-colors">Admin</Link>
            </div>

            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} เข้าถึงได้สาธารณะ
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
