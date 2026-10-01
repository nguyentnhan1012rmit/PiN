import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import { toast } from 'react-hot-toast'

const NotificationsContext = createContext()

export function useNotifications() {
    return useContext(NotificationsContext)
}

export function NotificationsProvider({ children }) {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            setNotifications([])
            setUnreadCount(0)
            setLoading(false)
            return
        }

        fetchNotifications()

        // Real-time subscription
        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const newNotification = payload.new
                    setNotifications((prev) => [newNotification, ...prev])
                    setUnreadCount((prev) => prev + 1)
                    toast('New Notification: ' + newNotification.title, {
                        icon: '🔔',
                        style: {
                            background: '#1a1b2e',
                            color: '#fff',
                        },
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const fetchNotifications = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Error fetching notifications:', error)
        } else {
            setNotifications(data)
            setUnreadCount(data.filter((n) => !n.is_read).length)
        }
        setLoading(false)
    }

    const markAsRead = async (id) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (error) {
            console.error('Error marking notification as read:', error)
            // Revert if error? For now, we'll just log it.
        }
    }

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
        if (unreadIds.length === 0) return

        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: true }))
        )
        setUnreadCount(0)

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        if (error) {
            console.error('Error marking all as read:', error)
        }
    }

    const value = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        fetchNotifications
    }

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    )
}
