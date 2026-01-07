import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import LogoImg from "@/assets/images/LOGO.png";
import { Button } from "@/components/ui/button";

export function TermsConditions() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#ff6d2f] selection:text-white">
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
                    <span className="text-[#ff6d2f] font-black uppercase tracking-[0.2em] text-xs mb-4 block">Legal Documentation</span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Terms & Conditions</h1>
                    <p className="text-white/60 text-lg">Last updated: January 07, 2026</p>
                </div>

                <div className="space-y-12 text-white/80 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
                        <p>These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and SplitWayy ("we," "us" or "our"), concerning your access to and use of the SplitWayy website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Intellectual Property Rights</h2>
                        <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. User Representations</h2>
                        <p>By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Use; (4) you differ not a minor in the jurisdiction in which you reside.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Payment and Settlements</h2>
                        <p>SplitWayy facilitates the recording and tracking of shared expenses. We integrate with third-party payment gateways (Razorpay) to allow users to settle debts. We do not store your credit card or sensitive payment instrument details. All transactions are processed through secure third-party providers. We are not responsible for any failed transactions or disputes arising from settlements made outside or inside the platform.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
                        <p>In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <a href="mailto:support@splitwayy.com" className="text-[#ff6d2f] hover:underline">support@splitwayy.com</a></p>
                    </section>
                </div>
            </main>
        </div>
    );
}
