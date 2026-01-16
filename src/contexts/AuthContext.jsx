import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    // Helper to update user state from session + profile
    const handleSession = async (currentSession) => {
        try {
            if (currentSession?.user) {
                // Try to preserve role or fetch it if missing
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', currentSession.user.id)
                    .maybeSingle()

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching profile:", error)
                }

                setUser({
                    ...currentSession.user,
                    role: profile?.role || currentSession.user.user_metadata?.role || 'customer'
                })
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error("Session handling error:", error)
        } finally {
            setLoading(false)
        }
    }

    // 1. Initial Auth Check & Subscription (Run once)
    useEffect(() => {
        let mounted = true

        // Safety timeout
        const safetyTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth loading timed out, forcing render.")
                setLoading(false)
            }
        }, 5000)

        // Get Initial Session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                setSession(session)
                handleSession(session)
            }
        }).catch(err => {
            console.error("GetSession error:", err)
            if (mounted) setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session)
                handleSession(session)
            }
        })

        return () => {
            mounted = false
            clearTimeout(safetyTimeout)
            subscription.unsubscribe()
        }
    }, [])

    // 2. Realtime Profile Updates (Run when user changes)
    useEffect(() => {
        if (!user?.id) return

        const channel = supabase
            .channel(`public:profile:${user.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${user.id}`
            }, (payload) => {
                console.log("Realtime profile update received:", payload.new)
                // Refresh user state with new data
                if (session) handleSession(session)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user?.id, session])

    const value = {
        session,
        user,
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signUp: (data) => supabase.auth.signUp(data),
        signOut: () => supabase.auth.signOut(),
    }

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-base-100">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : children}
        </AuthContext.Provider>
    )
}
