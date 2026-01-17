import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'react-hot-toast'

export function useComments(postId) {
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(false)

    // Helper to build tree structure
    const buildCommentTree = useCallback((flatComments) => {
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
    }, [])

    const fetchComments = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles(full_name, avatar_url)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching comments:', error)
        } else {
            setComments(buildCommentTree(data || []))
        }
        setLoading(false)
    }, [postId, buildCommentTree])

    const addComment = useCallback(async (userId, content, parentId = null) => {
        if (!userId) {
            toast.error('Please login to reply')
            return false
        }

        const { error } = await supabase
            .from('comments')
            .insert({
                post_id: postId,
                user_id: userId,
                parent_id: parentId,
                content: content
            })

        if (error) {
            toast.error('Failed to comment')
            return false
        } else {
            await fetchComments()
            return true
        }
    }, [postId, fetchComments])

    const deleteComment = useCallback(async (commentId) => {
        const { error } = await supabase.from('comments').delete().eq('id', commentId)
        if (error) {
            toast.error('Failed to delete comment')
            return false
        } else {
            await fetchComments()
            toast.success('Comment deleted')
            return true
        }
    }, [fetchComments])

    const editComment = useCallback(async (commentId, content) => {
        const { error } = await supabase.from('comments').update({ content }).eq('id', commentId)
        if (error) {
            toast.error('Failed to update comment')
            return false
        } else {
            await fetchComments()
            toast.success('Comment updated')
            return true
        }
    }, [fetchComments])

    return {
        comments,
        loading,
        fetchComments,
        addComment,
        deleteComment,
        editComment
    }
}
