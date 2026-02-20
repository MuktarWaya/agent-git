import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { UserRole } from '@/types'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Create a response we can modify
    let response = NextResponse.next({ request })

    // Create a Supabase client that can read/write cookies on the response
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session — MUST be called before any auth check
    const { data: { user } } = await supabase.auth.getUser()

    // ─── Route Protection Rules ───────────────────────────────────────────────

    // 1. /dashboard/* requires authentication
    if (pathname.startsWith('/dashboard')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // 2. Fetch user profile for role/unit_id check
        const { data: profile } = await supabase
            .from('users')
            .select('role, unit_id')
            .eq('id', user.id)
            .single()

        const role = profile?.role as UserRole | undefined
        const unitId = profile?.unit_id as string | undefined

        // 3. /dashboard/super requires super_admin
        if (pathname.startsWith('/dashboard/super')) {
            if (role !== 'super_admin') {
                // Redirect unit_admin to their own dashboard, others to home
                if (role === 'unit_admin' && unitId) {
                    return NextResponse.redirect(new URL(`/dashboard/unit/${unitId}`, request.url))
                }
                return NextResponse.redirect(new URL('/', request.url))
            }
        }

        // 4. /dashboard/unit/[id] — unit_admin can ONLY access their own unit_id
        const unitDashboardMatch = pathname.match(/^\/dashboard\/unit\/([^/]+)/)
        if (unitDashboardMatch) {
            const requestedUnitId = unitDashboardMatch[1]

            if (role === 'super_admin') {
                // Super admin can view any unit — allow through
            } else if (role === 'unit_admin') {
                // Unit admin can only access their own unit
                if (unitId !== requestedUnitId) {
                    return NextResponse.redirect(
                        new URL(unitId ? `/dashboard/unit/${unitId}` : '/', request.url)
                    )
                }
            } else {
                // Public role — no dashboard access
                return NextResponse.redirect(new URL('/', request.url))
            }
        }

        // 5. /dashboard (root) — redirect based on role
        if (pathname === '/dashboard' || pathname === '/dashboard/') {
            if (role === 'super_admin') {
                return NextResponse.redirect(new URL('/dashboard/super', request.url))
            } else if (role === 'unit_admin' && unitId) {
                return NextResponse.redirect(new URL(`/dashboard/unit/${unitId}`, request.url))
            } else {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }
    }

    // 6. Redirect already-logged-in users away from /login
    if (pathname === '/login' && user) {
        const { data: profile } = await supabase
            .from('users')
            .select('role, unit_id')
            .eq('id', user.id)
            .single()

        const role = profile?.role as UserRole | undefined
        const unitId = profile?.unit_id as string | undefined

        if (role === 'super_admin') {
            return NextResponse.redirect(new URL('/dashboard/super', request.url))
        } else if (role === 'unit_admin' && unitId) {
            return NextResponse.redirect(new URL(`/dashboard/unit/${unitId}`, request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all paths EXCEPT:
         * - _next/static, _next/image (Next.js internals)
         * - favicon.ico
         * - Static file extensions
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
