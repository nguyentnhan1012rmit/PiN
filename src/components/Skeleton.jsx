export default function Skeleton({ className = "", variant = "rect", width, height }) {
    const variants = {
        circle: "rounded-full",
        rect: "rounded-md",
        text: "rounded-full" // Text lines are usually rounded at ends
    };

    const style = {
        width: width,
        height: height
    };

    return (
        <div
            className={`bg-base-content/10 animate-pulse ${variants[variant] || variants.rect} ${className}`}
            style={style}
        />
    );
}
