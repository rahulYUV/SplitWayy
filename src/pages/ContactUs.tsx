import { ArrowLeft, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import LogoImg from "@/assets/images/LOGO.png";
import { Button } from "@/components/ui/button";

export function ContactUs() {
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
                    <span className="text-[#32dd9e] font-black uppercase tracking-[0.2em] text-xs mb-4 block">Get in Touch</span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Contact Us</h1>
                    <p className="text-white/60 text-lg">We are here to help you with any questions or issues.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                        <Mail className="w-10 h-10 text-[#32dd9e] mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Email Support</h3>
                        <p className="text-white/60 mb-6">For general queries, support, or partnership opportunities.</p>
                        <a href="mailto:support@splitwayy.com" className="text-[#32dd9e] font-bold text-lg hover:underline">support@splitwayy.com</a>
                    </div>

                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                        <MapPin className="w-10 h-10 text-[#32dd9e] mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Registered Office</h3>
                        <p className="text-white/60 mb-6">Visit our main office headquarters.</p>
                        <address className="not-italic text-white/80 leading-relaxed">
                            SplitWayy Inc.<br />
                            Sector 62, Noida<br />
                            Uttar Pradesh, India - 201309
                        </address>
                    </div>
                </div>
            </main>
        </div>
    );
}
