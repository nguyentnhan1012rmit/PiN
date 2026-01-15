import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, Check } from 'lucide-react'

// Helper to create the cropped image blob
async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await new Promise((resolve, reject) => {
        const img = new Image()
        img.addEventListener('load', () => resolve(img))
        img.addEventListener('error', (error) => reject(error))
        img.src = imageSrc
    })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob)
        }, 'image/jpeg', 0.95)
    })
}

export default function ImageCropper({ imageSrc, onCancel, onCropComplete, isCircular = false, initialAspectRatio = 1 }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)

    // Manage Aspect Ratio
    // If 'original', we might just want to let it be free or default to something? 
    // react-easy-crop supports `aspect` prop. If undefined, it might not constrain?
    // Actually, react-easy-crop usually enforces an aspect ratio. 
    // For free-form, we might need a workaround or specific configuration.
    // However, usually "Simple" means strict but easy controls. 
    // Let's interpret "original" as defaulting to the image's ratio or just 4:3 default if not provided?
    // Let's use `aspect` state.
    const [aspect, setAspect] = useState(initialAspectRatio === 'original' ? 4 / 3 : initialAspectRatio)

    // We can detect image size to set aspect to original if needed?
    // But for now let's provider a set of nice aspect buttons.

    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const onCropChange = (crop) => {
        setCrop(crop)
    }

    const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
            onCropComplete(croppedImage)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-base-100 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[600px] max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-base-200 flex justify-between items-center z-10 bg-base-100">
                    <h3 className="font-bold text-lg">Edit Image</h3>
                    <button onClick={onCancel} className="btn btn-ghost btn-circle btn-sm">
                        <X size={20} />
                    </button>
                </div>

                {/* Cropper Container */}
                <div className="relative flex-1 bg-neutral">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={setZoom}
                        cropShape={isCircular ? 'round' : 'rect'}
                        showGrid={true}
                        objectFit="contain"
                    />
                </div>

                {/* Controls */}
                <div className="p-4 space-y-4 bg-base-100 z-10 border-t border-base-200">
                    {/* Zoom Slider */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold w-12">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="range range-primary range-xs flex-1"
                        />
                    </div>

                    {/* Aspect Ratio Buttons */}
                    {!isCircular && (
                        <div className="flex justify-center gap-2 overflow-x-auto py-1">
                            <button
                                onClick={() => setAspect(1)}
                                className={`btn btn-xs ${aspect === 1 ? 'btn-neutral' : 'btn-ghost'}`}
                            >
                                Square
                            </button>
                            <button
                                onClick={() => setAspect(4 / 3)}
                                className={`btn btn-xs ${aspect === 4 / 3 ? 'btn-neutral' : 'btn-ghost'}`}
                            >
                                4:3
                            </button>
                            <button
                                onClick={() => setAspect(16 / 9)}
                                className={`btn btn-xs ${aspect === 16 / 9 ? 'btn-neutral' : 'btn-ghost'}`}
                            >
                                16:9
                            </button>
                            <button
                                onClick={() => setAspect(3 / 4)}
                                className={`btn btn-xs ${aspect === 3 / 4 ? 'btn-neutral' : 'btn-ghost'}`}
                            >
                                3:4
                            </button>
                            <button
                                onClick={() => setAspect(9 / 16)}
                                className={`btn btn-xs ${aspect === 9 / 16 ? 'btn-neutral' : 'btn-ghost'}`}
                            >
                                9:16
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button className="btn btn-ghost flex-1" onClick={onCancel}>Cancel</button>
                        <button className="btn btn-primary flex-1" onClick={handleSave}>
                            Apply <Check size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
