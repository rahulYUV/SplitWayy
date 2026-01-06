"use client";

import { cn } from "@/lib/utils";
import FlightImg from "@/assets/images/Flight.png";
import HomeImg from "@/assets/images/Home.png";
import LVImg from "@/assets/images/lv.png";
import LogoImg from "@/assets/images/LOGO.png";

const FOOTER_IMAGES = [
    { src: FlightImg, className: "hidden md:block -bottom-5 left-0 w-72" },
    { src: HomeImg, className: "hidden md:block bottom-2 right-0 w-[35rem]" },
    { src: LVImg, className: "hidden md:block bottom-6 left-1/2 -translate-x-1/2 w-56" },
];

const FOOTER_COLUMNS = [
    {
        title: "SplitWayy",
        color: "text-[#32dd9e]",
        hoverColor: "hover:text-[#32dd9e]",
        borderColor: "border-gray-200",
        links: ["About", "Press", "Blog", "Jobs", "Calculators", "API"],
        hasBorder: true
    },
    {
        title: "Account",
        color: "text-[#ff6d2f]",
        hoverColor: "hover:text-[#ff6d2f]",
        borderColor: "border-gray-200",
        links: ["Log in", "Sign up", "Reset password", "Settings", "SplitWayy Pro", "SplitWayy Pay"],
        hasBorder: true
    },
    {
        title: "More",
        color: "text-gray-900",
        hoverColor: "hover:text-gray-900",
        links: ["Contact us", "FAQ", "Terms of Service", "Privacy Policy"],
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
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    {FOOTER_COLUMNS.map((col, i) => (
                        <div key={i} className={cn(
                            "md:col-span-2",
                            col.hasBorder && `border-r ${col.borderColor} pr-8`
                        )}>
                            <h4 className={cn("font-bold text-lg mb-6", col.color)}>{col.title}</h4>
                            <ul className="space-y-3">
                                {col.links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className={cn(
                                            "text-gray-500 text-[15px] transition-colors",
                                            col.hoverColor
                                        )}>
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Column 4: Brand Text (Shifted slightly left) */}
                    <div className="md:col-span-6 flex flex-col items-end justify-start pt-2 md:pr-12">
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
