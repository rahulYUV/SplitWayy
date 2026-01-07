import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import LogoImg from "@/assets/images/LOGO.png";
import { Button } from "@/components/ui/button";

export function RefundPolicy() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#eab308] selection:text-black">
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src={LogoImg} alt="SplitWayy Details" className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <span className="font-black text-xl tracking-tight">SplitWayy</span>
                    </Link>
                    <Link to="/">
                        <Button variant="outline" className="rounded-full border-white/20 hover:bg-white/10 hover:text-white text-xs font-bold uppercase tracking-widest gap-2">
                            <ArrowLeft size={14} /> Back to Home
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
                <div className="mb-12">
                    <span className="text-[#eab308] font-black uppercase tracking-[0.2em] text-xs mb-4 block">Legal Documentation</span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Refund & Cancellation Policy</h1>
                    <p className="text-white/60 text-lg">Last updated: January 07, 2026</p>
                </div>

                <div className="space-y-12 text-white/80 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. General Policy</h2>
                        <p>SplitWayy is a platform for expense tracking and settlement between individuals. As such, SplitWayy itself generally does not sell goods or services directly to consumers that are refundable, other than potential premium subscription features.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Peer-to-Peer Settlements</h2>
                        <p>Transactions made between users (e.g., settling a debt with a friend) are direct peer-to-peer transfers processed via third-party gateways (UPI, Razorpay). SplitWayy does not hold funds and cannot issue refunds for these personal transactions. If you sent money to the wrong person or an incorrect amount, you must contact the recipient directly or your bank to resolve the issue.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Subscription Refunds</h2>
                        <p>If you have purchased a premium subscription to SplitWayy (if applicable):</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                            <li>You may cancel your subscription at any time.</li>
                            <li>Refunds for subscription fees are generally not provided for partial billing periods, unless required by local law.</li>
                            <li>If you believe you were charged in error, please contact support within 7 days of the charge.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Cancellations</h2>
                        <p>You may delete your SplitWayy account at any time via the user settings page. Upon deletion, your data will be removed from our active systems in accordance with our Privacy Policy.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
                        <p>For any refund-related queries, please contact us at: <a href="mailto:support@splitwayy.com" className="text-[#eab308] hover:underline">support@splitwayy.com</a></p>
                    </section>
                </div>
            </main>
        </div>
    );
}
