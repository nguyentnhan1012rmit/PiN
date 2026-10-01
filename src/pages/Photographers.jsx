import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import RoleBadge from '../components/RoleBadge'
<<<<<<< Updated upstream
import FilterSidebar from '../components/FilterSidebar'
import { MapPin, User, ArrowRight, Star, Filter } from 'lucide-react'
=======
import { MapPin, User, ArrowRight, Search, X } from 'lucide-react'
>>>>>>> Stashed changes

export default function Photographers() {
    const navigate = useNavigate()
    const [photographers, setPhotographers] = useState([])
    const [loading, setLoading] = useState(true)
<<<<<<< Updated upstream
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
=======
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()
>>>>>>> Stashed changes

    const [filters, setFilters] = useState({
        location: '',
        minPrice: 0,
        maxPrice: 2000,
        minRating: 0
    })

    const fetchPhotographers = async (currentFilters) => {
        setLoading(true)
        console.log("Fetching with filters:", currentFilters)

        try {
            // Note: Make sure 'photographer_overviews' view exists in Supabase!
            let query = supabase
                .from('photographer_overviews')
                .select('*')

            // Filter by Search Term (Name or Username)
            if (currentFilters.search) {
                query = query.or(`full_name.ilike.%${currentFilters.search}%,username.ilike.%${currentFilters.search}%`)
            }

            // Filter by Location
            if (currentFilters.location) {
                query = query.ilike('location', `%${currentFilters.location}%`)
            }

            // Filter by Rating
            if (currentFilters.minRating > 0) {
                query = query.gte('avg_rating', currentFilters.minRating)
            }

            // Filter by Price (More complex because users have MIN and MAX prices)
            // If photographer's MIN price is <= user's MAX price
            // AND photographer's MAX price is >= user's MIN price
            // This ensures overlap. 
            // Simplified approximation:
            // "Show photographers who have SERVICES within the range"
            // The view has min_price and max_price.
            // A photographer is valid if their price range overlaps with the filter range.
            // min_price <= filter.maxPrice AND max_price >= filter.minPrice

            if (currentFilters.maxPrice < 2000) {
                query = query.lte('min_price', currentFilters.maxPrice)
            }
            if (currentFilters.minPrice > 0) {
                query = query.gte('max_price', currentFilters.minPrice)
            }

            const { data, error } = await query

            if (error) {
                console.error("Error fetching photographers:", error)
                // Fallback for development if View doesn't exist yet
                const { data: fallbackData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'photographer')
                if (fallbackData) setPhotographers(fallbackData)
            } else {
                setPhotographers(data || [])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPhotographers(filters)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

<<<<<<< Updated upstream
    const applyFilters = (newFilters) => {
        setFilters(newFilters)
        fetchPhotographers(newFilters)
    }

    const resetFilters = () => {
        const defaults = { location: '', minPrice: 0, maxPrice: 2000, minRating: 0 }
        setFilters(defaults)
        fetchPhotographers(defaults)
    }

    return (
        <div className="container mx-auto p-4 py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center justify-between">
                <span>Find Photographers</span>
                <button
                    className={`btn ${isSidebarOpen ? 'btn-primary' : 'btn-outline'} gap-2`}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <Filter size={18} /> {isSidebarOpen ? 'Hide Filters' : 'Show Filters'}
                </button>
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filter Component */}
                <FilterSidebar
                    filters={filters}
                    setFilters={setFilters}
                    applyFilters={applyFilters}
                    resetFilters={resetFilters}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />
=======
    // Filter photographers based on search term
    const filteredPhotographers = photographers.filter(p => {
        const search = searchTerm.toLowerCase()
        return (
            p.full_name?.toLowerCase().includes(search) ||
            p.location?.toLowerCase().includes(search) ||
            p.bio?.toLowerCase().includes(search)
        )
    })

    return (
        <div className="container mx-auto p-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">Professional Photographers</h1>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                    <input
                        type="text"
                        className="input input-bordered w-full pl-10 pr-10"
                        placeholder="Search by name, location..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Results count */}
            {searchTerm && (
                <div className="text-sm text-base-content/60 mb-4">
                    Found {filteredPhotographers.length} photographer{filteredPhotographers.length !== 1 ? 's' : ''}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {filteredPhotographers.map(p => (
                        <div key={p.id} className="group cursor-pointer" onClick={() => navigate(`/photographer/${p.id}`)}>
                            <figure className="h-64 w-full bg-base-300 relative overflow-hidden rounded-xl mb-4 group-hover:brightness-110 transition-all">
                                {/* Placeholder for cover image if we had one */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
>>>>>>> Stashed changes

                {/* Results Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {photographers.map(p => (
                                <div key={p.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer group" onClick={() => navigate(`/photographer/${p.id}`)}>
                                    <figure className="h-48 relative overflow-hidden">
                                        {p.cover_photo_url ? (
                                            <img src={p.cover_photo_url} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-neutral flex items-center justify-center text-neutral-content/20">
                                                <span className="text-4xl font-bold text-white/10">PiN</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-transparent opacity-90"></div>

                                        <div className="absolute bottom-2 left-4 right-4 flex justify-between items-end">
                                            <div className="avatar placeholder ring ring-base-100 rounded-full">
                                                <div className="w-12 rounded-full bg-neutral text-neutral-content">
                                                    {p.avatar_url ? (
                                                        <img src={p.avatar_url} alt={p.full_name} />
                                                    ) : (
                                                        <span>{p.full_name?.charAt(0) || <User />}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {p.avg_rating > 0 && (
                                                <div className="badge badge-warning gap-1 font-bold">
                                                    <Star size={12} className="fill-current" /> {Number(p.avg_rating).toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                    </figure>

                                    <div className="card-body p-4 pt-2">
                                        <div>
                                            <h2 className="card-title text-lg flex items-center gap-1 leading-none">
                                                {p.full_name}
                                                <RoleBadge role="photographer" type="mini" />
                                            </h2>
                                            {p.username && (
                                                <span className="text-xs text-base-content/50 font-medium block mt-1">@{p.username}</span>
                                            )}
                                        </div>

                                        <div className=" text-sm opacity-70 flex items-center gap-1 mb-2">
                                            <MapPin size={14} /> {p.location || 'Location not specified'}
                                        </div>

                                        <p className="text-xs text-base-content/60 line-clamp-2 mb-3 h-8">
                                            {p.bio || "No bio available."}
                                        </p>

                                        {/* Pricing logic from View */}
                                        <div className="text-sm font-semibold text-primary">
                                            {p.min_price && p.max_price ? (
                                                p.min_price === p.max_price
                                                    ? `$${p.min_price}`
                                                    : `$${p.min_price} - $${p.max_price}`
                                            ) : (
                                                <span className="text-base-content/40 font-normal italic">Contact for pricing</span>
                                            )}
                                        </div>

                                        <div className="card-actions justify-end mt-2">
                                            <button className="btn btn-sm btn-ghost gap-1 px-2 group-hover:traslate-x-1 transition-transform">
                                                View <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

<<<<<<< Updated upstream
                            {photographers.length === 0 && (
                                <div className="col-span-full text-center py-20 text-base-content/50 border-2 border-dashed border-base-content/10 rounded-xl">
                                    <Filter size={48} className="mx-auto mb-4 opacity-50" />
                                    <h3 className="font-bold text-xl">No matches found</h3>
                                    <p className="mb-4">Try adjusting your filters to see more results.</p>
                                    <button onClick={resetFilters} className="btn btn-outline btn-sm">Clear Filters</button>
                                </div>
                            )}
=======
                            <div>
                                <p className="text-base-content/70 line-clamp-2 mb-3 h-12">
                                    {p.bio || "No bio available yet."}
                                </p>
                                <button className="btn btn-link btn-sm p-0 text-primary no-underline hover:opacity-70 group-hover:translate-x-2 transition-transform">
                                    View Profile <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredPhotographers.length === 0 && !searchTerm && (
                        <div className="col-span-full text-center py-20 text-base-content/40">
                            <User size={48} className="mx-auto mb-4 opacity-50" />
                            <h3 className="font-bold text-xl">No photographers have joined yet.</h3>
>>>>>>> Stashed changes
                        </div>
                    )}

                    {filteredPhotographers.length === 0 && searchTerm && (
                        <div className="col-span-full text-center py-20 text-base-content/40">
                            <Search size={48} className="mx-auto mb-4 opacity-50" />
                            <h3 className="font-bold text-xl">No photographers found</h3>
                            <p className="text-sm mt-2">Try a different search term</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
