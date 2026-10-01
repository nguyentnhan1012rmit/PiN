import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageLightbox({ images, currentIndex, onClose, onNavigate }) {
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose()
        if (e.key === 'ArrowLeft') onNavigate(currentIndex - 1)
        if (e.key === 'ArrowRight') onNavigate(currentIndex + 1)
    }, [currentIndex, onClose, onNavigate])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'auto'
        }
    }, [handleKeyDown])

    const currentImage = images[currentIndex]
    if (!currentImage) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 btn btn-circle btn-ghost text-white hover:bg-white/10"
            >
                <X size={24} />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 text-white/70 text-sm">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Previous Button */}
            {currentIndex > 0 && (
                <button
                    onClick={() => onNavigate(currentIndex - 1)}
                    className="absolute left-4 btn btn-circle btn-ghost text-white hover:bg-white/10"
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            {/* Image */}
            <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
                <img
                    src={currentImage.image_url || currentImage}
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
            </div>

            {/* Next Button */}
            {currentIndex < images.length - 1 && (
                <button
                    onClick={() => onNavigate(currentIndex + 1)}
                    className="absolute right-4 btn btn-circle btn-ghost text-white hover:bg-white/10"
                >
                    <ChevronRight size={32} />
                </button>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-xl backdrop-blur-sm">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => onNavigate(idx)}
                            className={`w-12 h-12 rounded-lg overflow-hidden transition-all ${idx === currentIndex ? 'ring-2 ring-primary scale-110' : 'opacity-50 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={img.image_url || img}
                                alt={`Thumb ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
