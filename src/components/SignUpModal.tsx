import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Globe } from "lucide-react";
import LogoImg from "@/assets/images/Home.png";
import { toast } from "sonner";
import { auth, googleProvider } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification,
    getAdditionalUserInfo
} from "firebase/auth";
import { Link } from "react-router-dom";
import { syncUserProfile } from "@/services/userService";
import { sendWelcomeEmail } from "@/services/emailService";

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
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    // Sync mode with initialMode prop when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setError("");
            setIsForgotPassword(false);
            setResetSent(false);
            setLoading(false);
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

                // Send Welcome Email
                if (user.email) {
                    sendWelcomeEmail(user.email, fullName);
                }

                // Send Verification Email (Safe Mode)
                try {
                    console.log("Sending verification email to:", user.email);
                    await sendEmailVerification(user);
                    console.log("Verification email sent.");
                    toast.success("Account created! Verification link sent.");
                } catch (emailError: any) {
                    console.error("Failed to send verification email:", emailError);
                    toast.warning("Account created, but verification email failed: " + (emailError.message || "Unknown error"));
                }
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

            // Send Welcome Email if new user
            const additionalInfo = getAdditionalUserInfo(result);
            if (additionalInfo?.isNewUser && result.user.email) {
                sendWelcomeEmail(result.user.email, result.user.displayName || "Friend");
            }

            onSignUpSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.message || "Google sign-in failed");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address.");
            return;
        }
        setLoading(true);
        setError("");
        console.log("Starting password reset flow for:", email);

        console.log("Starting password reset flow for:", email);

        try {
            // We just try to send the email. 
            // If the user uses Google Sign-In, Firebase might not send a reset email 
            // or might send a "You assume to sign in with Google" email depending on settings.
            // We cannot reliably check methods due to security protections (always returns []).
            await sendPasswordResetEmail(auth, email);

            console.log("Password reset email sent successfully.");
            setResetSent(true);
        } catch (err: any) {
            console.error("Password reset error:", err);
            if (err.code === 'auth/user-not-found') {
                setError("No account found with this email.");
            } else {
                setError(err.message || "Failed to send reset email.");
            }
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
                        <div className="w-full md:w-3/5 p-6 md:px-10 md:py-8 flex flex-col justify-center">
                            {isForgotPassword ? (
                                <form onSubmit={handleForgotPassword} className="flex flex-col h-full justify-center">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                                        Account Recovery
                                    </span>
                                    <h2 className="text-2xl font-medium text-gray-900 mb-3 leading-tight">
                                        Forgot your password?
                                    </h2>
                                    <p className="text-gray-500 text-sm mb-6">
                                        No worries! Enter your email and we'll send you a reset link.
                                    </p>

                                    {resetSent ? (
                                        <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in duration-300">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <div>
                                                <h3 className="text-green-800 font-bold text-lg">Email Sent!</h3>
                                                <p className="text-green-600 text-sm mt-1">Check your inbox (and spam folder) for the reset link.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsForgotPassword(false);
                                                    setResetSent(false);
                                                    setMode('login');
                                                }}
                                                className="mt-2 text-green-700 font-bold text-sm hover:underline"
                                            >
                                                Back to Login
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 block mb-2">My registered <span className="font-black">email:</span></label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full h-11 border border-gray-200 rounded-lg px-4 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white text-gray-900"
                                                    placeholder="e.g. name@example.com"
                                                />
                                            </div>

                                            {error && <p className="text-red-500 text-xs font-bold uppercase tracking-tight">{error}</p>}

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full px-8 py-3 bg-[#ff6d2f] hover:bg-[#e85a20] text-white font-black text-base rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                                            </button>

                                            <div className="text-center px-4 bg-orange-50 rounded-lg py-2 border border-orange-100">
                                                <p className="text-xs text-orange-800 font-medium leading-tight">
                                                    👋 <strong>Google User?</strong> If you signed up with Google, you don't have a password! Click "Login with Google".
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setError("");
                                                    setIsForgotPassword(false);
                                                }}
                                                className="w-full text-center text-gray-400 font-bold hover:text-gray-600 text-sm"
                                            >
                                                Wait, I remembered it!
                                            </button>
                                        </div>
                                    )}
                                </form>
                            ) : (
                                <form onSubmit={handleAuth}>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                                        {mode === 'signup' ? "Introduce Yourself" : "Welcome Back"}
                                    </span>

                                    <h2 className="text-2xl font-medium text-gray-900 mb-4 leading-tight">
                                        {mode === 'signup' ? (
                                            <>Hi there! My name is
                                                <div className="mt-2">
                                                    <input
                                                        required
                                                        type="text"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        className="w-full h-12 border border-gray-200 rounded-lg px-4 text-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white text-gray-900"
                                                        placeholder="e.g. Rahul Kumar"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            "Log in to your account"
                                        )}
                                    </h2>

                                    <div className="space-y-4">
                                        {mode === 'signup' && (
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 block mb-1.5 flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-blue-500" />
                                                    Primary <span className="font-black">Currency:</span>
                                                </label>
                                                <select
                                                    value={currency}
                                                    onChange={(e) => setCurrency(e.target.value)}
                                                    className="w-full h-11 border border-gray-200 rounded-lg px-4 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white text-gray-900 font-bold"
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
                                            <label className="text-sm font-semibold text-gray-700 block mb-1.5 ml-1">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full h-11 border border-gray-200 rounded-xl px-4 focus:outline-none focus:border-[#ff6d2f] focus:ring-4 focus:ring-[#ff6d2f]/10 transition-all shadow-sm bg-gray-50/50 hover:bg-white text-gray-900 placeholder:text-gray-400"
                                                placeholder="name@example.com"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1.5 ml-1">
                                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                                {mode === 'login' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsForgotPassword(true)}
                                                        className="text-xs text-[#ff6d2f] font-semibold hover:text-[#e85a20] hover:underline transition-all"
                                                    >
                                                        Forgot Password?
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                required
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full h-11 border border-gray-200 rounded-xl px-4 focus:outline-none focus:border-[#ff6d2f] focus:ring-4 focus:ring-[#ff6d2f]/10 transition-all shadow-sm bg-gray-50/50 hover:bg-white text-gray-900 placeholder:text-gray-400"
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        {error && <p className="text-red-500 text-xs font-bold uppercase tracking-tight line-clamp-2">{error}</p>}

                                        <div className="pt-4 flex flex-col gap-3">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="relative group w-full px-8 py-3 bg-gradient-to-br from-[#ff6d2f] to-[#ff4d00] hover:from-[#ff8552] hover:to-[#ff6d2f] text-white font-black text-base rounded-2xl shadow-[0_8px_30px_rgb(255,109,47,0.3)] hover:shadow-[0_8px_30px_rgb(255,109,47,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'signup' ? "Create Account" : "Sign In")}
                                                    {!loading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
                                                </span>
                                            </button>

                                            <div className="relative flex items-center py-1">
                                                <div className="flex-grow border-t border-gray-100"></div>
                                                <span className="flex-shrink-0 mx-4 text-gray-300 text-[10px] font-bold uppercase tracking-widest">Or continue with</span>
                                                <div className="flex-grow border-t border-gray-100"></div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleGoogleSignUp}
                                                disabled={loading}
                                                className="group w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-100 hover:border-blue-100 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgb(59,130,246,0.1)] transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
                                            >
                                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" alt="Google" />
                                                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">
                                                    Google
                                                </span>
                                            </button>
                                        </div>

                                        <div className="text-[11px] text-gray-400 font-medium pt-2 flex flex-col gap-1.5">
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
                                                By continuing, you accept the <Link to="/terms" onClick={onClose} className="underline text-blue-500 hover:text-blue-600 transition-colors">SplitWayy Terms of Service</Link>.
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
