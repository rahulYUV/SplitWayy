import React, { useRef, useEffect, useState } from 'react';

/**
 * WaterRippleProps - Configuration for the WaterRipple component
 */
interface WaterRippleProps {
    image: string;      // The source URL of the avatar image
    className?: string; // Optional CSS classes for the container
    width?: number;     // Simulation width (higher = more detail, slower)
    height?: number;    // Simulation height
    damping?: number;   // How quickly waves lose energy (0.0 to 1.0)
    hoverRadius?: number; // Size of the ripple on mouse move
    clickRadius?: number; // Size of the ripple on mouse click
    strength?: number;    // Maximum height of the ripple waves
    glitch?: boolean;     // Enable digital distortion artifacts
    psychedelic?: boolean; // Enable color-shifting trippy mode
}

/**
 * WaterRipple Component
 * Renders a high-performance interactive water surface on top of any image using HTML5 Canvas.
 * Uses a double-buffered 2D wave equation simulation.
 */
export const WaterRipple: React.FC<WaterRippleProps> = ({
    image,
    className = "",
    width = 256,
    height = 256,
    damping = 0.96,
    hoverRadius = 5,
    clickRadius = 10,
    strength = 1800,
    glitch = false,
    psychedelic = false
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [useFallback, setUseFallback] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";

        // --- Simulation Buffers ---
        const size = width * height;
        const rippleBuffer1 = new Int32Array(size);
        const rippleBuffer2 = new Int32Array(size);
        let originalImageData: ImageData | null = null;
        let combinedImageData: ImageData | null = null;
        let animId: number;

        /**
         * Infuses energy into the simulation at a specific point
         */
        const dropRipple = (x: number, y: number, radius: number, s: number) => {
            for (let j = y - radius; j < y + radius; j++) {
                for (let i = x - radius; i < x + radius; i++) {
                    if (i >= 0 && i < width && j >= 0 && j < height) {
                        rippleBuffer1[j * width + i] += s;
                    }
                }
            }
        };

        /**
         * Main animation loop: Calculates physics and renders to canvas
         */
        const update = () => {
            if (!originalImageData || !combinedImageData || !ctx) {
                animId = requestAnimationFrame(update);
                return;
            }

            const data = originalImageData.data;
            const combinedData = combinedImageData.data;

            // --- 1. Physics Engine (Wave Equation) ---
            // Uses a double pass to increase wave propagation speed
            for (let pass = 0; pass < 2; pass++) {
                for (let i = width; i < width * (height - 1); i++) {
                    rippleBuffer2[i] = (((rippleBuffer1[i - 1] + rippleBuffer1[i + 1] +
                        rippleBuffer1[i - width] + rippleBuffer1[i + width]) >> 1) - rippleBuffer2[i]);
                    rippleBuffer2[i] = Math.floor(rippleBuffer2[i] * damping);
                }
                // Buffer Swap
                for (let i = 0; i < size; i++) {
                    const temp = rippleBuffer1[i];
                    rippleBuffer1[i] = rippleBuffer2[i];
                    rippleBuffer2[i] = temp;
                }
            }

            // --- 2. Rendering (Refraction & Chromatic Aberration) ---
            for (let i = width; i < width * (height - 1); i++) {
                const xOffset = rippleBuffer1[i - 1] - rippleBuffer1[i + 1];
                const yOffset = rippleBuffer1[i - width] - rippleBuffer1[i + width];

                // Performance optimization: skip processing if water is still
                if (xOffset === 0 && yOffset === 0) {
                    const idx = i * 4;
                    combinedData[idx] = data[idx];
                    combinedData[idx + 1] = data[idx + 1];
                    combinedData[idx + 2] = data[idx + 2];
                    combinedData[idx + 3] = 255;
                    continue;
                }

                // Refraction shift (distorting the background pixels)
                let shiftX = (xOffset * 1.6) | 0;
                let shiftY = (yOffset * 1.6) | 0;

                // --- Premium Mode: Psychedelic ---
                if (psychedelic) {
                    const time = Date.now() * 0.002;
                    shiftX += Math.sin(i * 0.05 + time) * 10;
                    shiftY += Math.cos(i * 0.05 + time) * 10;
                }

                // --- Premium Mode: Glitch ---
                if (glitch && Math.random() > 0.99) {
                    shiftX += (Math.random() - 0.5) * 50;
                }

                // Prismatic spread effect
                const chromOff = (xOffset >> (psychedelic ? 1 : 2));

                const getIdx = (sx: number, sy: number) => {
                    let tx = ((i % width) + sx) | 0;
                    let ty = (((i / width) | 0) + sy) | 0;
                    tx = Math.max(0, Math.min(width - 1, tx));
                    ty = Math.max(0, Math.min(height - 1, ty));
                    return (ty * width + tx) * 4;
                };

                const idxG = getIdx(shiftX, shiftY);
                const idxR = getIdx(shiftX + chromOff, shiftY);
                const idxB = getIdx(shiftX - chromOff, shiftY);

                const destIdx = i * 4;

                if (psychedelic) {
                    // Color channel rotation for trippy effects
                    combinedData[destIdx] = data[idxR + 1];
                    combinedData[destIdx + 1] = data[idxG + 2];
                    combinedData[destIdx + 2] = data[idxB];
                } else {
                    combinedData[destIdx] = data[idxR];
                    combinedData[destIdx + 1] = data[idxG + 1];
                    combinedData[destIdx + 2] = data[idxB + 2];
                }
                combinedData[destIdx + 3] = 255;

                // Specular highlights on wave peaks
                if (xOffset > 60) {
                    const shine = psychedelic ? 100 : 40;
                    combinedData[destIdx] = Math.min(255, combinedData[destIdx] + shine);
                    combinedData[destIdx + 1] = Math.min(255, combinedData[destIdx + 1] + shine);
                    combinedData[destIdx + 2] = Math.min(255, combinedData[destIdx + 2] + shine + 30);
                }
            }

            ctx.putImageData(combinedImageData, 0, 0);
            animId = requestAnimationFrame(update);
        };

        // --- Image Initialization ---
        img.onload = () => {
            if (!ctx) return;
            ctx.drawImage(img, 0, 0, width, height);
            try {
                originalImageData = ctx.getImageData(0, 0, width, height);
                combinedImageData = ctx.createImageData(width, height);
                setIsCanvasReady(true);
                setUseFallback(false);
                animId = requestAnimationFrame(update);
            } catch (e) {
                console.error("Canvas Security Error (CORS): Using static mode.", e);
                setUseFallback(true);
                setIsCanvasReady(false);
            }
        };

        img.onerror = () => {
            setUseFallback(true);
            setIsCanvasReady(false);
        };

        img.src = image;

        // --- User Interaction Listeners ---
        const hPM = (e: PointerEvent) => {
            if (!isCanvasReady) return;
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor(((e.clientX - rect.left) / rect.width) * width);
            const y = Math.floor(((e.clientY - rect.top) / rect.height) * height);
            dropRipple(x, y, hoverRadius, strength);
        };

        const hPD = (e: PointerEvent) => {
            if (!isCanvasReady) return;
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor(((e.clientX - rect.left) / rect.width) * width);
            const y = Math.floor(((e.clientY - rect.top) / rect.height) * height);

            // Generate primary splash
            dropRipple(x, y, clickRadius, strength * 4);

            // Create minor satellite ripples for realism
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                dropRipple(x + Math.cos(angle) * 15, y + Math.sin(angle) * 15, 4, strength);
            }
        };

        canvas.addEventListener('pointermove', hPM);
        canvas.addEventListener('pointerdown', hPD);

        return () => {
            canvas.removeEventListener('pointermove', hPM);
            canvas.removeEventListener('pointerdown', hPD);
            cancelAnimationFrame(animId);
        };
    }, [image, width, height, damping, hoverRadius, clickRadius, strength, glitch, psychedelic, isCanvasReady]);

    return (
        <div className={`relative group ${className} overflow-hidden rounded-xl bg-gray-100`}>
            {/* 1. Underlying Static Image (Base Layer / Fallback) */}
            <img
                src={image}
                alt="Avatar Base"
                className="w-full h-full object-cover absolute inset-0 z-0"
                onError={(e) => {
                    // Fallback to initial avatar if image fails to load entirely
                    (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=User&background=008cc9&color=fff&size=512";
                }}
            />

            {/* 2. Interactive Canvas (Animation Layer) */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={`w-full h-full block touch-none relative z-10 transition-opacity duration-500 scale-100 ${isCanvasReady && !useFallback ? 'opacity-100' : 'opacity-0'}`}
                style={{ cursor: 'pointer' }}
            />

            {/* 3. High-End UI Overlays (Borders & Glows) */}
            <div className="absolute inset-0 pointer-events-none rounded-xl border border-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)] z-30" />
            <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-tr from-[#32dd9e10] to-transparent mix-blend-overlay z-25" />
        </div>
    );
};
