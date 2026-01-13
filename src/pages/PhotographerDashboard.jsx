export default function PhotographerDashboard() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Photographer Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat bg-base-100 shadow rounded-box border border-base-200">
                    <div className="stat-title">Total Bookings</div>
                    <div className="stat-value">0</div>
                    <div className="stat-desc">Jan 1st - Feb 1st</div>
                </div>

                <div className="stat bg-base-100 shadow rounded-box border border-base-200">
                    <div className="stat-title">Profile Views</div>
                    <div className="stat-value text-primary">0</div>
                    <div className="stat-desc">↗︎ 0% (30 days)</div>
                </div>
            </div>
        </div>
    )
}
