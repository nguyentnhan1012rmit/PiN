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
    )
}
