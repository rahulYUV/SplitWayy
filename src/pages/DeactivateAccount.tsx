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
        <div className="w-full max-w-2xl mx-auto px-6 py-20 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {message && (
                <div className={`fixed top-24 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                    } flex items-center gap-3 animate-in fade-in slide-in-from-right-4`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    <span className="font-bold text-sm tracking-tight">{message.text}</span>
                    <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70"><X className="w-3 h-3" /></button>
                </div>
            )}

            <section className="space-y-6">
                <div className="flex items-center gap-3 text-[#cc4b5b]">
                    <AlertTriangle className="w-8 h-8" />
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">Deactivate your account</h1>
                </div>

                <div className="space-y-4 text-gray-600 font-medium leading-relaxed">
                    <p>
                        If you deactivate your account, you will no longer be able to log in,
                        will appear as <span className="text-gray-900 font-black italic">"inactive"</span> on SplitWayy, and will not receive account notifications.
                    </p>
                    <p>
                        You may reactivate your account by promptly writing to us at <span className="text-[#008cc9] cursor-pointer hover:underline font-bold">support@splitwayy.com</span>.
                    </p>
                </div>
            </section>

            <div className="border-t border-gray-100 pt-8 space-y-6">
                <div className="space-y-4">
                    <Label className="text-sm font-black uppercase tracking-widest text-gray-500">
                        Verify your identity to proceed:
                    </Label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your current password"
                        disabled={loading}
                        className="max-w-md h-12 border-gray-200 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] rounded-xl font-bold"
                    />
                </div>

                <Button
                    onClick={handleDeactivate}
                    disabled={loading}
                    className="bg-[#cc4b5b] hover:bg-[#b0404e] text-white font-black py-6 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 uppercase tracking-tighter text-sm"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Deactivate your account
                </Button>
            </div>

            <div className="space-y-6 bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <p className="text-sm font-bold text-gray-600">
                    Or, deactivate your account by clicking on a link in your email:
                </p>
                <Button variant="outline" className="border-gray-300 font-bold hover:bg-white rounded-xl px-8 h-12">
                    Send email
                </Button>
            </div>

            <section className="border-t border-gray-100 pt-10 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic">Permanently delete your data</h2>

                <div className="space-y-4 text-gray-500 font-medium text-sm leading-relaxed">
                    <p>
                        Alternatively, you may close your account and permanently delete all
                        personal data by sending a request to <span className="text-[#008cc9] cursor-pointer hover:underline">support@splitwayy.com</span>.
                        We will use your email address or phone number to confirm that request came from you.
                    </p>
                    <p>
                        Once data is deleted, it will not be retrievable. For more information on deletion, please see our <span className="text-[#008cc9] cursor-pointer hover:underline">Privacy Policy</span>.
                    </p>
                </div>
            </section>

            <div className="pt-8 border-t border-gray-100">
                <Link to="/account" className="text-[#008cc9] font-black uppercase tracking-widest text-xs hover:tracking-[0.1em] transition-all">
                    ← Back to account settings
                </Link>
            </div>
        </div>
    );
}
