import img1 from "@/assets/images/1st.png";
import img2 from "@/assets/images/2nd.png";
import img3 from "@/assets/images/3rd.png";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HowItWorks() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -80 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 1.2,
                ease: "easeInOut" as const
            }
        }
    };

    return (
        <section className="w-full py-24 px-6 md:px-12 bg-gray-50/50 relative overflow-hidden">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex justify-center mb-16"
            >
                <span className="px-5 py-2 rounded-full border border-gray-200 text-xs font-bold uppercase tracking-widest bg-white shadow-sm text-gray-900">
                    How it works
                </span>
            </motion.div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto relative">

                {/* Visual Connection Line (Desktop) - Connecting the badges */}
                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                    className="hidden md:block absolute top-[62%] left-4 right-4 border-t-[3px] border-dashed border-gray-300 origin-left -z-10"
                />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-150px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {/* Step 1 */}
                    <motion.div variants={itemVariants} className="relative group h-full">
                        <div className="bg-white rounded-[2rem] border-2 border-black overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300">
                            {/* Image Section */}
                            <div className="h-[260px] w-full bg-gray-50/50 border-b-2 border-black flex items-center justify-center p-8 relative">
                                <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />
                                <img
                                    src={img1}
                                    alt="Create Group"
                                    className="w-full h-full object-contain relative z-10"
                                />
                            </div>
                            {/* Content Section */}
                            <div className="p-8 flex flex-col items-center text-center flex-1 bg-white">
                                <div className="inline-flex w-12 h-12 rounded-full border-2 border-black bg-white items-center justify-center text-sm font-bold text-gray-900 mb-6 shadow-sm z-10 relative">
                                    01
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-3">Create your group</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">
                                    Start by creating a group for a trip, housemates, or a night out.
                                    Invite friends and get everyone on the same page instantly.
                                </p>
                            </div>
                        </div>
                        {/* Box Connector Arrow (Desktop) */}
                        <div className="hidden md:flex absolute top-1/2 -right-6 z-20 w-10 h-10 bg-black rounded-full items-center justify-center text-white border-4 border-white transform -translate-y-1/2 shadow-sm">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div variants={itemVariants} className="relative group h-full">
                        <div className="bg-white rounded-[2rem] border-2 border-black overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300">
                            {/* Image Section */}
                            <div className="h-[260px] w-full bg-gray-50/50 border-b-2 border-black flex items-center justify-center p-8 relative">
                                <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />
                                <img
                                    src={img2}
                                    alt="Add Expenses"
                                    className="w-full h-full object-contain relative z-10"
                                />
                            </div>
                            {/* Content Section */}
                            <div className="p-8 flex flex-col items-center text-center flex-1 bg-white">
                                <div className="inline-flex w-12 h-12 rounded-full border-2 border-black bg-white items-center justify-center text-sm font-bold text-gray-900 mb-6 shadow-sm z-10 relative">
                                    02
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-3">Add your expenses</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">
                                    Paid for dinner? Uber ride? Just add the expense.
                                    We automatically calculate who owes what, splitting it fairly.
                                </p>
                            </div>
                        </div>
                        {/* Box Connector Arrow (Desktop) */}
                        <div className="hidden md:flex absolute top-1/2 -right-6 z-20 w-10 h-10 bg-black rounded-full items-center justify-center text-white border-4 border-white transform -translate-y-1/2 shadow-sm">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div variants={itemVariants} className="relative group h-full">
                        <div className="bg-white rounded-[2rem] border-2 border-black overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300">
                            {/* Image Section */}
                            <div className="h-[260px] w-full bg-gray-50/50 border-b-2 border-black flex items-center justify-center p-8 relative">
                                <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />
                                <img
                                    src={img3}
                                    alt="Settle Up"
                                    className="w-full h-full object-contain relative z-10"
                                />
                            </div>
                            {/* Content Section */}
                            <div className="p-8 flex flex-col items-center text-center flex-1 bg-white">
                                <div className="inline-flex w-12 h-12 rounded-full border-2 border-black bg-white items-center justify-center text-sm font-bold text-gray-900 mb-6 shadow-sm z-10 relative">
                                    03
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-3">Settle up simply</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">
                                    See your total balance at a glance. RECORD PAYMENT to settle debts
                                    and keep your friendships stress-free.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
