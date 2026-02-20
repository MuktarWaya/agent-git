import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PublicFeed } from '@/components/public/PublicFeed'

export const revalidate = 60  // ISR: revalidate every 60 seconds

export default async function Home() {
  const supabase = await createClient()

  // Fetch all posts with unit info
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, content, image_url, created_at, unit_id, units(name, cover_image)')
    .order('created_at', { ascending: false })

  // Fetch all units for filter bar + stats
  const { data: units } = await supabase
    .from('units')
    .select('id, name, address, cover_image')
    .order('name')

  const postList = (posts ?? []) as any[]
  const unitList = (units ?? []) as any[]

  // Stats
  const totalPosts = postList.length
  const totalUnits = unitList.length
  const thisMonth = postList.filter(
    (p) => new Date(p.created_at).getMonth() === new Date().getMonth()
  ).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-20 border-b border-white/20 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800">ศูนย์รายงานหน่วยงาน</span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            เข้าสู่ระบบ Admin
          </Link>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 py-16 sm:py-20">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute bottom-0 -left-12 h-48 w-48 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
              ระบบรายงานผลการดำเนินงาน
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              ศูนย์กลางรายงาน<br className="sm:hidden" />
              <span className="text-indigo-200"> 13 หน่วยงาน</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-indigo-100 leading-relaxed">
              ติดตามผลการดำเนินงาน ข่าวสาร และรายงานล่าสุดจากทุกหน่วยงานในสังกัด ได้ในที่เดียว
            </p>
          </div>

          {/* Stat Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: '🏛️', label: 'หน่วยงาน', value: totalUnits },
              { icon: '📄', label: 'รายงานทั้งหมด', value: totalPosts },
              { icon: '📅', label: 'เดือนนี้', value: thisMonth },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 backdrop-blur-sm">
                <span className="text-lg">{s.icon}</span>
                <span className="text-2xl font-bold text-white">{s.value}</span>
                <span className="text-sm text-indigo-200">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Units Showcase ── */}
      {unitList.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="mb-5 text-base font-bold text-slate-700">หน่วยงานทั้งหมด</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {unitList.map((unit: any) => (
              <Link
                key={unit.id}
                href={`/unit/${unit.id}`}
                className="group flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                style={{ width: '160px' }}
              >
                <div
                  className="h-20 w-full bg-cover bg-center bg-slate-100"
                  style={{ backgroundImage: unit.cover_image ? `url(${unit.cover_image})` : undefined }}
                >
                  {!unit.cover_image && (
                    <div className="flex h-full items-center justify-center">
                      <svg className="h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="px-3 py-2">
                  <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {unit.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Post Feed ── */}
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-base font-bold text-slate-700">รายงานล่าสุด</h2>

        <PublicFeed
          posts={postList}
          units={unitList.map((u: any) => ({ id: u.id, name: u.name }))}
        />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">ศูนย์รายงานหน่วยงาน</span>
            </div>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} ระบบรายงานผลการดำเนินงาน · เข้าถึงได้สาธารณะ
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
