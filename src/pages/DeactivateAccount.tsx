import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { deactivateUser } from "@/services/userService";
import { Loader2, Check, X, AlertTriangle } from "lucide-react";

export function DeactivateAccount() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const navigate = useNavigate();

    const handleDeactivate = async () => {
        if (!password) {
            setMessage({ type: 'error', text: 'Please enter your password.' });
            return;
        }

        const user = auth.currentUser;
        if (!user || !user.email) return;

        setLoading(true);
        setMessage(null);

        try {
            // Re-authenticate user first (Sensitive operation)
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            // Mark in Firestore as deactivated
            await deactivateUser(user.uid);

            setMessage({ type: 'success', text: 'Account deactivated successfully. Logging out...' });

            // App.tsx listener will handle the logout, but let's be safe
            setTimeout(() => {
                auth.signOut();
                navigate('/');
            }, 3000);

        } catch (error: any) {
            console.error("Deactivation error:", error);
            let errorMsg = 'Failed to deactivate account.';
            if (error.code === 'auth/wrong-password') {
                errorMsg = 'Incorrect password. Please try again.';
            } else if (error.message) {
                errorMsg = error.message;
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-8 md:p-12 space-y-12 bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/50 rounded-[2.5rem] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8">

            {message && (
                <div className={`fixed top-24 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl border ${message.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-700 backdrop-blur-md' : 'bg-red-50/90 border-red-200 text-red-700 backdrop-blur-md'
                    } flex items-center gap-3 animate-in fade-in slide-in-from-right-4`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    <span className="font-bold text-sm tracking-tight">{message.text}</span>
                    <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70"><X className="w-3 h-3" /></button>
                </div>
            )}

            <section className="space-y-6 text-center">
                <div className="flex items-center justify-center gap-3 text-[#cc4b5b]">
                    <div className="p-3 bg-red-50 rounded-full">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Deactivate your account</h1>

                <div className="space-y-4 text-gray-600 font-medium leading-relaxed max-w-lg mx-auto">
                    <p>
                        If you deactivate your account, you will no longer be able to log in,
                        will appear as <span className="text-gray-900 font-black italic">"inactive"</span> on SplitWayy, and will not receive account notifications.
                    </p>
                    <p>
                        You may reactivate your account by promptly writing to us at <span className="text-[#008cc9] cursor-pointer hover:underline font-bold">support@splitwayy.com</span>.
                    </p>
                </div>
            </section>

            <div className="border-t border-gray-200/50 pt-8 space-y-6">
                <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">
                        Verify your identity to proceed
                    </Label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your current password"
                        disabled={loading}
                        className="h-12 border-white/50 bg-white/50 focus:bg-white focus:ring-0 focus:border-red-300 rounded-xl font-bold transition-all"
                    />
                </div>

                <Button
                    onClick={handleDeactivate}
                    disabled={loading}
                    className="w-full bg-[#cc4b5b] hover:bg-[#b0404e] text-white font-black py-6 px-8 rounded-xl shadow-lg shadow-red-200/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Deactivate Account
                </Button>
            </div>

            <div className="space-y-6 bg-white/40 p-8 rounded-2xl border border-white/50 shadow-inner">
                <p className="text-sm font-bold text-gray-600">
                    Or, deactivate your account by clicking on a link in your email:
                </p>
                <Button variant="outline" className="w-full bg-white/50 border-white hover:bg-white font-bold rounded-xl h-12">
                    Send email link
                </Button>
            </div>

            <section className="border-t border-gray-200/50 pt-10 space-y-6">
                <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase">Permanently delete your data</h2>

                <div className="space-y-4 text-gray-500 font-medium text-sm leading-relaxed">
                    <p>
                        Alternatively, you may close your account and permanently delete all
                        personal data by sending a request to <span className="text-[#008cc9] cursor-pointer hover:underline">support@splitwayy.com</span>.
                        We will use your email address or phone number to confirm that request came from you.
                    </p>
                </div>
            </section>

            <div className="pt-4 border-t border-gray-200/50 flex justify-center">
                <Link to="/account" className="text-[#008cc9] font-black uppercase tracking-widest text-xs hover:tracking-[0.2em] transition-all flex items-center gap-2 py-2">
                    <span>←</span> Back to settings
                </Link>
            </div>
        </div>
    );

}
