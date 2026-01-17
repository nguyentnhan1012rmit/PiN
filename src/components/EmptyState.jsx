import { FileQuestion } from 'lucide-react';

export default function EmptyState({
    icon: Icon = FileQuestion,
    title = "Nothing to see here",
    description = "There is no content to display at the moment.",
    action = null,
    className = ""
}) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-base-content/10 rounded-2xl bg-base-100/50 ${className}`}>
            <div className="w-16 h-16 rounded-full bg-base-200/50 flex items-center justify-center mb-4 text-base-content/40">
                <Icon size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-base-content mb-1">{title}</h3>
            <p className="text-base-content/60 max-w-sm mb-6">{description}</p>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}
