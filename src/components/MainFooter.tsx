"use client";

import { cn } from "@/lib/utils";
import FlightImg from "@/assets/images/Flight.png";

import LogoImg from "@/assets/images/LOGO.png";

const FOOTER_IMAGES = [
    { src: FlightImg, className: "hidden md:block -bottom-5 left-0 w-72" },
];

const FOOTER_COLUMNS = [
    {
        title: "SplitWayy",
        color: "text-[#32dd9e]",
        hoverColor: "hover:text-[#32dd9e]",
        borderColor: "border-gray-200",
        links: [
            { label: "About", href: "#" },
            { label: "Press", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Jobs", href: "#" },
            { label: "Calculators", href: "#" },
            { label: "API", href: "#" }
        ],
        hasBorder: true
    },
    {
        title: "Account",
        color: "text-[#ff6d2f]",
        hoverColor: "hover:text-[#ff6d2f]",
        borderColor: "border-gray-200",
        links: [
            { label: "Log in", href: "#" },
            { label: "Sign up", href: "#" },
            { label: "Reset password", href: "#" },
            { label: "Settings", href: "#" },
            { label: "SplitWayy Pro", href: "#" },
            { label: "SplitWayy Pay", href: "#" }
        ],
        hasBorder: true
    },
    {
        title: "More",
        color: "text-gray-900",
        hoverColor: "hover:text-gray-900",
        links: [
            { label: "Contact Us", href: "/contact" },
            { label: "FAQ", href: "#" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Refund Policy", href: "/refund-policy" },
            { label: "Shipping Policy", href: "/shipping-policy" }
        ],
        hasBorder: false
    }
];

export function MainFooter() {
    return (
        <footer className="relative w-full bg-white pb-10 md:pb-32 overflow-hidden border-t border-gray-100">
            {/* Stationary Background Images */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {FOOTER_IMAGES.map((img, i) => (
                    <img
                        key={i}
                        src={img.src}
                        alt=""
                        className={cn("absolute h-auto opacity-100", img.className)}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-3 md:grid-cols-12 gap-4 md:gap-10 pt-8 md:pt-0">
                    {FOOTER_COLUMNS.map((col, i) => (
                        <div key={i} className={cn(
                            "col-span-1 md:col-span-2",
                            col.hasBorder && "md:border-r md:pr-8 border-gray-200"
                        )}>
                            <h4 className={cn("font-bold text-xs md:text-lg mb-3 md:mb-6 uppercase tracking-wider", col.color)}>{col.title}</h4>
                            <ul className="space-y-1.5 md:space-y-3">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <a href={link.href} className={cn(
                                            "text-gray-500 text-[10px] md:text-[15px] transition-colors hover:font-medium",
                                            col.hoverColor
                                        )}>
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Column 4: Brand Text (Shifted slightly left) */}
                    <div className="col-span-3 md:col-span-6 flex flex-col items-center md:items-end justify-start pt-8 md:pt-2 md:pr-12 border-t md:border-t-0 border-gray-100 mt-4 md:mt-0">
                        <div className="text-right">
                            <p className="text-gray-500 text-sm font-medium italic">Made with :) in SplitWayy Labs</p>
                            <div className="flex items-center gap-4 justify-end mt-4">
                                <img src={LogoImg} alt="SplitWayy" className="w-6 h-6 grayscale opacity-30" />
                                <span className="text-gray-300 text-xs">|</span>
                                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-black">2026 SplitWayy Inc.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
