import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import FlightImg from "@/assets/images/Flight.png";
import LogoImg from "@/assets/images/LOGO.png";

interface FooterLink {
    label: string;
    href: string;
    onClick?: () => void;
    external?: boolean;
}

interface SocialLink {
    icon: React.ReactNode;
    href: string;
    label: string;
    color: string;
}

const FOOTER_IMAGES = [
    { src: FlightImg, className: "hidden lg:block -bottom-5 left-0 w-72 opacity-80" },
];

const MORE_LINKS: FooterLink[] = [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Shipping Policy", href: "/shipping-policy" }
];

const QUICK_LINKS: FooterLink[] = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/app" },
    { label: "Quick Split", href: "/quick-split" },
    { label: "About Us", href: "/about" },
];

export function MainFooter() {
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [subscribeLoading, setSubscribeLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setSubscribeLoading(true);
        // Simulate subscription
        setTimeout(() => {
            alert("Thanks for subscribing! 🎉");
            setEmail("");
            setSubscribeLoading(false);
        }, 1000);
    };

    const accountLinks: FooterLink[] = user ? [
        { label: "Account Settings", href: "/settings" },
        { label: "Dashboard", href: "/app" },
        { label: "Log out", href: "#", onClick: handleLogout },
    ] : [
        { label: "Log in", href: "/login" },
        { label: "Sign up", href: "/signup" },
        { label: "Reset password", href: "/reset-password" },
    ];

    const socialLinks: SocialLink[] = [
        {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>,
            href: "https://twitter.com/splitwayy",
            label: "Twitter",
            color: "hover:bg-blue-400 hover:text-white"
        },
        {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>,
            href: "https://linkedin.com/company/splitwayy",
            label: "LinkedIn",
            color: "hover:bg-blue-600 hover:text-white"
        },
        {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>,
            href: "https://instagram.com/splitwayy",
            label: "Instagram",
            color: "hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white"
        },
        {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>,
            href: "https://github.com/splitwayy",
            label: "GitHub",
            color: "hover:bg-gray-900 hover:text-white"
        },
    ];

    const contactInfo = [
        { icon: <Mail className="w-4 h-4" />, text: "support@splitwayy.com", href: "mailto:support@splitwayy.com" },
        { icon: <Phone className="w-4 h-4" />, text: "+91 98765 43210", href: "tel:+919876543210" },
        { icon: <MapPin className="w-4 h-4" />, text: "Pune, India", href: "#" },
    ];

    return (
        <footer className="relative w-full bg-gradient-to-b from-white to-gray-50 overflow-hidden border-t border-gray-200">
            {/* Decorative Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {FOOTER_IMAGES.map((img, i) => (
                    <img
                        key={i}
                        src={img.src}
                        alt=""
                        className={cn("absolute h-auto", img.className)}
                    />
                ))}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 relative z-10">
                {/* Mobile: Stacked Layout, Desktop: Grid */}
                <div className="space-y-8 lg:space-y-0">

                    {/* Brand Section - Always Full Width on Mobile */}
                    <div className="space-y-4 lg:hidden">
                        <div className="flex items-center gap-3">
                            <img src={LogoImg} alt="SplitWayy" className="w-8 h-8 sm:w-10 sm:h-10" />
                            <h3 className="text-xl sm:text-2xl font-black italic text-gray-900 tracking-tight">SplitWayy</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            The easiest way to split bills and manage shared expenses with friends, roommates, and groups.
                        </p>

                        {/* Newsletter - Mobile */}
                        <div className="pt-2">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Stay Updated</h4>
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#ff6d2f] focus:ring-2 focus:ring-[#ff6d2f]/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={subscribeLoading}
                                    className="px-6 py-2.5 bg-[#ff6d2f] hover:bg-[#ff8552] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {subscribeLoading ? "..." : "Subscribe"}
                                </button>
                            </form>
                        </div>

                        {/* Social Links - Mobile */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Follow Us</h4>
                            <div className="flex gap-2">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        className={cn(
                                            "w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 transition-all",
                                            social.color
                                        )}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Grid Layout */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-8 mb-8">
                        {/* Brand Section - Desktop */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <img src={LogoImg} alt="SplitWayy" className="w-10 h-10" />
                                <h3 className="text-2xl font-black italic text-gray-900 tracking-tight">SplitWayy</h3>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                The easiest way to split bills and manage shared expenses with friends, roommates, and groups.
                                Track, settle, and simplify your money matters.
                            </p>

                            {/* Newsletter - Desktop */}
                            <div className="pt-2">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Stay Updated</h4>
                                <form onSubmit={handleSubscribe} className="flex gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#ff6d2f] focus:ring-2 focus:ring-[#ff6d2f]/20 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={subscribeLoading}
                                        className="px-6 py-2 bg-[#ff6d2f] hover:bg-[#ff8552] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {subscribeLoading ? "..." : "Subscribe"}
                                    </button>
                                </form>
                            </div>

                            {/* Social Links - Desktop */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Follow Us</h4>
                                <div className="flex gap-2">
                                    {socialLinks.map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={social.label}
                                            className={cn(
                                                "w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 transition-all",
                                                social.color
                                            )}
                                        >
                                            {social.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Links - Desktop */}
                        <div className="lg:col-span-2">
                            <h4 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wider">Quick Links</h4>
                            <ul className="space-y-2.5">
                                {QUICK_LINKS.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-gray-600 text-sm transition-all hover:text-[#ff6d2f] hover:translate-x-1 inline-flex items-center gap-2 group"
                                        >
                                            <span className="w-0 group-hover:w-2 h-0.5 bg-[#ff6d2f] transition-all duration-300" />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Account - Desktop */}
                        <div className="lg:col-span-2">
                            <h4 className="font-bold text-sm text-[#ff6d2f] mb-4 uppercase tracking-wider">Account</h4>
                            <ul className="space-y-2.5">
                                {accountLinks.map((link) => (
                                    <li key={link.label}>
                                        {link.onClick ? (
                                            <button
                                                onClick={link.onClick}
                                                className="text-gray-600 text-sm transition-all hover:text-[#ff6d2f] hover:translate-x-1 inline-flex items-center gap-2 group"
                                            >
                                                <span className="w-0 group-hover:w-2 h-0.5 bg-[#ff6d2f] transition-all duration-300" />
                                                {link.label}
                                            </button>
                                        ) : (
                                            <Link
                                                to={link.href}
                                                className="text-gray-600 text-sm transition-all hover:text-[#ff6d2f] hover:translate-x-1 inline-flex items-center gap-2 group"
                                            >
                                                <span className="w-0 group-hover:w-2 h-0.5 bg-[#ff6d2f] transition-all duration-300" />
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal - Desktop */}
                        <div className="lg:col-span-2">
                            <h4 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wider">Legal</h4>
                            <ul className="space-y-2.5">
                                {MORE_LINKS.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-gray-600 text-sm transition-all hover:text-gray-900 hover:translate-x-1 inline-flex items-center gap-2 group"
                                        >
                                            <span className="w-0 group-hover:w-2 h-0.5 bg-gray-900 transition-all duration-300" />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact - Desktop */}
                        <div className="lg:col-span-2">
                            <h4 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wider">Contact</h4>
                            <ul className="space-y-3 mb-6">
                                {contactInfo.map((info, idx) => (
                                    <li key={idx}>
                                        <a
                                            href={info.href}
                                            className="text-gray-600 text-sm flex items-start gap-2 hover:text-[#ff6d2f] transition-colors group"
                                        >
                                            <span className="text-gray-400 group-hover:text-[#ff6d2f] mt-0.5">{info.icon}</span>
                                            <span className="text-xs leading-relaxed">{info.text}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Mobile: Columns in Accordion Style */}
                    <div className="grid grid-cols-2 gap-6 lg:hidden">
                        {/* Account - Mobile */}
                        <div>
                            <h4 className="font-bold text-xs text-[#ff6d2f] mb-3 uppercase tracking-wider">Account</h4>
                            <ul className="space-y-2">
                                {accountLinks.map((link) => (
                                    <li key={link.label}>
                                        {link.onClick ? (
                                            <button
                                                onClick={link.onClick}
                                                className="text-gray-600 text-sm hover:text-[#ff6d2f] transition-colors"
                                            >
                                                {link.label}
                                            </button>
                                        ) : (
                                            <Link
                                                to={link.href}
                                                className="text-gray-600 text-sm hover:text-[#ff6d2f] transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quick Links - Mobile */}
                        <div>
                            <h4 className="font-bold text-xs text-gray-900 mb-3 uppercase tracking-wider">Quick Links</h4>
                            <ul className="space-y-2">
                                {QUICK_LINKS.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-gray-600 text-sm hover:text-[#ff6d2f] transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Legal - Mobile (Full Width) */}
                    <div className="lg:hidden">
                        <h4 className="font-bold text-xs text-gray-900 mb-3 uppercase tracking-wider">Legal</h4>
                        <ul className="grid grid-cols-2 gap-2">
                            {MORE_LINKS.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-600 text-sm hover:text-gray-900 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact - Mobile */}
                    <div className="lg:hidden">
                        <h4 className="font-bold text-xs text-gray-900 mb-3 uppercase tracking-wider">Contact</h4>
                        <ul className="space-y-2.5">
                            {contactInfo.map((info, idx) => (
                                <li key={idx}>
                                    <a
                                        href={info.href}
                                        className="text-gray-600 text-sm flex items-center gap-2 hover:text-[#ff6d2f] transition-colors"
                                    >
                                        <span className="text-gray-400">{info.icon}</span>
                                        <span className="text-sm">{info.text}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-6 lg:pt-8 mt-6 lg:mt-8 border-t border-gray-200">
                    <div className="flex flex-col items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
                        <span>© 2026 SplitWayy Inc.</span>

                    </div>
                </div>
            </div>
        </footer>
    );
}
