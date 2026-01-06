import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Globe } from "lucide-react";
import LogoImg from "@/assets/images/LOGO.png";
import { auth, googleProvider } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile
} from "firebase/auth";
import { syncUserProfile } from "@/services/userService";

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'signup' | 'login';
    onSignUpSuccess?: () => void;
}

const CURRENCIES = [
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

export function SignUpModal({ isOpen, onClose, initialMode = 'signup', onSignUpSuccess }: SignUpModalProps) {
    const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [currency, setCurrency] = useState("INR");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Sync mode with initialMode prop when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setError("");
        }
    }, [isOpen, initialMode]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let user;
            if (mode === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, {
                    displayName: fullName
                });
                user = userCredential.user;
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                user = userCredential.user;
            }

            // Sync with Firestore in background
            syncUserProfile(user, { currency });

            if (mode === 'signup') {
                onSignUpSuccess?.();
            }
            onClose();
        } catch (err: any) {
            setError(err.message || `Failed to ${mode}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            syncUserProfile(result.user, { currency });
            onSignUpSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.message || "Google sign-in failed");
        } finally {
            setLoading(false);
        }
    };

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
                        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-auto md:min-h-[500px]"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-20"
                        >
                            <X className="w-6 h-6 text-gray-400" />
                        </button>

                        {/* Left Side: Logo/Branding */}
                        <div className="w-full md:w-2/5 md:h-auto h-20 bg-[#f8f9fa] flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="z-10"
                            >
                                <img src={LogoImg} alt="SplitWayy" className="w-24 md:w-48 h-auto object-contain" />
                            </motion.div>
                            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                                <div className="absolute -top-20 -left-20 w-80 h-80 bg-orange-500 rounded-full blur-[80px]" />
                                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-500 rounded-full blur-[80px]" />
                            </div>
                        </div>

                        {/* Right Side: Form */}
                        <form onSubmit={handleAuth} className="w-full md:w-3/5 p-5 md:p-16 flex flex-col justify-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 md:mb-4">
                                {mode === 'signup' ? "Introduce Yourself" : "Welcome Back"}
                            </span>

                            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4 md:mb-8 leading-tight">
                                {mode === 'signup' ? (
                                    <>Hi there! My name is
                                        <div className="mt-4">
                                            <input
                                                required
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full h-14 border border-gray-200 rounded-lg px-4 text-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white text-gray-900"
                                                placeholder="Full Name"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    "Log in to your account"
                                )}
                            </h2>

                            <div className="space-y-6">
                                {mode === 'signup' && (
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 block mb-2 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-blue-500" />
                                            Primary <span className="font-black">Currency:</span>
                                        </label>
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="w-full h-12 border border-gray-200 rounded-lg px-4 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white text-gray-900 font-bold"
                                        >
                                            {CURRENCIES.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.symbol} - {c.name} ({c.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-2">Here's my <span className="font-black">email address:</span></label>
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 border border-gray-200 rounded-lg px-4 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white text-gray-900"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-2">And here's my <span className="font-black">password:</span></label>
                                    <input
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 border border-gray-200 rounded-lg px-4 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white text-gray-900"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {error && <p className="text-red-500 text-xs font-bold uppercase tracking-tight line-clamp-2">{error}</p>}

                                <div className="pt-4 flex flex-col md:flex-row items-center gap-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto px-10 py-4 bg-[#ff6d2f] hover:bg-[#e85a20] text-white font-black text-lg rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'signup' ? "Sign me up!" : "Log me in!")}
                                    </button>

                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">or</span>

                                    <button
                                        type="button"
                                        onClick={handleGoogleSignUp}
                                        disabled={loading}
                                        className="flex items-center gap-3 px-6 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                                        <span className="text-sm font-bold text-gray-600">
                                            {mode === 'signup' ? "Sign up with Google" : "Login with Google"}
                                        </span>
                                    </button>
                                </div>

                                <div className="text-[12px] text-gray-400 font-medium pt-4 flex flex-col gap-2">
                                    <p>
                                        {mode === 'signup' ? "Already have an account?" : "New to SplitWayy?"}{" "}
                                        <button
                                            type="button"
                                            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                                            className="text-blue-500 font-bold hover:underline"
                                        >
                                            {mode === 'signup' ? "Log in here" : "Create an account"}
                                        </button>
                                    </p>
                                    <p>
                                        By continuing, you accept the <a href="#" className="underline text-blue-500 hover:text-blue-600 transition-colors">SplitWayy Terms of Service</a>.
                                    </p>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
