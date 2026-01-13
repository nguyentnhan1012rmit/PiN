export default function Home() {
    return (
        <div className="hero min-h-[80vh] bg-base-100">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">Find the Perfect Photographer</h1>
                    <p className="py-6">
                        Browse portfolios, check availability, and book professional photographers for your next event.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="btn btn-primary">Browse Photographers</button>
                        <button className="btn btn-outline">List Your Services</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
