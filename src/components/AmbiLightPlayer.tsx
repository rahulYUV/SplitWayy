import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Types for the component props
interface AmbiLightPlayerProps {
    src: string;
    className?: string;
    // Optional configuration props to match the user's description of features
    blur?: string; // e.g. "blur-2xl" or raw CSS value
    scale?: number; // Spread/Scale
}

export function AmbiLightPlayer({
    src,
    className,
    blur = "40px",
    scale = 1.05
}: AmbiLightPlayerProps) {
    const mainVideoRef = useRef<HTMLVideoElement>(null);
    const glowVideoRef = useRef<HTMLVideoElement>(null);

    // Force autoplay on mount to ensure browser policies are met
    useEffect(() => {
        const main = mainVideoRef.current;
        const glow = glowVideoRef.current;

        if (main && glow) {
            main.muted = true; // Ensure muted for autoplay policy
            glow.muted = true;

            const playPromise = main.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Main video autoplay failed:", error);
                });
            }

            const glowPromise = glow.play();
            if (glowPromise !== undefined) {
                glowPromise.catch(error => {
                    console.log("Glow video autoplay failed:", error);
                });
            }
        }
    }, []);

    // Keep the background video synced with the foreground video
    useEffect(() => {
        const main = mainVideoRef.current;
        const glow = glowVideoRef.current;

        if (!main || !glow) return;

        const syncLoop = () => {
            if (Math.abs(main.currentTime - glow.currentTime) > 0.1) {
                glow.currentTime = main.currentTime;
            }
            requestAnimationFrame(syncLoop);
        };

        const animationFrame = requestAnimationFrame(syncLoop);

        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <section className={cn("relative w-full max-w-7xl mx-auto my-12 px-4 sm:px-6 text-left", className)}>

            {/* Header Text */}
            <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-black/60 mb-2">
                    Intelligent Integration
                </h2>
                <p className="text-lg text-black/60 max-w-2xl">
                    Seamlessly connect and automate your expense tracking, unlocking multi-layered insights into your financial world.
                </p>
            </div>

            <div className="relative group">
                {/* Glow Layer (AmbiLight Effect) */}
                <div
                    className="absolute inset-0 z-0 opacity-60"
                    style={{
                        filter: `blur(${blur})`,
                        transform: `scale(${scale})`,
                    }}
                >
                    <video
                        ref={glowVideoRef}
                        src={src}
                        className="w-full aspect-video object-cover rounded-xl"
                        muted
                        loop
                        autoPlay
                        playsInline
                        disablePictureInPicture
                    />
                </div>

                {/* Main Player */}
                <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl bg-black border-2 border-[#ff6b35] ring-1 ring-[#ff6b35]/50">
                    <video
                        ref={mainVideoRef}
                        src={src}
                        className="w-full aspect-video object-cover block rounded-xl"
                        muted
                        loop
                        autoPlay
                        playsInline
                    />
                </div>
            </div>
        </section>
    );
}
