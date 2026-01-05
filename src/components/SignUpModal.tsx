"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import LogoImg from "@/assets/images/LOGO.png";

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-20"
                        >
                            <X className="w-6 h-6 text-gray-400" />
                        </button>

                        {/* Left Side: Logo/Branding */}
                        <div className="w-full md:w-2/5 bg-[#f8f9fa] flex items-center justify-center p-12 relative overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="z-10"
                            >
                                <img src={LogoImg} alt="SplitWayy" className="w-48 h-auto object-contain" />
                            </motion.div>
                            {/* Decorative background shapes similar to the screenshot's logo style */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                                <div className="absolute -top-20 -left-20 w-80 h-80 bg-orange-500 rounded-full blur-[80px]" />
                                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-500 rounded-full blur-[80px]" />
                            </div>
                        </div>

                        {/* Right Side: Form */}
                        <div className="w-full md:w-3/5 p-12 md:p-16 flex flex-col justify-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Introduce Yourself</span>

                            <h2 className="text-3xl font-medium text-gray-900 mb-8">
                                Hi there! My name is
                                <div className="mt-4">
                                    <input
                                        type="text"
                                        className="w-full h-14 border border-gray-200 rounded-lg px-4 text-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-2">Here's my <span className="font-black">email address:</span></label>
                                    <input
                                        type="email"
                                        className="w-full h-12 border border-gray-200 rounded-lg px-4 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-2">And here's my <span className="font-black">password:</span></label>
                                    <input
                                        type="password"
                                        className="w-full h-12 border border-gray-200 rounded-lg px-4 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                                    />
                                </div>

                                <div className="pt-4 flex flex-col md:flex-row items-center gap-6">
                                    <button className="w-full md:w-auto px-10 py-4 bg-[#ff6d2f] hover:bg-[#e85a20] text-white font-black text-lg rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                                        Sign me up!
                                    </button>

                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">or</span>

                                    <button
                                        onClick={() => window.location.href = "https://accounts.google.com"} // Placeholder redirect
                                        className="flex items-center gap-3 px-6 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                                    >
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                                        <span className="text-sm font-bold text-gray-600">Sign up with Google</span>
                                    </button>
                                </div>

                                <p className="text-[12px] text-gray-400 font-medium pt-4">
                                    By signing up, you accept the <a href="#" className="underline text-blue-500 hover:text-blue-600">SplitWayy Terms of Service</a>.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
