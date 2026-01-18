import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import LogoImg from "@/assets/images/Home.png";
import { Button } from "@/components/ui/button";

export function ShippingPolicy() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#32dd9e] selection:text-black">
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
                    <span className="text-[#32dd9e] font-black uppercase tracking-[0.2em] text-xs mb-4 block">Legal Documentation</span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Shipping & Delivery Policy</h1>
                    <p className="text-white/60 text-lg">Last updated: January 07, 2026</p>
                </div>

                <div className="space-y-12 text-white/80 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Digital Services</h2>
                        <p>SplitWayy operates as a Software as a Service (SaaS) platform providing digital expense tracking tools. We generally <strong>do not sell physical products</strong> that require shipping or delivery.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Immediate Access</h2>
                        <p>Upon creating an account or subscribing to any premium features (if available), access to our services is immediate. No physical delivery is involved.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Contact Us</h2>
                        <p>If you have any questions about this policy, please contact us at: <a href="mailto:support@splitwayy.com" className="text-[#32dd9e] hover:underline">support@splitwayy.com</a></p>
                    </section>
                </div>
            </main>
        </div>
    );
}
