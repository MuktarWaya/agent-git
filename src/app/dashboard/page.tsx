'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'

export default function DashboardPage() {
    const { user } = useUser()
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user) return

            // Get user's unit_id first
            const { data: userData } = await supabase
                .from('users')
                .select('unit_id')
                .eq('id', user.id)
                .single()

            if (userData?.unit_id) {
                const { data } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('unit_id', userData.unit_id)
                    .order('created_at', { ascending: false })

                setPosts(data || [])
            }
            setLoading(false)
        }

        fetchPosts()
    }, [user])

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-gray-500">Loading dashboard...</div>
            </div>
        )
    }

    return (
        <div>
            <div className="md:flex md:items-center md:justify-between py-6">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Dashboard
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        href="/dashboard/create"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Create New Post
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-md overflow-hidden">
                <ul role="list" className="divide-y divide-gray-200">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <li key={post.id} className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="truncate text-sm font-medium text-indigo-600">{post.title}</p>
                                        <div className="ml-2 flex flex-shrink-0">
                                            <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                Published
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500 line-clamp-1">
                                                {post.content}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <p>
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No posts</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new post.</p>
                            <div className="mt-6">
                                <Link
                                    href="/dashboard/create"
                                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Create New Post
                                </Link>
                            </div>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
