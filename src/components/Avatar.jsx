import { useState } from 'react';
import { User } from 'lucide-react';

export default function Avatar({ src, alt, size = "md", className = "" }) {
    const [error, setError] = useState(false);

    // Size mappings
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-xl",
        xl: "w-24 h-24 text-3xl"
    };

    const containerSize = sizeClasses[size] || sizeClasses.md;

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const placeholderUrl = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

    return (
        <img
            src={(!src || error) ? placeholderUrl : src}
            alt={alt || "Avatar"}
            className={`object-cover rounded-full bg-base-200 ${containerSize} ${className}`}
            onError={() => setError(true)}
        />
    );
}
