import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <div className="navbar bg-base-100 shadow-sm border-b border-base-200">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost text-xl font-bold tracking-tight">LensLocker</Link>
            </div>
            <div className="flex-none gap-2">
                <Link to="/login" className="btn btn-sm btn-ghost">Log In</Link>
                <Link to="/login" className="btn btn-sm btn-primary">Join as Photographer</Link>
            </div>
        </div>
    )
}
