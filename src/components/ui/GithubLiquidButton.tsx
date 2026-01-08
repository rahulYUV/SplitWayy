"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github } from 'lucide-react';
import { cn } from "@/lib/utils";

type ColorKey =
    | 'color1'
    | 'color2'
    | 'color3'
    | 'color4'
    | 'color5'
    | 'color6'
    | 'color7'
    | 'color8'
    | 'color9'
    | 'color10'
    | 'color11'
    | 'color12'
    | 'color13'
    | 'color14'
    | 'color15'
    | 'color16'
    | 'color17';

export type Colors = Record<ColorKey, string>;

// Vibrant Blue/Purple Palette for the Liquid Effect
const COLORS: Colors = {
    color1: '#FFFFFF',
    color2: '#1E10C5',
    color3: '#9089FC',
    color4: '#FCFCFE',
    color5: '#F9F9FD',
    color6: '#B2B8E7',
    color7: '#0E21DB',
    color8: '#2614C1',
    color9: '#D9D9D9',
    color10: '#A3A3A3',
    color11: '#F3F3F3',
    color12: '#1C1C1C',
    color13: '#383838',
    color14: '#545454',
    color15: '#707070',
    color16: '#8C8C8C',
    color17: '#A8A8A8',
};

const svgOrder = [
    'svg1',
    'svg2',
    'svg3',
    'svg4',
    'svg3',
    'svg2',
    'svg1',
] as const;

type SvgKey = (typeof svgOrder)[number];

type Stop = {
    offset: number;
    stopColor: string;
};

type SvgState = {
    gradientTransform: string;
    stops: Stop[];
};

type SvgStates = Record<SvgKey, SvgState>;

const createStopsArray = (
    svgStates: SvgStates,
    svgOrder: readonly SvgKey[],
    maxStops: number
): Stop[][] => {
    let stopsArray: Stop[][] = [];
    for (let i = 0; i < maxStops; i++) {
        let stopConfigurations = svgOrder.map((svgKey) => {
            let svg = svgStates[svgKey];
            return svg.stops[i] || svg.stops[svg.stops.length - 1];
        });
        stopsArray.push(stopConfigurations);
    }
    return stopsArray;
};

type GradientSvgProps = {
    className: string;
    isHovered: boolean;
    colors: Colors;
};

const GradientSvg: React.FC<GradientSvgProps> = ({
    className,
    isHovered,
    colors,
}) => {
    const svgStates: SvgStates = {
        svg1: {
            gradientTransform:
                'translate(287.5 280) rotate(-29.0546) scale(689.807 1000)',
            stops: [
                { offset: 0, stopColor: colors.color1 },
                { offset: 0.188423, stopColor: colors.color2 },
                { offset: 0.260417, stopColor: colors.color3 },
                { offset: 0.328792, stopColor: colors.color4 },
                { offset: 0.328892, stopColor: colors.color5 },
                { offset: 0.328992, stopColor: colors.color1 },
                { offset: 0.442708, stopColor: colors.color6 },
                { offset: 0.537556, stopColor: colors.color7 },
                { offset: 0.631738, stopColor: colors.color1 },
                { offset: 0.725645, stopColor: colors.color8 },
                { offset: 0.817779, stopColor: colors.color9 },
                { offset: 0.84375, stopColor: colors.color10 },
                { offset: 0.90569, stopColor: colors.color1 },
                { offset: 1, stopColor: colors.color11 },
            ],
        },
        svg2: {
            gradientTransform:
                'translate(126.5 418.5) rotate(-64.756) scale(533.444 773.324)',
            stops: [
                { offset: 0, stopColor: colors.color1 },
                { offset: 0.104167, stopColor: colors.color12 },
                { offset: 0.182292, stopColor: colors.color13 },
                { offset: 0.28125, stopColor: colors.color1 },
                { offset: 0.328792, stopColor: colors.color4 },
                { offset: 0.328892, stopColor: colors.color5 },
                { offset: 0.453125, stopColor: colors.color6 },
                { offset: 0.515625, stopColor: colors.color7 },
                { offset: 0.631738, stopColor: colors.color1 },
                { offset: 0.692708, stopColor: colors.color8 },
                { offset: 0.75, stopColor: colors.color14 },
                { offset: 0.817708, stopColor: colors.color9 },
                { offset: 0.869792, stopColor: colors.color10 },
                { offset: 1, stopColor: colors.color1 },
            ],
        },
        svg3: {
            gradientTransform:
                'translate(264.5 339.5) rotate(-42.3022) scale(946.451 1372.05)',
            stops: [
                { offset: 0, stopColor: colors.color1 },
                { offset: 0.188423, stopColor: colors.color2 },
                { offset: 0.307292, stopColor: colors.color1 },
                { offset: 0.328792, stopColor: colors.color4 },
                { offset: 0.328892, stopColor: colors.color5 },
                { offset: 0.442708, stopColor: colors.color15 },
                { offset: 0.537556, stopColor: colors.color16 },
                { offset: 0.631738, stopColor: colors.color1 },
                { offset: 0.725645, stopColor: colors.color17 },
                { offset: 0.817779, stopColor: colors.color9 },
                { offset: 0.84375, stopColor: colors.color10 },
                { offset: 0.90569, stopColor: colors.color1 },
                { offset: 1, stopColor: colors.color11 },
            ],
        },
        svg4: {
            gradientTransform:
                'translate(860.5 420) rotate(-153.984) scale(957.528 1388.11)',
            stops: [
                { offset: 0.109375, stopColor: colors.color11 },
                { offset: 0.171875, stopColor: colors.color2 },
                { offset: 0.260417, stopColor: colors.color13 },
                { offset: 0.328792, stopColor: colors.color4 },
                { offset: 0.328892, stopColor: colors.color5 },
                { offset: 0.328992, stopColor: colors.color1 },
                { offset: 0.442708, stopColor: colors.color6 },
                { offset: 0.515625, stopColor: colors.color7 },
                { offset: 0.631738, stopColor: colors.color1 },
                { offset: 0.692708, stopColor: colors.color8 },
                { offset: 0.817708, stopColor: colors.color9 },
                { offset: 0.869792, stopColor: colors.color10 },
                { offset: 1, stopColor: colors.color11 },
            ],
        },
    };

    const maxStops = Math.max(
        ...Object.values(svgStates).map((svg) => svg.stops.length)
    );
    const stopsAnimationArray = createStopsArray(svgStates, svgOrder, maxStops);
    const gradientTransform = svgOrder.map(
        (svgKey) => svgStates[svgKey].gradientTransform
    );

    const variants = {
        hovered: {
            gradientTransform: gradientTransform,
            transition: { duration: 50, repeat: Infinity, ease: 'linear' as const },
        },
        notHovered: {
            gradientTransform: gradientTransform,
            transition: { duration: 10, repeat: Infinity, ease: 'linear' as const },
        },
    };

    return (
        <svg
            className={className}
            width='1030'
            height='280'
            viewBox='0 0 1030 280'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <rect
                width='1030'
                height='280'
                rx='140'
                fill='url(#paint0_radial_905_231)'
            />
            <defs>
                <motion.radialGradient
                    id='paint0_radial_905_231'
                    cx='0'
                    cy='0'
                    r='1'
                    gradientUnits='userSpaceOnUse'
                    // @ts-ignore
                    animate={isHovered ? variants.hovered : variants.notHovered}
                >
                    {stopsAnimationArray.map((stopConfigs, index) => (
                        <AnimatePresence key={index}>
                            <motion.stop
                                initial={{
                                    offset: stopConfigs[0].offset,
                                    stopColor: stopConfigs[0].stopColor,
                                }}
                                animate={{
                                    offset: stopConfigs.map((config) => config.offset),
                                    stopColor: stopConfigs.map((config) => config.stopColor),
                                }}
                                transition={{
                                    duration: 0,
                                    ease: 'linear',
                                    repeat: Infinity,
                                }}
                            />
                        </AnimatePresence>
                    ))}
                </motion.radialGradient>
            </defs>
        </svg>
    );
};

type LiquidProps = {
    isHovered: boolean;
    colors: Colors;
    buttonType?: boolean;
};

const Liquid: React.FC<LiquidProps> = ({
    isHovered,
    colors,
}) => {
    return (
        <>
            {Array.from({ length: 7 }).map((_, index) => (
                <div
                    key={index}
                    className={`absolute ${index < 3 ? 'w-[443px] h-[121px]' : 'w-[756px] h-[207px]'
                        } ${index === 0
                            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-difference'
                            : index === 1
                                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[164.971deg] mix-blend-difference'
                                : index === 2
                                    ? 'top-1/2 left-1/2 -translate-x-[53%] -translate-y-[53%] rotate-[-11.61deg] mix-blend-difference'
                                    : index === 3
                                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-[57%] rotate-[-179.012deg] mix-blend-difference'
                                        : index === 4
                                            ? 'top-1/2 left-1/2 -translate-x-[57%] -translate-y-1/2 rotate-[-29.722deg] mix-blend-difference'
                                            : index === 5
                                                ? 'top-1/2 left-1/2 -translate-x-[62%] -translate-y-[24%] rotate-[160.227deg] mix-blend-difference'
                                                : 'top-1/2 left-1/2 -translate-x-[67%] -translate-y-[29%] rotate-180 mix-blend-hard-light'
                        }`}
                >
                    <GradientSvg
                        className='w-full h-full'
                        isHovered={isHovered}
                        colors={colors}
                    />
                </div>
            ))}
        </>
    );
};

// Orange Palette for Home Button
const HOME_COLORS: Colors = {
    color1: '#FFFFFF',
    color2: '#EA580C', // Orange 600
    color3: '#F97316', // Orange 500
    color4: '#FFF7ED', // Orange 50
    color5: '#FFEDD5', // Orange 100
    color6: '#FDBA74', // Orange 300
    color7: '#C2410C', // Orange 700
    color8: '#9A3412', // Orange 800
    color9: '#FFedd5', // Orange 100
    color10: '#A3A3A3',
    color11: '#F3F3F3',
    color12: '#1C1C1C',
    color13: '#383838',
    color14: '#545454',
    color15: '#707070',
    color16: '#8C8C8C',
    color17: '#A8A8A8',
};

export function GithubLiquidButton({ className }: { className?: string }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <a
            href="https://github.com/rahulYUV"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "relative flex items-center justify-center px-4 py-2 rounded-full overflow-hidden bg-[#0A0A0A] group shadow-xl transition-transform active:scale-95",
                className
            )}
            style={{ width: 'fit-content', minWidth: '120px' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                <Liquid isHovered={isHovered} colors={COLORS} />
            </div>

            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] group-hover:backdrop-blur-none transition-all" />

            <div className="relative z-10 flex items-center gap-2 text-white font-bold text-sm tracking-wide">
                <Github fill="currentColor" className="w-5 h-5 drop-shadow-md" />
                <span className="drop-shadow-md">Github</span>
            </div>
        </a>
    );
}

export function HomeLiquidButton({ className, onClick }: { className?: string; onClick?: () => void }) {
    const [isHovered, setIsHovered] = useState(false);

    // If onClick is provided, use button, else use Link (handled by parent?)
    // User asked "home ko bhi karo". Home usually links to "/"
    // I will return a Link component provided by react-router-dom or just an anchor if passed href, 
    // but here I will make it a click-able div/button to be wrapped or used directly.
    // Actually, Navbar uses Link to="/". I should probably wrap it or accept href.
    // I'll make it accepting onClick or behave as a button. Navbar can wrap it in Link.

    return (
        <div
            className={cn(
                "relative flex items-center justify-center px-4 py-2 rounded-full overflow-hidden bg-[#EA580C] group shadow-xl transition-transform active:scale-95 cursor-pointer",
                className
            )}
            style={{ width: 'fit-content', minWidth: '120px' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div className="absolute inset-0 w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                <Liquid isHovered={isHovered} colors={HOME_COLORS} />
            </div>

            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] group-hover:backdrop-blur-none transition-all" />

            <div className="relative z-10 flex items-center gap-2 text-white font-bold text-sm tracking-wide">
                {/* Home Icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-md"
                >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="drop-shadow-md">Home</span>
            </div>
        </div>
    );
}

// Green Palette for Login Button
const LOGIN_COLORS: Colors = {
    color1: '#FFFFFF',
    color2: '#32dd9e', // Primary Green
    color3: '#6fffcb', // Light Green
    color4: '#f0fdf9', // Very Light
    color5: '#e6fffa', // Log in Light
    color6: '#9bfcdb',
    color7: '#2bc58d', // Darker Green
    color8: '#1da872', // Even Darker
    color9: '#ccfbf1',
    color10: '#A3A3A3',
    color11: '#F3F3F3',
    color12: '#1C1C1C',
    color13: '#383838',
    color14: '#545454',
    color15: '#707070',
    color16: '#8C8C8C',
    color17: '#A8A8A8',
};

export function LoginLiquidButton({ className, onClick }: { className?: string; onClick?: () => void }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex items-center justify-center px-4 py-2 rounded-full overflow-hidden bg-[#32dd9e] group shadow-xl transition-transform active:scale-95 cursor-pointer",
                className
            )}
            style={{ width: 'fit-content', minWidth: '100px' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                <Liquid isHovered={isHovered} colors={LOGIN_COLORS} />
            </div>

            <div className="absolute inset-0 bg-black/5 backdrop-blur-[0px] group-hover:backdrop-blur-none transition-all" />

            <div className="relative z-10 flex items-center gap-2 text-white font-bold text-sm tracking-wide">
                <span className="drop-shadow-md">Log in</span>
            </div>
        </button>
    );
}

// Red Palette for Fast Split Button
const FAST_SPLIT_COLORS: Colors = {
    color1: '#FFFFFF',
    color2: '#DC2626', // Red 600
    color3: '#F87171', // Red 400
    color4: '#FEF2F2', // Red 50
    color5: '#FEE2E2', // Red 100
    color6: '#FCA5A5', // Red 300
    color7: '#B91C1C', // Red 700
    color8: '#991B1B', // Red 800
    color9: '#FECACA', // Red 200
    color10: '#A3A3A3',
    color11: '#F3F3F3',
    color12: '#1C1C1C',
    color13: '#383838',
    color14: '#545454',
    color15: '#707070',
    color16: '#8C8C8C',
    color17: '#A8A8A8',
};

export function FastSplitLiquidButton({ className }: { className?: string }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <a
            href="/quick-split"
            className={cn(
                "relative flex items-center justify-center px-4 py-2 rounded-full overflow-hidden bg-[#DC2626] group shadow-xl transition-transform active:scale-95 cursor-pointer no-underline",
                className
            )}
            style={{ width: 'fit-content', minWidth: '130px' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                <Liquid isHovered={isHovered} colors={FAST_SPLIT_COLORS} />
            </div>

            <div className="absolute inset-0 bg-black/10 backdrop-blur-[0px] group-hover:backdrop-blur-none transition-all" />

            <div className="relative z-10 flex items-center gap-2 text-white font-bold text-sm tracking-wide">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md"><path d="M16 3h5v5" /><path d="M10 21H5v-5" /><path d="M21 3 14.5 9.5" /><path d="M3 21l6.5-6.5" /></svg>
                <span className="drop-shadow-md">Fast Split</span>
            </div>
        </a>
    );
}
