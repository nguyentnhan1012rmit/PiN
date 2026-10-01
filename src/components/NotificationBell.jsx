<<<<<<< Updated upstream
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationsContext'

export default function NotificationBell() {
    const { unreadCount } = useNotifications()
    const navigate = useNavigate()

    return (
        <button
            className="btn btn-ghost btn-circle relative"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
        >
            <Bell className="h-5 w-5 md:h-6 md:w-6 opacity-80" />
            {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white ring-2 ring-base-100 animate-pulse-subtle">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
=======
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Bell, Check, Trash2, Calendar, MessageSquare, CheckCircle, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function NotificationBell() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchNotifications = useCallback(async () => {
        if (!user) return

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) {
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.is_read).length)
        }
    }, [user])

    useEffect(() => {
        fetchNotifications()

        // Subscribe to new notifications
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user?.id}`
            }, (payload) => {
                setNotifications(prev => [payload.new, ...prev])
                setUnreadCount(prev => prev + 1)
                toast(payload.new.message, { icon: '🔔' })
            })
            .subscribe()

        return () => {
            channel.unsubscribe()
        }
    }, [user, fetchNotifications])

    const handleMarkAsRead = async (id) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const handleMarkAllAsRead = async () => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        setNotifications(prev =>
            prev.map(n => ({ ...n, is_read: true }))
        )
        setUnreadCount(0)
    }

    const handleDelete = async (id) => {
        await supabase
            .from('notifications')
            .delete()
            .eq('id', id)

        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <Calendar size={16} className="text-primary" />
            case 'message': return <MessageSquare size={16} className="text-info" />
            case 'review': return <CheckCircle size={16} className="text-success" />
            default: return <Bell size={16} />
        }
    }

    if (!user) return null

    return (
        <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="indicator">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="badge badge-sm badge-primary indicator-item">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
            </div>

            <div
                tabIndex={0}
                className="dropdown-content z-[1] mt-2 w-80 bg-base-100 rounded-box shadow-xl border border-base-200"
            >
                <div className="p-3 border-b border-base-200 flex justify-between items-center">
                    <h3 className="font-bold">Notifications</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="btn btn-ghost btn-xs"
                        >
                            <Check size={14} /> Mark all read
                        </button>
                    )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-base-content/50">
                            <Bell size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                className={`p-3 border-b border-base-200 hover:bg-base-200/50 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1">{getIcon(n.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">{n.message}</p>
                                        <p className="text-xs opacity-50 mt-1">
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {!n.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(n.id)}
                                                className="btn btn-ghost btn-xs"
                                                title="Mark as read"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(n.id)}
                                            className="btn btn-ghost btn-xs text-error"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-2 border-t border-base-200">
                        <Link
                            to="/notifications"
                            className="btn btn-ghost btn-sm w-full"
                        >
                            View all notifications
                        </Link>
                    </div>
                )}
            </div>
        </div>
>>>>>>> Stashed changes
    )
}
