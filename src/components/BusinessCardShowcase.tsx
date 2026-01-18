import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Reusable Card Component
const BusinessCard = ({
    className,
    children
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.3 } }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
                "relative flex flex-col justify-between w-full aspect-[1.58/1] sm:max-w-md bg-[#FDFBF7] p-6 sm:p-8 shadow-2xl overflow-hidden",
                "border border-stone-200",
                className
            )}
        >
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
            {children}
        </motion.div>
    );
};

// Line Art Decoration Component (Abstract representation of the doodles)
const DoodlePattern = ({ className }: { className?: string }) => (
    <svg className={cn("absolute bottom-0 left-0 w-full h-24 sm:h-32 text-black/80", className)} viewBox="0 0 400 100" preserveAspectRatio="none">
        <path d="M0,100 L0,50 Q10,40 20,50 T40,50 T60,50 T80,40 T100,60 T120,40 T140,50 T160,50 T180,60 T200,40 T220,50 T240,60 T260,40 T280,50 T300,50 T320,40 T340,60 T360,50 T380,40 T400,50 L400,100 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10,100 L10,80 Q20,70 30,80" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="50" cy="80" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="70" y="70" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M120,100 L140,70 L160,100" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="90" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M250,100 C250,70 280,70 280,100" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="320" y="80" width="20" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M360,100 L370,60 L380,100" fill="none" stroke="currentColor" strokeWidth="1" />

        {/* Simple geometric fills to mimic the busy bottom look */}
        <path d="M0,100 H400 V90 H0 Z" fill="currentColor" opacity="0.05" />
    </svg>
);

export function BusinessCardShowcase() {
    return (
        <section className="max-w-7xl mx-auto my-12 relative rounded-xl overflow-hidden shadow-2xl">
            {/* Background & Pattern applied to the container */}
            <div className="absolute inset-0 bg-[#ff6b35]">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply" />
            </div>

            <div className="relative z-10 px-4 sm:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center justify-center">

                    {/* Card 1: Rahul Kumar (Left) */}
                    <BusinessCard className="hover:shadow-[0_40px_80px_-12px_rgba(0,0,0,0.2)] transition-shadow duration-500">
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                {/* Logo Icon */}
                                <div className="absolute top-0 right-0">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                                        <path d="M12 2L2 19H22L12 2ZM12 5.8L18.5 17H5.5L12 5.8Z" />
                                    </svg>
                                </div>
                                <h3 className="font-serif text-3xl sm:text-4xl text-black font-medium tracking-tight mb-1">
                                    Rahul Kumar
                                </h3>
                                <p className="font-serif text-sm text-black/70 font-medium">Developer</p>
                            </div>

                            <div className="flex justify-between items-end mt-12 sm:mt-0 font-mono text-[10px] sm:text-xs text-black/80 leading-tight">
                                <div>
                                    <p>+91 98765 43210</p>
                                    <p>rahul@splitwayy.com</p>
                                    <p>splitwayy.com</p>
                                </div>
                                <div className="text-right">
                                    <p>123 Innovation Dr</p>
                                    <p>Tech City, TC 56001</p>
                                    <p>India</p>
                                </div>
                            </div>
                        </div>
                        <DoodlePattern className="opacity-10" />
                    </BusinessCard>

                    {/* Card 2: SplitWayy Center (Center) */}
                    <BusinessCard className="items-center justify-center text-center hover:shadow-[0_40px_80px_-12px_rgba(0,0,0,0.2)] transition-shadow duration-500">
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="w-12 h-12 bg-black text-[#FDFBF7] flex items-center justify-center rounded-full">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-serif text-4xl sm:text-5xl text-black leading-none mb-2">SplitWayy</h3>
                                <p className="font-serif text-sm italic text-black/60">Seamless Expense Sharing</p>
                            </div>
                        </div>
                        <div className="absolute bottom-8 text-[10px] font-mono text-black/40">
                            EST. 2026
                        </div>
                    </BusinessCard>

                    {/* Card 3: SplitWayy Details (Right) */}
                    <BusinessCard className="hover:shadow-[0_40px_80px_-12px_rgba(0,0,0,0.2)] transition-shadow duration-500">
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                    </svg>
                                    <span className="font-serif font-bold text-lg">SplitWayy Inc.</span>
                                </div>
                                <h3 className="font-serif text-2xl text-black leading-tight max-w-[80%]">
                                    Simplify your shared finances today.
                                </h3>
                            </div>

                            <div className="flex justify-between items-end mt-12 sm:mt-0 font-mono text-[10px] sm:text-xs text-black/80 leading-tight">
                                <div>
                                    <p>Connect</p>
                                    <p>Automate</p>
                                    <p>Relax</p>
                                </div>
                                <div className="text-right">
                                    <p>Pune</p>

                                    <p>India</p>
                                </div>
                            </div>
                        </div>
                        <DoodlePattern className="opacity-20 scale-x-[-1]" />
                    </BusinessCard>

                </div>
            </div>
        </section>
    );
}
