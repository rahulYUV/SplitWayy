import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import LogoImg from "@/assets/images/LOGO.png";
import { Button } from "@/components/ui/button";

export function PrivacyPolicy() {
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
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Privacy Policy</h1>
                    <p className="text-white/60 text-lg">Last updated: January 07, 2026</p>
                </div>

                <div className="space-y-12 text-white/80 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                        <p>Welcome to SplitWayy. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                            <li><strong className="text-white">Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong className="text-white">Contact Data:</strong> includes email address.</li>
                            <li><strong className="text-white">Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
                            <li><strong className="text-white">Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Data</h2>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
                            <li>To register you as a new customer.</li>
                            <li>To process and deliver your order including: Manage payments, fees and charges.</li>
                            <li>To manage our relationship with you.</li>
                            <li>To improve our website, products/services, marketing or customer relationships.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
                        <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:support@splitwayy.com" className="text-[#32dd9e] hover:underline">support@splitwayy.com</a></p>
                    </section>
                </div>
            </main>
        </div>
    );
}
