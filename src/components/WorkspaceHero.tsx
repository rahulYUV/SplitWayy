import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';

interface WorkspaceHeroProps {
    user: User | null;
    showOnboarding?: boolean;
    onOnboardingComplete?: () => void;
}

export function WorkspaceHero({ user, showOnboarding, onOnboardingComplete }: WorkspaceHeroProps) {
    const firstName = user?.displayName?.split(' ')[0] || 'User';

    return (
        <section className="relative w-full min-h-[100vh] flex flex-col items-center pt-24 bg-white overflow-hidden">
            {/* Cutting Mat Container - 80% Width */}
            <div className="relative w-[80%] flex-1 bg-[#1a3a2a] border-t-8 border-x-8 border-white shadow-[0_-20px_50px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center min-h-[700px]">
                {/* Visual Details Layer: Grid, Noise, Marks */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Grid Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.15]"
                        style={{
                            backgroundImage: `
                                linear-gradient(#fff 1px, transparent 1px),
                                linear-gradient(90deg, #fff 1px, transparent 1px),
                                linear-gradient(#fff 0.5px, transparent 0.5px),
                                linear-gradient(90deg, #fff 0.5px, transparent 0.5px)
                            `,
                            backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px'
                        }}
                    />

                    {/* Measurement Rulers */}
                    <div className="absolute top-0 left-0 w-full h-8 border-b border-white/5 bg-white/5 flex items-center px-4 justify-between font-mono text-[10px] text-white/20">
                        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(n => <span key={n}>{n}</span>)}
                    </div>

                    {/* Pencil Sketches / Scratches */}
                    <svg className="absolute top-10 right-10 w-40 h-40 opacity-20 rotate-12" viewBox="0 0 100 100">
                        <path d="M10,10 Q30,50 90,10 M20,20 L80,80 M10,90 L90,10" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
                    </svg>

                    {/* Texture Overlay */}
                    <div className="absolute inset-0 noise-overlay opacity-30 mix-blend-soft-light" />
                </div>

                {/* Mat Content */}
                <div className="relative z-10 w-full h-full flex items-center justify-center p-8 px-12 md:px-24">
                    <AnimatePresence mode="wait">
                        {showOnboarding ? (
                            <motion.div
                                key="onboarding"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                                    exit: { opacity: 0, scale: 0.95 }
                                }}
                                className="w-full flex flex-col md:flex-row items-center justify-between gap-16"
                            >
                                {/* Character Side */}
                                <motion.div
                                    variants={{
                                        hidden: { opacity: 0, x: -50 },
                                        visible: { opacity: 1, x: 0 }
                                    }}
                                    className="w-72 h-96 relative flex-shrink-0"
                                >
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/10 backdrop-blur-sm -rotate-3 border-x border-white/20 rounded-sm z-20 shadow-sm" />

                                    <motion.svg
                                        viewBox="0 0 200 300"
                                        className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                                        animate={{ y: [0, -8, 0], rotate: [0, 1, 0] }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <motion.path
                                            d="M 52 22 Q 58 12 152 27 Q 158 95 142 122 Q 58 118 48 112 Z"
                                            fill="white"
                                            stroke="#1a1a1a"
                                            strokeWidth="3"
                                            className="filter blur-[0.3px]"
                                        />
                                        <path d="M 60 40 L 140 100 M 130 30 L 70 110" stroke="#000" strokeWidth="0.2" opacity="0.1" />
                                        <circle cx="85" cy="62" r="3.5" fill="black" />
                                        <circle cx="115" cy="62" r="3.5" fill="black" />
                                        <path d="M 92 98 Q 115 115 145 88" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                                        <motion.path
                                            d="M 100 125 Q 115 140 120 185 Q 130 255 100 255 Q 70 255 80 185 Q 85 140 100 125"
                                            fill="#ff8a47"
                                            stroke="#222"
                                            strokeWidth="3"
                                            whileHover={{ scale: 1.05 }}
                                        />
                                        <path d="M 85 175 L 40 215" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                        <path d="M 120 175 L 175 215" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                        <path d="M 85 255 L 85 295 L 60 295" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                        <path d="M 115 255 L 115 295 L 140 295" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                    </motion.svg>
                                </motion.div>

                                {/* Content Side */}
                                <div className="flex-1 space-y-10 text-left relative">
                                    <div className="absolute -top-10 -left-10 w-32 h-6 bg-[#fff740]/20 -rotate-12 backdrop-blur-[1px] border-l border-white/20 z-0" />

                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0 }
                                        }}
                                        className="space-y-3 relative z-10"
                                    >
                                        <h1 className="text-6xl md:text-7xl font-black text-white tracking-widest uppercase italic leading-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
                                            WELCOME TO <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#32dd9e]">SPLITWAYY,</span><br />
                                            <span className="text-[#32dd9e]">{firstName.toUpperCase()}!</span>
                                        </h1>
                                        <p className="text-2xl text-white/40 font-black uppercase italic tracking-[0.3em] font-mono">
                                            What would you like to do first?
                                        </p>
                                    </motion.div>

                                    <div className="space-y-5 max-w-md relative z-10">
                                        <motion.button
                                            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                                            whileHover={{ scale: 1.03, rotate: 1, y: -2 }}
                                            onClick={onOnboardingComplete}
                                            className="w-full flex items-center justify-between gap-6 bg-[#ff6d2f] text-white p-6 rounded-2xl shadow-[0_12px_30px_rgba(255,109,47,0.3),_0_8px_0_#9c3d14] active:shadow-none active:translate-y-[8px] transition-all border-4 border-white/10 group"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="relative w-14 h-14 bg-white rounded-xl shadow-inner flex items-center justify-center overflow-hidden rotate-3 group-hover:rotate-0 transition-transform p-2">
                                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                                        <polygon points="50,15 20,45 50,45" fill="#a855f7" />
                                                        <polygon points="50,15 80,45 50,45" fill="#7c3aed" />
                                                        <polygon points="20,45 20,85 50,85" fill="#6b21a8" />
                                                        <polygon points="80,45 80,85 50,85" fill="#4c1d95" />
                                                        <polygon points="50,45 20,85 80,85" fill="#9333ea" opacity="0.3" />
                                                    </svg>
                                                </div>
                                                <span className="text-3xl font-black uppercase italic tracking-tighter">Add apartment</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        </motion.button>

                                        <motion.button
                                            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                                            whileHover={{ scale: 1.03, rotate: -1, y: -2 }}
                                            onClick={onOnboardingComplete}
                                            className="w-full flex items-center justify-between gap-6 bg-[#ff6d2f] text-white p-6 rounded-2xl shadow-[0_12px_30px_rgba(255,109,47,0.3),_0_8px_0_#9c3d14] active:shadow-none active:translate-y-[8px] transition-all border-4 border-white/10 group"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="relative w-14 h-14 bg-white rounded-xl shadow-inner flex items-center justify-center overflow-hidden -rotate-3 group-hover:rotate-0 transition-transform p-2">
                                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                                        <polygon points="20,50 50,35 50,65" fill="#14b8a6" />
                                                        <polygon points="50,35 80,20 80,35" fill="#0f766e" />
                                                        <polygon points="50,65 80,80 80,65" fill="#115e59" />
                                                        <polygon points="50,35 80,50 50,65" fill="#2dd4bf" />
                                                        <polygon points="20,50 80,20 80,80" fill="#0d9488" opacity="0.1" />
                                                    </svg>
                                                </div>
                                                <span className="text-3xl font-black uppercase italic tracking-tighter">Plan a trip</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        </motion.button>

                                        <motion.button
                                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                                            onClick={onOnboardingComplete}
                                            className="w-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/60 p-5 rounded-2xl border-2 border-white/10 transition-all font-black uppercase italic text-xl tracking-[0.2em]"
                                        >
                                            Skip setup for now
                                        </motion.button>
                                    </div>

                                    <motion.p
                                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                                        className="text-white/20 text-sm font-mono uppercase tracking-[0.4em] flex items-center gap-4"
                                    >
                                        <span className="w-12 h-[1px] bg-white/10" />
                                        Fairness calculators? <a href="#" className="text-white/50 hover:text-[#32dd9e] underline decoration-[#32dd9e] underline-offset-8 transition-colors">Click here.</a>
                                    </motion.p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="regular"
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.2, ease: "circOut" }}
                                className="flex flex-col items-center"
                            >
                                <h1 className="text-8xl md:text-[10rem] font-black text-white tracking-tighter uppercase italic select-none drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]">
                                    HI, {firstName.toUpperCase()}!
                                </h1>
                                <p className="mt-8 text-2xl md:text-3xl font-black text-white/20 tracking-[0.6em] uppercase italic select-none font-mono">
                                    YOUR DIGITAL WORKSPACE
                                </p>
                                <div className="mt-12 flex items-center gap-4 opacity-40">
                                    <div className="w-8 h-8 bg-[#9333ea] rounded-lg" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                                    <div className="w-8 h-8 bg-[#14b8a6] rounded-lg" style={{ clipPath: 'polygon(100% 50%, 0% 0%, 0% 100%)' }} />
                                    <span className="text-white font-black italic uppercase tracking-widest text-sm">SplitWayy Systems</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Fixed Aesthetic Corner Marks */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                    <div className="absolute top-8 right-8 w-16 h-1 border-t border-white" />
                    <div className="absolute top-8 right-8 w-1 h-16 border-r border-white" />
                    <span className="absolute top-10 right-10 text-[8px] font-mono text-white">REF:PW-2026</span>
                </div>

                {/* Measurement markings on the mat edge */}
                <div className="absolute bottom-4 left-0 w-full flex justify-between px-12 text-xs text-white/20 font-mono tracking-[0.5em] uppercase pointer-events-none">
                    {Array.from({ length: 11 }).map((_, i) => (
                        <span key={i} className="hidden md:block transition-all hover:text-white/60">{i * 10}CM</span>
                    ))}
                    <span className="md:hidden">0CM</span>
                    <span className="md:hidden">50CM</span>
                    <span className="md:hidden">100CM</span>
                </div>

                {/* Corner detail */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-white/10" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/10" />
            </div>
        </section>
    );
}
