import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Correct type for Next.js App Router Page Props
type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UnitPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch unit details
    const { data: unit } = await supabase
        .from('units')
        .select('*')
        .eq('id', id)
        .single()

    if (!unit) {
        notFound()
    }

    // Fetch unit posts
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('unit_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
                {/* Cover Image */}
                <div
                    className="relative h-64 w-full bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${unit.cover_image || 'https://via.placeholder.com/1200x400?text=Unit+Cover'})`,
                    }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <h1 className="text-4xl font-bold text-white shadow-text text-center px-4">
                            {unit.name}
                        </h1>
                    </div>
                </div>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-lg text-gray-600">
                        <span className="font-semibold">Address:</span> {unit.address || 'Address not available'}
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Latest Reports</h2>
                {posts && posts.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post: any) => (
                            <div
                                key={post.id}
                                className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-lg"
                            >
                                {post.image_url ? (
                                    <img
                                        src={post.image_url}
                                        alt={post.title}
                                        className="h-48 w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {post.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                                        {post.content}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow">
                        <p>No reports available from this unit yet.</p>
                    </div>
                )}
                <div className="mt-8">
                    <Link
                        href="/"
                        className="text-indigo-600 hover:text-indigo-900 hover:underline"
                    >
                        &larr; Back to all reports
                    </Link>
                </div>
            </main>
        </div>
    )
}
