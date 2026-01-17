import { useState, useRef } from 'react'
import { Image, Send, X, Crop } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import ImageCropper from './ImageCropper'
import Avatar from './Avatar'
import { toast } from 'react-hot-toast'

export default function CreatePost({ onPostCreated }) {
    const { user } = useAuth()
    const [content, setContent] = useState('')
    const [image, setImage] = useState(null) // Can be File or Blob
    const [previewUrl, setPreviewUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef(null)

    // Cropper State
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [imageToCrop, setImageToCrop] = useState(null)

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
        // Reset input so same file selection triggers change again if needed
        e.target.value = ''
    }

    const handleEditClick = () => {
        if (!image) return
        const reader = new FileReader()
        reader.onload = () => {
            setImageToCrop(reader.result)
            setCropModalOpen(true)
        }
        reader.readAsDataURL(image)
    }

    const handleCropComplete = (croppedBlob) => {
        setImage(croppedBlob)
        // Revoke old URL if it exists to avoid leak
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(URL.createObjectURL(croppedBlob))
        setCropModalOpen(false)
        setImageToCrop(null)
    }

    const handleCancelCrop = () => {
        setCropModalOpen(false)
        setImageToCrop(null)
    }

    const removeImage = () => {
        setImage(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim() && !image) return

        setLoading(true)
        let uploadedImageUrl = null

        try {
            if (image) {
                const fileExt = 'jpg' // We export as jpeg in Cropper
                const fileName = `${user.id}/${Date.now()}.${fileExt}`

                // Upload to Supabase
                const { error: uploadError } = await supabase.storage
                    .from('posts')
                    .upload(fileName, image, {
                        contentType: 'image/jpeg',
                        upsert: false
                    })

                if (uploadError) {
                    // Check if bucket exists error? 
                    // Usually we just show generic error.
                    throw uploadError
                }

                const { data } = supabase.storage
                    .from('posts')
                    .getPublicUrl(fileName)

                uploadedImageUrl = data.publicUrl
            }

            const { error } = await supabase.from('posts').insert({
                content,
                user_id: user.id,
                image_url: uploadedImageUrl
            })

            if (error) throw error

            setContent('')
            removeImage()
            if (onPostCreated) onPostCreated()
            toast.success('Post created!')

        } catch (error) {
            console.error('Error creating post:', error)
            toast.error(error.message || 'Failed to create post')
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="card-glass p-6 rounded-2xl mb-8 shadow-sm animate-appear">
            <form onSubmit={handleSubmit} className="flex gap-4 items-start">
                <div className="pt-1">
                    <Avatar
                        src={user.user_metadata?.avatar_url}
                        alt={user.user_metadata?.full_name}
                        size="md"
                        className="ring-2 ring-primary ring-offset-base-100 ring-offset-2"
                    />
                </div>

                <div className="flex-1">
                    <textarea
                        className="textarea w-full bg-base-200/50 focus:bg-base-200/80 focus:outline-none transition-colors text-lg px-4 py-3 min-h-[100px] resize-none placeholder:text-base-content/40 rounded-xl border-none"
                        placeholder="What's happening?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>

                    {previewUrl && (
                        <div className="relative mt-3 mb-2 group">
                            <img src={previewUrl} alt="Preview" className="rounded-xl w-full max-h-[400px] object-cover border border-base-content/5 shadow-inner" />
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    type="button"
                                    onClick={handleEditClick}
                                    className="btn btn-circle btn-sm btn-neutral glass"
                                    title="Crop/Edit"
                                >
                                    <Crop size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="btn btn-circle btn-sm btn-error glass text-white"
                                    title="Remove"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-3 pl-1">
                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="btn btn-ghost btn-circle btn-sm hover:bg-primary/10 text-primary"
                                title="Add Image"
                            >
                                <Image size={20} />
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary rounded-full px-6 shadow-lg shadow-primary/20"
                            disabled={loading || (!content.trim() && !image)}
                        >
                            {loading ? <span className="loading loading-spinner"></span> : <span className="flex items-center gap-2">Post <Send size={16} /></span>}
                        </button>
                    </div>
                </div>
            </form>

            {cropModalOpen && imageToCrop && (
                <ImageCropper
                    imageSrc={imageToCrop}
                    onCancel={handleCancelCrop}
                    onCropComplete={handleCropComplete}
                    isCircular={false}
                    initialAspectRatio="original"
                />
            )}
        </div>
    )
}
