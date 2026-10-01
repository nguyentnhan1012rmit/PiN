import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Send, Edit2, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import CommentItem from './CommentItem'
import { useComments } from '../hooks/useComments'
import RoleBadge from './RoleBadge'
import Avatar from './Avatar'
import EmptyState from './EmptyState'
import { Link } from 'react-router-dom'

export default function PostCard({ post, onDelete, onUpdate }) {
    const { user } = useAuth()
    const [liked, setLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(post.likes_count || 0)
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState('')

    // Edit Post State
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(post.content)
    const [editLoading, setEditLoading] = useState(false)

    // Use custom hook for comments
    const {
        comments,
        loading: loadingComments,
        fetchComments,
        addComment,
        deleteComment,
        editComment
    } = useComments(post.id)

    // Check if user liked this post
    // Check if user liked this post
    useEffect(() => {
        let mounted = true
        if (user) {
            supabase.from('likes')
                .select('*')
                .match({ post_id: post.id, user_id: user.id })
                .maybeSingle()
                .then(({ data }) => {
                    if (mounted && data) setLiked(true)
                })
        }
        return () => { mounted = false }
    }, [user, post.id])

    const handleLike = async () => {
        if (!user) return toast.error('Please login to like')

        const newLiked = !liked
        setLiked(newLiked)
        setLikesCount(prev => newLiked ? prev + 1 : prev - 1)

        if (newLiked) {
            const { error } = await supabase.from('likes').insert({ post_id: post.id, user_id: user.id })
            if (error) {
                setLiked(!newLiked)
                setLikesCount(prev => prev - 1)
            }
        } else {
            const { error } = await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id })
            if (error) {
                setLiked(!newLiked)
                setLikesCount(prev => prev + 1)
            }
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return
        const { error } = await supabase.from('posts').delete().eq('id', post.id)
        if (error) {
            toast.error('Failed to delete post')
        } else {
            toast.success('Post deleted')
            if (onDelete) onDelete(post.id)
        }
    }

    const toggleComments = async () => {
        if (!showComments) {
            setShowComments(true)
            await fetchComments()
        } else {
            setShowComments(false)
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return

        const success = await addComment(user?.id, newComment)
        if (success) {
            setNewComment('')
        }
    }

    const handleReply = async (parentId, content) => {
        await addComment(user?.id, content, parentId)
    }

    // Edit Post Handler
    const handleEdit = async () => {
        if (!editContent.trim()) return
        setEditLoading(true)

        const { error } = await supabase
            .from('posts')
            .update({ content: editContent })
            .eq('id', post.id)

        if (error) {
            toast.error('Failed to update post')
        } else {
            toast.success('Post updated!')
            post.content = editContent // Update local state
            setIsEditing(false)
            if (onUpdate) onUpdate()
        }
        setEditLoading(false)
    }

    // Share Post Handler
    const handleShare = async () => {
        const postUrl = `${window.location.origin}/feed#post-${post.id}`
        try {
            await navigator.clipboard.writeText(postUrl)
            toast.success('Link copied to clipboard!')
        } catch (err) {
            toast.error('Failed to copy link')
        }
    }


    return (
        <div className="card-glass p-6 rounded-2xl mb-6 transition-all hover:shadow-md group">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <Link to={`/photographer/${post.user_id}`}>
                    <Avatar
                        src={post.profiles?.avatar_url}
                        alt={post.profiles?.full_name}
                        size="md"
                        className="ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                    />
                </Link>
                <div className="flex-1 min-w-0">
                    <Link to={`/photographer/${post.user_id}`} className="font-bold text-base text-base-content hover:text-primary transition-colors block truncate flex items-center gap-2">
                        {post.profiles?.full_name || 'Unknown User'}
                        <RoleBadge role={post.profiles?.role} type="mini" />
                    </Link>
                    <div className="text-xs text-base-content/50">
                        {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={20} />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200">
                        {user && user.id === post.user_id ? (
                            <>
                                <li>
                                    <a onClick={() => setIsEditing(true)}>
                                        <Edit2 size={16} /> Edit Post
                                    </a>
                                </li>
                                <li>
                                    <a onClick={handleDelete} className="text-error">
                                        <Trash2 size={16} /> Delete Post
                                    </a>
                                </li>
                            </>
                        ) : (
                            <li><a onClick={() => toast.success("Post Reported")}>Report Post</a></li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Content */}
            <div className="">
                <p className="text-lg mb-4 whitespace-pre-wrap leading-relaxed text-base-content/90 font-light">{post.content}</p>

                {post.image_url && (
                    <figure className="mb-4 rounded-xl overflow-hidden border border-base-content/5 shadow-sm">
                        <img src={post.image_url} alt="Post content" className="w-full object-cover max-h-[600px] hover:scale-[1.01] transition-transform duration-500" />
                    </figure>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-base-content/5 mt-4">
                    <button
                        onClick={handleLike}
                        className={`btn btn-sm gap-2 px-3 rounded-full transition-colors ${liked ? 'btn-error btn-soft text-error-content' : 'btn-ghost text-base-content/60 hover:bg-base-200'}`}
                    >
                        <Heart size={18} fill={liked ? "currentColor" : "none"} />
                        <span className="font-medium">{likesCount > 0 ? likesCount : 'Like'}</span>
                    </button>
                    <button
                        onClick={toggleComments}
                        className={`btn btn-sm gap-2 px-3 rounded-full transition-colors ${showComments ? 'btn-primary btn-soft' : 'btn-ghost text-base-content/60 hover:bg-base-200'}`}
                    >
                        <MessageCircle size={18} />
                        <span className="font-medium">{post.comments_count > 0 ? post.comments_count : 'Comment'}</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="btn btn-ghost btn-sm gap-2 px-3 ml-auto rounded-full text-base-content/60 hover:bg-base-200"
                    >
                        <Share2 size={18} />
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 bg-base-200/30 rounded-xl p-4 animate-fade-in border border-base-content/5">
                        {/* Input */}
                        <form onSubmit={handleAddComment} className="flex gap-3 items-center mb-6">
                            <Avatar
                                src={user?.user_metadata?.avatar_url}
                                alt={user?.user_metadata?.full_name}
                                size="sm"
                                className="shrink-0"
                            />
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    className="input input-bordered input-sm w-full rounded-full pr-10 bg-base-100 focus:bg-base-100 focus:border-primary transition-colors"
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 btn btn-xs btn-circle btn-primary"
                                    disabled={!newComment.trim()}
                                >
                                    <Send size={12} />
                                </button>
                            </div>
                        </form>

                        {/* List */}
                        <div className="space-y-4">
                            {loadingComments ? (
                                <div className="text-center opacity-50 py-4 text-sm">Loading comments...</div>
                            ) : comments.length > 0 ? (
                                comments.map(comment => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        onReply={handleReply}
                                        onDelete={deleteComment}
                                        onEdit={editComment}
                                    />
                                ))
                            ) : (
                                <EmptyState
                                    icon={MessageCircle}
                                    title="No comments yet"
                                    description="Be the first to say something!"
                                    className="py-8 bg-transparent border-0"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Post Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-lg border border-base-200">
                        <div className="flex items-center justify-between p-4 border-b border-base-200">
                            <h3 className="font-bold text-lg">Edit Post</h3>
                            <button onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm btn-circle">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4">
                            <textarea
                                className="textarea textarea-bordered w-full min-h-[150px] text-base"
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                placeholder="What's on your mind?"
                            />
                            {post.image_url && (
                                <div className="mt-3">
                                    <img src={post.image_url} alt="Post" className="rounded-lg max-h-48 object-cover" />
                                    <p className="text-xs opacity-50 mt-1">Image cannot be changed</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-base-200">
                            <button onClick={() => setIsEditing(false)} className="btn btn-ghost">
                                Cancel
                            </button>
                            <button
                                onClick={handleEdit}
                                className="btn btn-primary"
                                disabled={editLoading || !editContent.trim()}
                            >
                                {editLoading ? <span className="loading loading-spinner loading-sm"></span> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
