import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationsContext'
import { Bell, Calendar, MessageSquare, Star, CheckCheck, Info } from 'lucide-react'

export default function NotificationsPage() {
    const { notifications, loading, markAsRead, markAllAsRead } = useNotifications()
    const navigate = useNavigate()

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id)
        }
        if (notification.link) {
            navigate(notification.link)
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case 'booking_request':
            case 'booking_update':
                return <Calendar className="text-secondary" />
            case 'new_review':
                return <Star className="text-warning" />
            case 'booking_confirmed':
                return <CheckCheck className="text-success" />
            default:
                return <Info className="text-info" />
        }
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const seconds = Math.floor((now - date) / 1000)

        if (seconds < 60) return 'Just now'
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        if (days < 7) return `${days}d ago`
        return date.toLocaleDateString()
    }

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 max-w-3xl py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Bell className="text-primary" /> Notifications
                </h1>
                {notifications.some(n => !n.is_read) && (
                    <button
                        onClick={markAllAsRead}
                        className="btn btn-sm btn-ghost text-primary"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 opacity-50 bg-base-200 rounded-xl border border-white/5">
                        <Bell className="mx-auto h-12 w-12 mb-4" />
                        <p className="text-lg">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`
                                relative p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]
                                flex gap-4 items-start
                                ${n.is_read
                                    ? 'bg-base-100 border-base-300 opacity-80'
                                    : 'bg-base-200 border-primary/30 shadow-lg shadow-primary/5'}
                            `}
                        >
                            {!n.is_read && (
                                <span className="absolute top-4 right-4 h-3 w-3 rounded-full bg-error animate-pulse"></span>
                            )}

                            <div className={`
                                p-3 rounded-full shrink-0
                                ${n.is_read ? 'bg-base-300' : 'bg-base-300/80 ring-1 ring-white/10'}
                            `}>
                                {getIcon(n.type)}
                            </div>

                            <div className="flex-1 pr-6">
                                <h3 className={`font-bold mb-1 ${n.is_read ? 'text-base-content/80' : 'text-base-content'}`}>
                                    {n.title}
                                </h3>
                                <p className="text-sm text-base-content/70 mb-2 leading-relaxed">
                                    {n.message}
                                </p>
                                <span className="text-xs text-base-content/40 font-medium">
                                    {formatTime(n.created_at)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
