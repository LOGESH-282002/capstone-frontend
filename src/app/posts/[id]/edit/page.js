'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import PostForm from '@/components/PostForm'
import apiClient from '@/lib/api'
import { ArrowLeft } from 'lucide-react'

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getPost(params.id)
      setPost(data)
      
      // Check if user can edit this post
      if (!user || user.id !== data.authorId) {
        toast.error('You can only edit your own posts')
        router.push(`/posts/${params.id}`)
        return
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
      toast.error(error.message || 'Failed to fetch post')
      router.push('/posts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (updatedPost) => {
    router.push(`/posts/${updatedPost.id}`)
  }

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please login to edit posts.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="btn-primary"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Post not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The post you're trying to edit doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/posts')}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Posts</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Edit Post
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Make changes to your post and update it.
        </p>
      </div>

      {/* Edit Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <PostForm
          post={post}
          onSubmit={handleSubmit}
          isEditing={true}
        />
      </div>
    </div>
  )
}