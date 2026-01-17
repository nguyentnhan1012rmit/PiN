import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Save, User, MapPin, Camera, X, ZoomIn, Image, Check, Mail, Move } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ImageCropper from '../components/ImageCropper'

export default function ProfileSettings() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        bio: '',
        location: '',
        website: '',
        role: 'customer',
        avatar_url: '',
        cover_photo_url: ''
    })

    // Image Upload & Crop State
    const avatarInputRef = useRef(null)
    const coverInputRef = useRef(null)
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [imageToCrop, setImageToCrop] = useState(null)
    const [croppingField, setCroppingField] = useState(null) // 'avatar_url' or 'cover_photo_url'

    const fetchProfile = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (data) {
            setFormData({
                full_name: data.full_name || '',
                username: data.username || '',
                bio: data.bio || '',
                location: data.location || '',
                website: data.website || '',
                role: data.role || 'customer',
                avatar_url: data.avatar_url || '',
                cover_photo_url: data.cover_photo_url || ''
            })
        }
        setLoading(false)
    }, [user])

    useEffect(() => {
        if (user) fetchProfile()
    }, [user, fetchProfile])


    // --- File Selection ---
    const handleFileSelect = (e, type) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            setImageToCrop(reader.result)
            setCroppingField(type === 'avatar' ? 'avatar_url' : 'cover_photo_url')
            setCropModalOpen(true)
        }
        reader.readAsDataURL(file)

        // Reset input
        e.target.value = ''
    }

    // --- Upload Logic ---
    const handleImageUpload = async (file, field) => {
        if (!file) return

        // const fileExt = file.name.split('.').pop() // Don't rely on existing name for blobs
        const fileExt = field === 'avatar_url' ? 'png' : file.name?.split('.').pop() || 'jpg'
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const bucket = field === 'avatar_url' ? 'avatars' : 'covers'

        const loadingToast = toast.loading("Uploading...")

        try {
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName)

            // Append timestamp to bust cache if replacing same file
            const publicUrl = `${data.publicUrl}?t=${Date.now()}`

            setFormData(prev => ({ ...prev, [field]: publicUrl }))
            toast.dismiss(loadingToast)
            toast.success(`${field === 'avatar_url' ? 'Avatar' : 'Cover photo'} updated!`)
        } catch (error) {
            console.error('Upload error:', error)
            toast.dismiss(loadingToast)
            toast.error('Error uploading image.')
        }
    }

    const handleCropComplete = (croppedBlob) => {
        if (croppingField) {
            handleImageUpload(croppedBlob, croppingField)
        }
        setCropModalOpen(false)
        setImageToCrop(null)
        setCroppingField(null)
    }

    const handleCancelCrop = () => {
        setCropModalOpen(false)
        setImageToCrop(null)
        setCroppingField(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        const { error } = await supabase
            .from('profiles')
            .update(formData)
            .eq('id', user.id)

        setSaving(false)
        if (!error) {
            toast.success('Profile updated successfully!')
        } else {
            console.error(error)
            toast.error(error.message || 'Error updating profile')
        }
    }

    if (loading) return (
        <div className="flex justify-center p-12">
            <span className="loading loading-spinner text-primary"></span>
        </div>
    )

    return (
        <div className="container mx-auto p-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

            <div className="card bg-base-100 shadow border border-base-200">
                <div className="card-body">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Images Section */}
                        <div className="relative mb-20 group">
                            {/* Cover Photo */}
                            <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-base-200 border border-base-300 shadow-sm group-hover:shadow-md transition-all">
                                {formData.cover_photo_url ? (
                                    <img src={formData.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full opacity-30 bg-base-300">
                                        <Image size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    onClick={() => coverInputRef.current.click()}>
                                    <div className="btn btn-sm bg-base-100 text-base-content border-none hover:bg-base-200 gap-2 shadow-lg font-bold">
                                        <Camera size={16} /> Change Cover
                                    </div>
                                </div>
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, 'cover')}
                                    accept="image/*"
                                />
                            </div>

                            {/* Avatar */}
                            <div className="absolute -bottom-16 left-6">
                                <div
                                    className="relative w-36 h-36 rounded-full ring-4 ring-base-100 shadow-xl overflow-hidden group/avatar cursor-pointer bg-base-100"
                                    onClick={() => avatarInputRef.current.click()}
                                >
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-neutral text-neutral-content flex items-center justify-center text-4xl font-bold">
                                            {formData.full_name?.[0]}
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="text-white" size={28} />
                                    </div>
                                </div>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, 'avatar')}
                                    accept="image/*"
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold">Full Name</label>
                            <label className="input input-bordered flex items-center gap-2">
                                <User size={16} className="opacity-70" />
                                <input
                                    type="text"
                                    className="grow"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold">Username</label>
                            <label className="input input-bordered flex items-center gap-2">
                                <span className="opacity-70 font-mono text-xs">@</span>
                                <input
                                    type="text"
                                    className="grow"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                                    pattern="^[a-z0-9_]+$"
                                    title="Lowercase letters, numbers, and underscores only."
                                />
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold">Email</label>
                            <label className="input input-bordered flex items-center gap-2 bg-base-200">
                                <Mail size={16} className="opacity-70" />
                                <input
                                    type="text"
                                    className="grow text-base-content/70"
                                    value={user?.email || ''}
                                    disabled
                                    readOnly
                                />
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold">Location</label>
                            <label className="input input-bordered flex items-center gap-2">
                                <MapPin size={16} className="opacity-70" />
                                <input
                                    type="text"
                                    className="grow"
                                    placeholder="e.g. New York, NY"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </label>
                        </div>



                        {/* Optional: Role switching */}
                        {/* Optional: Role switching - Hide for Admins to prevent accidental downgrade */}
                        {formData.role !== 'admin' && (
                            <div className="form-control bg-base-200 p-4 rounded-xl">
                                <label className="label cursor-pointer justify-start gap-4">
                                    <span className="label-text font-bold">I am a Photographer</span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={formData.role === 'photographer'}
                                        onChange={e => setFormData({ ...formData, role: e.target.checked ? 'photographer' : 'customer' })}
                                    />
                                </label>
                                <p className="text-xs opacity-70 mt-2">
                                    Switch this on to enable photographer features like Dashboard and Portfolio capabilities.
                                </p>
                            </div>
                        )}

                        <div className="card-actions justify-end mt-4">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? <span className="loading loading-spinner"></span> : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* Image Cropper Modal */}
            {cropModalOpen && imageToCrop && (
                <ImageCropper
                    imageSrc={imageToCrop}
                    onCancel={handleCancelCrop}
                    onCropComplete={handleCropComplete}
                    isCircular={croppingField === 'avatar_url'}
                    initialAspectRatio={croppingField === 'avatar_url' ? 1 : 16 / 9}
                />
            )}
        </div>
    )
}
