import { motion } from "framer-motion";
import { DottedMultiLineChart, RoundedPieChart, SettlementDetails, ClippedAreaChart } from "./ExpenseCharts";
import { TextClipPathReveal } from "./ui/TextClipPathReveal";

export function FooterSection() {
    return (
        <section className="relative w-full py-8 sm:py-12 overflow-hidden bg-background">
            <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
                <div className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[3.5rem] bg-[#0d9488] shadow-[0_20px_60px_-15px_rgba(13,148,136,0.3)] sm:shadow-[0_40px_100px_-30px_rgba(13,148,136,0.3)]">
                    {/* Geometric Teal Background Pattern */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#064e3b] via-[#0d9488] to-[#2dd4bf] opacity-90" />
                        <svg
                            className="absolute inset-x-0 top-0 w-full h-full opacity-[0.5] mix-blend-overlay"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1600 800"
                            preserveAspectRatio="none"
                        >
                            <g>
                                {/* Teal Mesh Polygons */}
                                <polygon points="0,0 400,0 200,150" fill="#0d9488" />
                                <polygon points="400,0 800,0 600,200" fill="#065f46" />
                                <polygon points="800,0 1200,0 1000,100" fill="#2dd4bf" />
                                <polygon points="1200,0 1600,0 1400,250" fill="#0d9488" />

                                <polygon points="0,0 200,150 0,300" fill="#065f46" />
                                <polygon points="200,150 600,200 400,400" fill="#064e3b" />
                                <polygon points="600,200 1000,100 900,300" fill="#0d9488" />
                                <polygon points="1000,100 1400,250 1200,400" fill="#065f46" />
                                <polygon points="1400,250 1600,0 1600,400" fill="#064e3b" />

                                <polygon points="0,300 400,400 0,600" fill="#5b21b6" />
                                <polygon points="400,400 900,300 700,550" fill="#065f46" />
                                <polygon points="900,300 1200,400 1100,600" fill="#064e3b" />
                                <polygon points="1200,400 1600,400 1400,550" fill="#0d9488" />

                                <polygon points="0,600 400,400 200,800" fill="#065f46" />
                                <polygon points="400,400 700,550 600,800" fill="#022c22" />
                                <polygon points="700,550 1100,600 1000,800" fill="#064e3b" />
                                <polygon points="1100,600 1400,550 1400,800" fill="#065f46" />
                                <polygon points="1400,550 1600,400 1600,800" fill="#022c22" />

                                <polygon points="200,800 600,800 400,650" fill="#064e3b" />
                                <polygon points="600,800 1000,800 850,650" fill="#0d9488" />
                                <polygon points="1000,800 1400,800 1300,700" fill="#064e3b" />
                                <polygon points="0,600 0,800 200,800" fill="#022c22" />
                            </g>
                        </svg>

                        {/* Premium Noise Overlay */}
                        <div
                            className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E")`
                            }}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />
                    </div>

                    <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
                        {/* Title Section */}
                        <div className="text-center mb-8 sm:mb-12 md:mb-16">
                            <TextClipPathReveal
                                text="Your financial world, visualized."
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-[-0.05em] leading-[1.2] mb-3 sm:mb-4 px-2"
                                direction="bottom"
                                duration={1.2}
                            />
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="text-sm sm:text-base md:text-lg lg:text-xl text-white/60 font-medium max-w-2xl mx-auto px-4"
                            >
                                Get clear insights into who paid for what and how your balances are trending over time.
                            </motion.p>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
                            {/* Full Width Area Chart with History */}
                            <motion.div
                                className="lg:col-span-2"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                viewport={{ once: true }}
                            >
                                <ClippedAreaChart />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                                viewport={{ once: true }}
                            >
                                <DottedMultiLineChart />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                viewport={{ once: true }}
                            >
                                <RoundedPieChart />
                            </motion.div>

                            <motion.div
                                className="hidden md:block lg:col-span-2"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                                viewport={{ once: true }}
                            >
                                <SettlementDetails />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
