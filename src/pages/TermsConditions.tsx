import { ArrowLeft, Shield, Scale, FileText, AlertCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import LogoImg from "@/assets/images/Home.png";
import { Button } from "@/components/ui/button";

export function TermsConditions() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#ff6d2f]/20 selection:text-[#ff6d2f]">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src={LogoImg} alt="SplitWayy Details" className="w-8 h-8 group-hover:scale-105 transition-transform" />
                        <span className="font-black text-xl tracking-tight text-gray-900">SplitWayy</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" className="rounded-full hover:bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest gap-2">
                                <ArrowLeft size={14} /> Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
                {/* Header */}
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[#ff6d2f] font-bold text-[10px] uppercase tracking-widest mb-6">
                        <Shield className="w-3 h-3" />
                        Legal Documentation
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6d2f] to-[#ff9f76]">Conditions</span>
                    </h1>
                    <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">
                        Please read these terms carefully before using our services. Last updated: January 07, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-12">
                    {/* Section 1 */}
                    <div className="group hover:bg-gray-50 p-8 rounded-3xl transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-gray-600 group-hover:bg-[#ff6d2f] group-hover:text-white transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and SplitWayy ("we," "us" or "our"), concerning your access to and use of the SplitWayy website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="group hover:bg-gray-50 p-8 rounded-3xl transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-gray-600 group-hover:bg-[#ff6d2f] group-hover:text-white transition-colors">
                                <Scale className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Intellectual Property Rights</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="group hover:bg-gray-50 p-8 rounded-3xl transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-gray-600 group-hover:bg-[#ff6d2f] group-hover:text-white transition-colors">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Representations</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Use; (4) you differ not a minor in the jurisdiction in which you reside.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="group hover:bg-gray-50 p-8 rounded-3xl transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-gray-600 group-hover:bg-[#ff6d2f] group-hover:text-white transition-colors">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment and Settlements</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    SplitWayy facilitates the recording and tracking of shared expenses. We integrate with third-party payment gateways (Razorpay) to allow users to settle debts. We do not store your credit card or sensitive payment instrument details. All transactions are processed through secure third-party providers. We are not responsible for any failed transactions or disputes arising from settlements made outside or inside the platform.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div className="bg-gray-900 text-white p-10 rounded-3xl mt-12 text-center">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
                        <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto">
                            If you have specific questions about these terms, our support team is here to help clarify them.
                        </p>
                        <a
                            href="mailto:support@splitwayy.com"
                            className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors"
                        >
                            support@splitwayy.com
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
