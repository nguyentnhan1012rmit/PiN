import { useState } from 'react'
import { Filter, X, Star } from 'lucide-react'

export default function FilterSidebar({ filters, setFilters, applyFilters, resetFilters, isOpen, setIsOpen }) {

    const [localFilters, setLocalFilters] = useState(filters)

    const handleChange = (e) => {
        const { name, value } = e.target
        setLocalFilters(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleApply = () => {
        applyFilters(localFilters)
        if (window.innerWidth < 1024) {
            setIsOpen(false)
        }
    }

    const handleReset = () => {
        const defaultFilters = { search: '', location: '', minPrice: 0, maxPrice: 1000, minRating: 0 }
        setLocalFilters(defaultFilters)
        resetFilters()
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed top-0 left-0 h-full w-80 bg-base-100 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl border-r border-base-200 overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:static lg:h-auto lg:shadow-none lg:border-none lg:w-64 lg:block lg:mr-8
                ${isOpen ? 'lg:block' : 'lg:hidden'}
            `}>
                <div className="p-6">
                    <div className="flex justify-between items-center lg:hidden mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Filter size={20} /> Filters</h2>
                        <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-sm btn-square">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Search Term */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold">Search</span>
                            </label>
                            <input
                                type="text"
                                name="search"
                                placeholder="Name or username..."
                                className="input input-bordered w-full"
                                value={localFilters.search || ''}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Location Filter */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold">Location</span>
                            </label>
                            <input
                                type="text"
                                name="location"
                                placeholder="City, State..."
                                className="input input-bordered w-full"
                                value={localFilters.location}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Price Range */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold">Price Range ($)</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    name="minPrice"
                                    placeholder="Min"
                                    className="input input-bordered w-full"
                                    value={localFilters.minPrice}
                                    onChange={handleChange}
                                    min="0"
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    placeholder="Max"
                                    className="input input-bordered w-full"
                                    value={localFilters.maxPrice}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold">Minimum Rating</span>
                            </label>
                            <div className="rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <input
                                        key={star}
                                        type="radio"
                                        name="minRating"
                                        className="mask mask-star-2 bg-warning"
                                        checked={parseInt(localFilters.minRating) === star}
                                        onChange={() => setLocalFilters(prev => ({ ...prev, minRating: star }))}
                                    />
                                ))}
                            </div>
                            <div className="text-xs text-base-content/50 mt-1">
                                {localFilters.minRating > 0 ? `${localFilters.minRating} Stars & Up` : 'Any Rating'}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex flex-col gap-2">
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleApply}
                            >
                                Apply Filters
                            </button>
                            <button
                                className="btn btn-ghost w-full"
                                onClick={handleReset}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
