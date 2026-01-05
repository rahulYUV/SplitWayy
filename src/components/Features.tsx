import { TextClipPathReveal } from "./ui/TextClipPathReveal";
import { motion } from "framer-motion";
import { CapsuleSlider } from "./ui/CapsuleSlider";

// Importing images from assets
import flightImg from "@/assets/images/Flight.png";
import homeImg from "@/assets/images/Home.png";
import lvImg from "@/assets/images/lv.png";
import logoImg from "@/assets/images/LOGO.png";

const leftItems = [
    {
        heading: "Add groups and friends",
        description: "Easily organize your social circles and trips.",
        icon: <img src={lvImg} alt="Groups" className="w-full h-full object-contain" />,
        color: "text-purple-500",
        gradient: "from-purple-500/20 to-purple-500/5",
    },
    {
        heading: "Split expenses, record debts",
        description: "Keep a clear log of every shared bill.",
        icon: <img src={flightImg} alt="Split" className="w-full h-full object-contain" />,
        color: "text-teal-400",
        gradient: "from-teal-400/20 to-teal-400/5",
    },
    {
        heading: "Equal or unequal splits",
        description: "Flexible cost sharing for any situation.",
        icon: <img src={homeImg} alt="Equal" className="w-full h-full object-contain" />,
        color: "text-red-500",
        gradient: "from-red-500/20 to-red-500/5",
    },
    {
        heading: "Split by % or shares",
        description: "Advanced splitting for ultimate precision.",
        icon: <img src={logoImg} alt="Shares" className="w-full h-full object-contain p-2" />,
        color: "text-orange-500",
        gradient: "from-orange-500/20 to-orange-500/5",
    },
    {
        heading: "Calculate total balances",
        description: "See exactly who owes what at a glance.",
        icon: <img src={lvImg} alt="Balances" className="w-full h-full object-contain" />,
        color: "text-blue-500",
        gradient: "from-blue-500/20 to-blue-500/5",
    },
    {
        heading: "Simplify debts",
        description: "Reduces the number of total transactions.",
        icon: <img src={flightImg} alt="Simplify" className="w-full h-full object-contain" />,
        color: "text-teal-400",
        gradient: "from-teal-400/20 to-teal-400/5",
    },
];

const rightItems = [
    {
        heading: "Recurring expenses",
        description: "Automate your monthly bills and rent.",
        icon: <img src={homeImg} alt="Recurring" className="w-full h-full object-contain" />,
        color: "text-purple-500",
        gradient: "from-purple-500/20 to-purple-500/5",
    },
    {
        heading: "Cloud sync",
        description: "Real-time updates across all your devices.",
        icon: <img src={logoImg} alt="Sync" className="w-full h-full object-contain p-2" />,
        color: "text-blue-500",
        gradient: "from-blue-500/20 to-blue-500/5",
    },
    {
        heading: "Spending totals",
        description: "Visual summaries of your shared costs.",
        icon: <img src={lvImg} alt="Spending" className="w-full h-full object-contain" />,
        color: "text-orange-500",
        gradient: "from-orange-500/20 to-orange-500/5",
    },
    {
        heading: "Categorize expenses",
        description: "Organize everything from rent to travel.",
        icon: <img src={flightImg} alt="Category" className="w-full h-full object-contain" />,
        color: "text-teal-400",
        gradient: "from-teal-400/20 to-teal-400/5",
    },
    {
        heading: "7+ languages",
        description: "A localized experience for everyone.",
        icon: <img src={homeImg} alt="Languages" className="w-full h-full object-contain" />,
        color: "text-red-500",
        gradient: "from-red-500/20 to-red-500/5",
    },
    {
        heading: "A totally ad-free experience",
        description: "Zero distractions, just easy splitting.",
        icon: <img src={logoImg} alt="Ads" className="w-full h-full object-contain p-2" />,
        color: "text-orange-500",
        gradient: "from-orange-500/20 to-orange-500/5",
    },
];

export function Features() {
    return (
        <section className="relative w-full py-12 overflow-hidden bg-background">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="relative w-full py-24 overflow-hidden rounded-[3.5rem] bg-[#7c3aed] shadow-[0_40px_100px_-30px_rgba(124,58,237,0.3)]">
                    {/* Direct Low-Poly Geometric Background Pattern */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] opacity-90" />
                        <svg
                            className="absolute inset-x-0 top-0 w-full h-full opacity-[0.4] mix-blend-overlay"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1600 800"
                            preserveAspectRatio="none"
                        >
                            <g>
                                <polygon points="0,0 400,0 200,150" fill="#7c3aed" />
                                <polygon points="400,0 800,0 600,200" fill="#6d28d9" />
                                <polygon points="800,0 1200,0 1000,100" fill="#9333ea" />
                                <polygon points="1200,0 1600,0 1400,250" fill="#7c3aed" />

                                <polygon points="0,0 200,150 0,300" fill="#6d28d9" />
                                <polygon points="200,150 600,200 400,400" fill="#5b21b6" />
                                <polygon points="600,200 1000,100 900,300" fill="#7c3aed" />
                                <polygon points="1000,100 1400,250 1200,400" fill="#6d28d9" />
                                <polygon points="1400,250 1600,0 1600,400" fill="#5b21b6" />

                                <polygon points="0,300 400,400 0,600" fill="#5b21b6" />
                                <polygon points="400,400 900,300 700,550" fill="#6d28d9" />
                                <polygon points="900,300 1200,400 1100,600" fill="#5b21b6" />
                                <polygon points="1200,400 1600,400 1400,550" fill="#7c3aed" />

                                <polygon points="0,600 400,400 200,800" fill="#6d28d9" />
                                <polygon points="400,400 700,550 600,800" fill="#4c1d95" />
                                <polygon points="700,550 1100,600 1000,800" fill="#5b21b6" />
                                <polygon points="1100,600 1400,550 1400,800" fill="#6d28d9" />
                                <polygon points="1400,550 1600,400 1600,800" fill="#4c1d95" />

                                <polygon points="200,800 600,800 400,650" fill="#5b21b6" />
                                <polygon points="600,800 1000,800 850,650" fill="#7c3aed" />
                                <polygon points="1000,800 1400,800 1300,700" fill="#5b21b6" />
                                <polygon points="0,600 0,800 200,800" fill="#4c1d95" />
                            </g>
                        </svg>

                        {/* Enhanced Premium Noise Texture */}
                        <div
                            className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E")`
                            }}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)] pointer-events-none" />
                    </div>

                    <div className="relative z-10 mx-auto px-6">
                        <div className="mx-auto mb-16 max-w-4xl text-center">
                            <TextClipPathReveal
                                text="Everything you need to manage expenses."
                                className="text-5xl font-black text-white lg:text-7xl tracking-[-0.05em] leading-[1.2] mb-4"
                                direction="bottom"
                                duration={1.2}
                            />
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="text-xl text-white/60 font-medium max-w-2xl mx-auto"
                            >
                                SplitWayy makes it easy to keep track of shared bills and IOUs with anyone, anywhere.
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 items-start max-w-6xl mx-auto pb-8">
                            <div className="flex flex-col items-center">
                                <CapsuleSlider items={leftItems} />
                            </div>
                            <div className="flex flex-col items-center">
                                <CapsuleSlider items={rightItems} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
