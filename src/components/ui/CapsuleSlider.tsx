import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CapsuleSliderProps {
    items: {
        heading: string;
        description: string;
        icon: React.ReactNode;
        color: string;
        gradient: string;
    }[];
}

export function CapsuleSlider({ items }: CapsuleSliderProps) {
    const [index, setIndex] = useState(0);

    const next = () => setIndex((prev) => (prev + 1) % items.length);
    const prev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);

    return (
        <div className="relative w-full flex flex-col items-center justify-center h-[350px] perspective-[2000px] select-none">
            <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
                <AnimatePresence initial={false} mode="popLayout">
                    {items.map((item, i) => {
                        let position = i - index;

                        // Circular logic for shortest path
                        if (position < -Math.floor(items.length / 2)) position += items.length;
                        if (position > Math.floor(items.length / 2)) position -= items.length;

                        const isActive = position === 0;
                        const isVisible = Math.abs(position) <= 2;

                        if (!isVisible) return null;

                        return (
                            <motion.div
                                key={i}
                                initial={{
                                    opacity: 0,
                                    scale: 0.9,
                                    y: position * -30,
                                    z: -150
                                }}
                                animate={{
                                    y: isActive ? [position * -20, position * -20 - 8, position * -20] : position * -20,
                                    x: 0,
                                    z: -Math.abs(position) * 80,
                                    rotateX: position * 3.5,
                                    rotateZ: position * -0.5,
                                    scale: 1 - Math.abs(position) * 0.05,
                                    opacity: isActive ? 1 : 0.3 - Math.abs(position) * 0.1,
                                    zIndex: items.length - Math.abs(position),
                                }}
                                transition={{
                                    y: isActive ? {
                                        duration: 5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    } : {
                                        type: "spring",
                                        stiffness: 160,
                                        damping: 24
                                    },
                                    default: {
                                        type: "spring",
                                        stiffness: 160,
                                        damping: 24,
                                        mass: 0.8,
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.5,
                                    z: -400,
                                    transition: { duration: 0.4 }
                                }}
                                className={cn(
                                    "absolute w-[280px] sm:w-[320px] md:w-[400px] min-h-[200px] p-6 rounded-[2.5rem] bg-white border border-white/40 shadow-[0_15px_30px_-8px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center text-center overflow-hidden",
                                    "transition-shadow duration-500",
                                    isActive ? "shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-white/60" : "cursor-pointer pointer-events-none"
                                )}
                                onClick={() => !isActive && setIndex(i)}
                            >
                                {/* Item Specific Accent Glow */}
                                {isActive && (
                                    <div className={cn(
                                        "absolute inset-0 opacity-[0.1] rounded-[2.5rem] bg-gradient-to-br transition-opacity duration-1000",
                                        item.gradient
                                    )} />
                                )}

                                {/* Noise Texture Overlay */}
                                <div
                                    className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E")`
                                    }}
                                />

                                {isActive && (
                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-1 w-full pointer-events-none z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); prev(); }}
                                            className="pointer-events-auto -ml-3 p-2.5 rounded-full bg-white shadow-lg hover:bg-gray-50 text-zinc-900 transition-all hover:scale-110 active:scale-90 border border-black/5"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); next(); }}
                                            className="pointer-events-auto -mr-3 p-2.5 rounded-full bg-white shadow-lg hover:bg-gray-50 text-zinc-900 transition-all hover:scale-110 active:scale-90 border border-black/5"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className={cn(
                                    "relative mb-3 flex size-14 items-center justify-center rounded-xl backdrop-blur-md shadow-inner transition-colors duration-500",
                                    item.color.replace('text', 'bg'),
                                    "bg-opacity-20"
                                )}>
                                    <div className="w-full h-full p-1.5 drop-shadow-sm">
                                        {item.icon}
                                    </div>
                                </div>

                                <h3 className={cn(
                                    "relative mb-1 text-lg font-black tracking-tight leading-tight transition-colors duration-500",
                                    item.color
                                )}>
                                    {item.heading}
                                </h3>

                                <p className="relative text-gray-400 font-medium leading-relaxed text-xs px-4">
                                    {item.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex items-center gap-4">
                <div className="flex gap-1.5">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={cn(
                                "h-1 rounded-full transition-all duration-700 ease-in-out",
                                index === i ? "w-8 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
