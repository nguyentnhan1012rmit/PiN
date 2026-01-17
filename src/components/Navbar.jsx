import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Settings, LogOut, Moon, Sun, ChevronRight, HelpCircle, MessageCircle, Compass, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import RoleBadge from './RoleBadge'
import Avatar from './Avatar'

export default function Navbar() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
    const [profile, setProfile] = useState(null)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        if (user) {
            // Fetch latest profile data to ensure username/avatar are up to date
            const fetchProfile = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                if (data) setProfile(data)
            }
            fetchProfile()
        }
    }, [user])

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div className="sticky top-0 z-50 navbar glass-panel px-6 md:px-12 mb-0 rounded-b-2xl">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost text-3xl font-black tracking-tighter text-primary">PiN</Link>

                <div className="hidden md:flex gap-2 ml-4">

                    <Link to="/photographers" className="btn btn-ghost btn-sm">Find Photographers</Link>
                    {user && (
                        <>
                            {/* Dashboard: Visible to Photographers and Admins */}
                            {(user.role === 'photographer' || user.user_metadata?.role === 'photographer' || user.role === 'admin' || user.user_metadata?.role === 'admin') && (
                                <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
                            )}

                            {/* My Bookings: Visible to Everyone */}
                            <Link to="/my-bookings" className="btn btn-ghost btn-sm">My Bookings</Link>
                        </>
                    )}
                </div>
            </div>
            <div className="flex-none gap-2">
                {!user ? (
                    <>
                        <button onClick={toggleTheme} className="btn btn-ghost btn-circle mr-2">
                            {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
                        </button>
                        <Link to="/login" className="btn btn-sm btn-ghost">Log In</Link>
                        <Link to="/signup" className="btn btn-sm btn-primary">Sign Up</Link>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        {user && (
                            <>
                                <Link to="/feed" className="btn btn-ghost btn-circle" title="Community Feed">
                                    <Compass size={24} />
                                </Link>
                                <Link to="/inbox" className="btn btn-ghost btn-circle" title="Inbox">
                                    <MessageCircle size={24} />
                                </Link>
                            </>
                        )}
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <Avatar
                                    src={profile?.avatar_url || user.user_metadata?.avatar_url}
                                    alt={profile?.full_name || user.user_metadata?.full_name || user.email}
                                    size="md"
                                />
                            </div>
                            <div tabIndex={0} className="mt-3 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100 w-80 text-base-content border border-base-content/10 rounded-box">
                                {/* Profile Header */}
                                <div className="p-2 mb-2">
                                    <Link
                                        to={`/photographer/${user.id}`}
                                        className="flex items-center gap-3 p-2 hover:bg-base-content/5 rounded-lg transition-colors shadow-sm border border-base-content/5"
                                    >
                                        <Avatar
                                            src={profile?.avatar_url || user.user_metadata?.avatar_url}
                                            alt={profile?.full_name || user.user_metadata?.full_name || user.email}
                                            size="md"
                                        />
                                        <div className="flex flex-col min-w-0 gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-base leading-tight">
                                                    {profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0]}
                                                </span>
                                            </div>

                                            <span className="text-xs opacity-50 font-medium truncate">@{profile?.username || user.user_metadata?.username || user.email?.split('@')[0]}</span>

                                            {/* Full Role Label Restored Here */}
                                            <div className="mt-1">
                                                <RoleBadge role={profile?.role || user.user_metadata?.role} type="full" />
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="divider my-1 opacity-20"></div>
                                </div>

                                {/* Menu Items */}
                                <ul className="space-y-1 px-2 pb-2">
                                    <li>
                                        <Link to="/settings" className="flex items-center justify-between py-3 hover:bg-base-content/5 rounded-lg active:bg-base-content/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-base-content/5 flex items-center justify-center">
                                                    <Settings size={20} />
                                                </div>
                                                <span className="font-medium text-base">Settings</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li>
                                        <button onClick={toggleTheme} className="flex items-center justify-between py-3 hover:bg-base-content/5 rounded-lg active:bg-base-content/10 w-full text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-base-content/5 flex items-center justify-center">
                                                    <Moon size={20} />
                                                </div>
                                                <span className="font-medium text-base">
                                                    Dark Mode
                                                </span>
                                            </div>
                                            {theme === 'dark' ? (
                                                <div className="badge badge-sm badge-primary">On</div>
                                            ) : (
                                                <div className="badge badge-sm badge-ghost">Off</div>
                                            )}
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={handleSignOut} className="flex items-center justify-between py-3 hover:bg-base-content/5 rounded-lg active:bg-base-content/10 w-full text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-base-content/5 flex items-center justify-center">
                                                    <LogOut size={20} />
                                                </div>
                                                <span className="font-medium text-base">Log out</span>
                                            </div>
                                        </button>
                                    </li>
                                </ul>

                                {(profile?.role === 'admin' || user.user_metadata?.role === 'admin') && (
                                    <div className="p-2 border-t border-base-content/10 bg-base-content/5">
                                        <Link to="/admin" className="btn btn-ghost btn-sm w-full justify-start gap-3 text-error">
                                            <Shield size={18} /> Admin Dashboard
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
