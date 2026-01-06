import { motion } from "framer-motion";
import { User } from "firebase/auth";
import { Home, Globe } from "lucide-react";

interface WelcomeOnboardingProps {
    user: User | null;
    onComplete: () => void;
}

export function WelcomeOnboarding({ user, onComplete }: WelcomeOnboardingProps) {
    const firstName = user?.displayName?.split(' ')[0] || "Rahul";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
            {/* The Integrated Mat Container */}
            <div className="relative w-full max-w-5xl aspect-video bg-[#1a3a2a] rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden border-8 border-white flex flex-col md:flex-row items-center gap-8 p-12">
                {/* Grid Pattern Background */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(#fff 1px, transparent 1px),
                            linear-gradient(90deg, #fff 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px'
                    }}
                />

                {/* Hand-drawn Character Illustration */}
                <div className="w-56 h-72 relative z-10 flex-shrink-0">
                    <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-xl">
                        {/* Square Head */}
                        <motion.path
                            d="M 50 20 Q 55 15 150 25 Q 155 90 145 120 Q 60 115 50 110 Z"
                            fill="white"
                            stroke="black"
                            strokeWidth="2.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                        />
                        {/* Eyes & Smile */}
                        <line x1="85" y1="50" x2="85" y2="75" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="115" y1="50" x2="115" y2="75" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M 90 95 Q 115 110 140 85" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />

                        {/* Neck/Body (Teardrop shape) */}
                        <motion.path
                            d="M 100 125 Q 115 140 120 180 Q 130 250 100 250 Q 70 250 80 180 Q 85 140 100 125"
                            fill="#ff8a47"
                            stroke="black"
                            strokeWidth="2.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                        />

                        {/* Stick Arms */}
                        <path d="M 85 170 L 40 210" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 120 170 L 170 210" stroke="white" strokeWidth="3" strokeLinecap="round" />

                        {/* Stick Legs */}
                        <path d="M 85 250 L 85 290 L 65 290" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 115 250 L 115 290 L 135 290" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Content Side */}
                <div className="flex-1 space-y-8 relative z-10 text-white">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black tracking-tight uppercase italic">
                            Welcome to SplitWayy, <span className="text-[#32dd9e]">{firstName.toUpperCase()}!</span>
                        </h1>
                        <p className="text-2xl text-white/60 font-medium italic uppercase tracking-wider">
                            What would you like to do first?
                        </p>
                    </div>

                    <div className="space-y-4 max-w-md">
                        <button
                            onClick={onComplete}
                            className="w-full flex items-center gap-4 bg-[#ff6d2f] hover:bg-[#e85a20] text-white p-4 rounded-xl shadow-[0_5px_0_#9c3d14] active:shadow-none active:translate-y-[5px] transition-all group border-2 border-white/10"
                        >
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Home className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-2xl font-black uppercase italic">Add your apartment</span>
                        </button>

                        <button
                            onClick={onComplete}
                            className="w-full flex items-center gap-4 bg-[#ff6d2f] hover:bg-[#e85a20] text-white p-4 rounded-xl shadow-[0_5px_0_#9c3d14] active:shadow-none active:translate-y-[5px] transition-all group border-2 border-white/10"
                        >
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Globe className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-2xl font-black uppercase italic">Add a group trip</span>
                        </button>

                        <button
                            onClick={onComplete}
                            className="w-full bg-white/10 hover:bg-white/20 text-white/70 p-4 rounded-xl border border-white/20 shadow-[0_3px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[3px] transition-all"
                        >
                            <span className="text-2xl font-bold uppercase italic">Skip setup for now</span>
                        </button>
                    </div>

                    <p className="text-white/40 text-lg font-mono uppercase tracking-widest">
                        Looking for our fairness calculators? <a href="#" className="text-white/80 hover:text-white underline decoration-[#32dd9e]">Click here.</a>
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
