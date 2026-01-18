import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { Outlet } from 'react-router-dom';

interface WorkspaceHeroProps {
    user: User | null;
    showOnboarding?: boolean;
    onOnboardingComplete?: () => void;
}

export function WorkspaceHero({ user, showOnboarding, onOnboardingComplete }: WorkspaceHeroProps) {
    const firstName = user?.displayName?.split(' ')[0] || 'User';

    return (
        <section className="relative w-full bg-white overflow-visible">
            {/* Cutting Mat Container */}
            <div className="relative w-[calc(100%-3rem)] min-h-[85vh] bg-[#4f46e5] border-8 border-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col items-start justify-start rounded-[3rem] overflow-hidden mx-6 mt-4 mb-24">
                {/* Visual Details Layer: Grid, Noise, Marks */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Grid Pattern with White Lines */}
                    <div
                        className="absolute inset-0 opacity-[0.2]"
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

                    {/* Pencil Sketches / Scratches */}
                    <svg className="absolute top-10 right-10 w-40 h-40 opacity-20 rotate-12" viewBox="0 0 100 100">
                        <path d="M10,10 Q30,50 90,10 M20,20 L80,80 M10,90 L90,10" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
                    </svg>

                    {/* Texture Overlay */}
                    <div className="absolute inset-0 noise-overlay opacity-30 mix-blend-soft-light" />

                    {/* Permanent Scattered Designer Notes & Equations */}
                    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            className="absolute top-[18%] left-[12%] text-6xl md:text-8xl font-black text-white uppercase italic -rotate-12"
                        >RENT</motion.span>

                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.12 }}
                            className="absolute bottom-[22%] right-[8%] text-5xl md:text-7xl font-black text-white uppercase italic rotate-6"
                        >SPLIT</motion.span>

                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.25 }}
                            className="absolute top-[38%] right-[15%] text-4xl md:text-5xl font-black text-[#32dd9e] uppercase italic -rotate-3"
                        >TRACK EXPENSE</motion.span>

                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.1 }}
                            className="absolute bottom-[32%] left-[10%] text-6xl font-black text-white uppercase italic rotate-12"
                        >BILLS</motion.span>

                        {/* Raw Math Equation Scribble */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 0.2, x: 0 }}
                            className="absolute top-[48%] left-[6%] max-w-[350px] font-serif text-[12px] md:text-sm text-white/80 italic space-y-3 -rotate-3"
                        >
                            <div className="text-[10px] font-mono opacity-50 mb-1">// RENT_EQUITY_MODEL_v0.5</div>
                            <div className="flex items-center gap-2">
                                <span>Σ (ρ_i / n)</span>
                                <span className="text-lg">+</span>
                                <span className="flex flex-col items-center border-t border-white/50 pt-0.5 mt-2">
                                    <span>Δ area</span>
                                    <span className="text-[8px] opacity-60">κ_weight</span>
                                </span>
                                <span className="text-lg">→</span>
                                <span className="font-bold text-[#32dd9e]">fair_val_x</span>
                            </div>
                        </motion.div>

                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            className="absolute top-[12%] right-[32%] text-2xl font-mono text-white uppercase tracking-[0.5em]"
                        >:p</motion.span>
                    </div>
                </div>

                {/* Mat Content */}
                <div className={`relative z-10 w-full min-h-full flex flex-col ${showOnboarding ? 'items-center justify-center p-8 px-12 md:px-24' : 'p-0'}`}>
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
                                className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-16 px-12 md:px-24 py-12"
                            >
                                {/* Onboarding Content Restored from Previous Version but keeping it simple for now */}
                                <div className="flex-1 text-center space-y-6">
                                    <h1 className="text-7xl font-black text-white italic uppercase tracking-tighter">Welcome {firstName}!</h1>
                                    <p className="text-white/40 font-black uppercase tracking-[0.5em]">Initializing your studio mat...</p>
                                    <button
                                        onClick={onOnboardingComplete}
                                        className="bg-[#ff6d2f] text-white px-12 py-6 rounded-2xl font-black uppercase italic shadow-[0_10px_0_#9c3d14] active:translate-y-[10px] active:shadow-none transition-all"
                                    >
                                        Start Crafting
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                className="w-full flex-1 flex flex-col"
                            >
                                <Outlet />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Aesthetic Corner Marks */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                    <div className="absolute top-8 right-8 w-16 h-1 border-t border-white" />
                    <div className="absolute top-8 right-8 w-1 h-16 border-r border-white" />
                </div>

                {/* Measurement markings */}
                <div className="absolute bottom-4 left-0 w-full flex justify-between px-12 text-xs text-white/20 font-mono tracking-[0.5em] uppercase pointer-events-none">
                    {Array.from({ length: 11 }).map((_, i) => (
                        <span key={i} className="hidden md:block">{i * 10}CM</span>
                    ))}
                </div>
            </div>
        </section>
    );
}
