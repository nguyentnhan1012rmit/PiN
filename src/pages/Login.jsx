export default function Login() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="card w-96 bg-base-100 shadow-xl border border-base-200">
                <div className="card-body">
                    <h2 className="card-title justify-center mb-4">Welcome Back</h2>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input type="email" placeholder="email@example.com" className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full mt-4">
                        <label className="label">
                            <span className="label-text">Password</span>
                        </label>
                        <input type="password" placeholder="••••••••" className="input input-bordered w-full" />
                    </div>
                    <div className="card-actions justify-center mt-6">
                        <button className="btn btn-primary w-full">Login</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
