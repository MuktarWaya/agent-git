import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*, units(name, cover_image)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Centralized Reports
          </h1>
          <Link
            href="/login"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Admin Login
          </Link>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {posts && posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: any) => (
                <div key={post.id} className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-lg">
                  {post.image_url ? (
                    <img
                      className="h-48 w-full object-cover"
                      src={post.image_url}
                      alt={post.title}
                    />
                  ) : (
                    <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/unit/${post.unit_id}`}
                        className="text-sm font-bold text-indigo-600 hover:underline"
                      >
                        {post.units?.name || 'Unknown Unit'}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                        {post.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No posts yet</h3>
              <p className="mt-1 text-sm text-gray-500">Check back later for updates from the agencies.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
