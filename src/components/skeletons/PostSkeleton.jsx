import Skeleton from '../Skeleton';

export default function PostSkeleton() {
    return (
        <div className="card-glass p-6 rounded-2xl mb-6 border border-white/5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <Skeleton variant="circle" className="w-10 h-10 shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton variant="text" className="h-4 w-32" />
                    <Skeleton variant="text" className="h-3 w-20" />
                </div>
                <Skeleton variant="circle" className="w-8 h-8 shrink-0 opacity-50" />
            </div>

            {/* Content */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton variant="text" className="h-4 w-full" />
                    <Skeleton variant="text" className="h-4 w-[90%]" />
                    <Skeleton variant="text" className="h-4 w-[40%]" />
                </div>

                {/* Image Placeholder */}
                <Skeleton variant="rect" className="w-full h-[300px] rounded-xl" />

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                    <Skeleton variant="rect" className="h-8 w-20 rounded-full" />
                    <Skeleton variant="rect" className="h-8 w-24 rounded-full" />
                </div>
            </div>
        </div>
    );
}
