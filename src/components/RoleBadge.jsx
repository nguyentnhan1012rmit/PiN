
export default function RoleBadge({ role, type = 'mini' }) {
    // Normalizing role
    const normalizedRole = role === 'photographer' || role === 'Photographer' ? 'photographer'
        : role === 'admin' || role === 'Admin' ? 'admin'
            : 'customer'

    if (type === 'full') {
        if (normalizedRole === 'admin') {
            return (
                <span className="badge badge-error badge-sm gap-1 bg-red-100 text-red-700 border-red-200 font-bold">
                    Admin
                </span>
            )
        }
        if (normalizedRole === 'photographer') {
            return (
                <span className="badge badge-primary badge-sm gap-1 bg-purple-100 text-purple-700 border-purple-200 font-bold">
                    Photographer
                </span>
            )
        }
        return (
            <span className="badge badge-success badge-sm gap-1 bg-green-100 text-green-700 border-green-200 font-bold">
                Customer
            </span>
        )
    }

    // Mini Badges (Default)
    if (normalizedRole === 'admin') {
        return <span className="badge badge-error badge-xs font-bold text-white shadow-sm" title="Admin">ADM</span>
    }
    if (normalizedRole === 'photographer') {
        return <span className="badge badge-primary badge-xs font-bold text-white shadow-sm bg-purple-600 border-purple-600" title="Photographer">PHO</span>
    }
    // Customer
    return <span className="badge badge-success badge-xs font-bold text-white shadow-sm" title="Customer">CUS</span>
}
