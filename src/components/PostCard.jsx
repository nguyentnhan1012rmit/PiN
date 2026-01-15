import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Send, Edit2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import CommentItem from './CommentItem'
import { Link } from 'react-router-dom'

export default function PostCard({ post, onDelete }) {
    const { user } = useAuth()
    const [liked, setLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(post.likes_count || 0)
    const [comments, setComments] = useState([])
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [loadingComments, setLoadingComments] = useState(false)

    // Check if user liked this post
    useState(() => {
        if (user) {
            supabase.from('likes')
                .select('*')
                .match({ post_id: post.id, user_id: user.id })
                .single()
                .then(({ data }) => {
                    if (data) setLiked(true)
                })
        }
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

    const buildCommentTree = (flatComments) => {
        const commentMap = {}
        const roots = []

        // First pass: create map
        flatComments.forEach(c => {
            commentMap[c.id] = { ...c, children: [] }
        })

        // Second pass: link children to parents
        flatComments.forEach(c => {
            if (c.parent_id) {
                if (commentMap[c.parent_id]) {
                    commentMap[c.parent_id].children.push(commentMap[c.id])
                }
            } else {
                roots.push(commentMap[c.id])
            }
        })
        return roots
    }

    const toggleComments = async () => {
        if (!showComments) {
            setLoadingComments(true)
            setShowComments(true)
            await fetchComments()
            setLoadingComments(false)
        } else {
            setShowComments(false)
        }
    }

    const fetchComments = async () => {
        const { data } = await supabase
            .from('comments')
            .select('*, profiles(full_name, avatar_url)')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true })
        setComments(buildCommentTree(data || []))
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return
        await handleReply(null, newComment)
        setNewComment('')
    }

    const handleReply = async (parentId, content) => {
        if (!user) {
            toast.error('Please login to reply')
            return
        }

        const { error } = await supabase
            .from('comments')
            .insert({
                post_id: post.id,
                user_id: user.id,
                parent_id: parentId,
                content: content
            })

        if (error) {
            toast.error('Failed to comment')
        } else {
            // Refresh comments
            await fetchComments()
            if (!parentId) {
                // Optimistically update main count if root comment? 
                // DB trigger handles real count, but we might want local feedback.
                // For nested replies, they don't change the Post's total comment count usually? 
                // Ah, our earlier sql trigger updates post comment count on ANY insert to comments table.
                // So yes, we could increment locally.
            }
        }
    }

    const handleDeleteComment = async (commentId) => {
        const { error } = await supabase.from('comments').delete().eq('id', commentId)
        if (error) {
            toast.error('Failed to delete comment')
        } else {
            await fetchComments()
            toast.success('Comment deleted')
        }
    }

    const handleEditComment = async (commentId, content) => {
        const { error } = await supabase.from('comments').update({ content }).eq('id', commentId)
        if (error) {
            toast.error('Failed to update comment')
        } else {
            await fetchComments()
            toast.success('Comment updated')
        }
    }

    return (
        <div className="card-glass p-6 rounded-2xl mb-6 transition-all hover:shadow-md group">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <Link to={`/photographer/${post.user_id}`} className="avatar">
                    <div className="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        <img
                            src={post.profiles?.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                            className="avatar-img"
                            alt={post.profiles?.full_name || 'User'}
                        />
                    </div>
                </Link>
                <div className="flex-1 min-w-0">
                    <Link to={`/photographer/${post.user_id}`} className="font-bold text-base text-base-content hover:text-primary transition-colors block truncate">
                        {post.profiles?.full_name || 'Unknown User'}
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
                                    <a onClick={() => toast("Edit feature coming soon!")}>
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
                        onClick={() => toast('Share feature under development 🛠️', { icon: '🚧' })}
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
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                                <img
                                    src={user?.user_metadata?.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                    className="avatar-img"
                                    alt="Me"
                                />
                            </div>
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
                                        onDelete={handleDeleteComment}
                                        onEdit={handleEditComment}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-4 text-sm opacity-50 italic">No comments yet. Be the first to say something!</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
