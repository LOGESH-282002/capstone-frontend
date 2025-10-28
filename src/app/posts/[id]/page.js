'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import ShareButton from '@/components/ShareButton'
import apiClient from '@/lib/api'
import { 
  Calendar, 
  User, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Clock,
  Eye
} from 'lucide-react'

export default function PostPage() {
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
    } catch (error) {
      console.error('Failed to fetch post:', error)
      toast.error(error.message || 'Failed to fetch post')
      router.push('/posts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!token) {
      toast.error('Please login to delete posts')
      return
    }

    if (!window.confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await apiClient.deletePost(params.id)
      toast.success('Post deleted successfully')
      router.push('/posts')
    } catch (error) {
      toast.error(error.message || 'Failed to delete post')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getReadingTime = (content) => {
    const wordsPerMinute = 200
    const words = content.split(' ').length
    const minutes = Math.ceil(words / wordsPerMinute)
    return `${minutes} min read`
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
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
            The post you're looking for doesn't exist or has been removed.
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

  const isAuthor = user && user.id === post.authorId

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* Post Header */}
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{post.author}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{getReadingTime(post.content)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Share Button */}
              <ShareButton
                url={`/posts/${post.id}`}
                title={post.title}
                description={post.excerpt}
                variant="simple"
              />

              {/* Author Actions */}
              {isAuthor && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/posts/${post.id}/edit`)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Edit post"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* Updated Date */}
          {post.updatedAt !== post.createdAt && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated on {formatDate(post.updatedAt)} at {formatTime(post.updatedAt)}
              </p>
            </div>
          )}
        </div>

      </article>

      {/* Author Card */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {post.author}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Author • Member since {new Date(post.createdAt).getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}