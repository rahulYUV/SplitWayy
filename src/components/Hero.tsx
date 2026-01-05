import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import homeImg from "@/assets/images/Home.png";
import flightImg from "@/assets/images/Flight.png";
import lvImg from "@/assets/images/lv.png";
import ridesImg from "@/assets/images/Flight.png";
import { Plane, Home, Heart, Asterisk, Apple, Smartphone, Car } from 'lucide-react';

const HERO_ITEMS = [
    {
        text: "with housemates.",
        buttonText: "rent",
        image: homeImg,
        color: "text-purple-500",
        activeColor: "text-purple-500",
        hoverColor: "hover:text-purple-400",
        bgColor: "bg-purple-600 hover:bg-purple-700 shadow-purple-500/25",
        Icon: Home
    },
    {
        text: "with your partner.",
        buttonText: "dinner bill",
        image: lvImg,
        color: "text-red-500",
        activeColor: "text-red-500",
        hoverColor: "hover:text-red-400",
        bgColor: "bg-red-600 hover:bg-red-700 shadow-red-500/25",
        Icon: Heart
    },
    {
        text: "for rides.",
        buttonText: "cab fare",
        image: ridesImg,
        color: "text-orange-500",
        activeColor: "text-orange-500",
        hoverColor: "hover:text-orange-400",
        bgColor: "bg-orange-600 hover:bg-orange-700 shadow-orange-500/25",
        Icon: Car
    },
    {
        text: "on trips.",
        buttonText: "travel expenses",
        image: flightImg,
        color: "text-teal-500",
        activeColor: "text-teal-500",
        hoverColor: "hover:text-teal-400",
        bgColor: "bg-teal-600 hover:bg-teal-700 shadow-teal-500/25",
        Icon: Plane
    },
    {
        text: "with anyone.",
        buttonText: "everything",
        image: homeImg,
        color: "text-blue-500",
        activeColor: "text-blue-500",
        hoverColor: "hover:text-blue-400",
        bgColor: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25",
        Icon: Asterisk
    }
];

export interface HeroProps {
    showPlatformIcons?: boolean;
}

export function Hero({ showPlatformIcons = true }: HeroProps) {
    const [index, setIndex] = useState(0);
    const [fadeIn, setFadeIn] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFadeIn(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % HERO_ITEMS.length);
                setFadeIn(true);
            }, 600);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const currentItem = HERO_ITEMS[index];

    return (
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-6 py-8 mt-16 w-full z-10 relative">
            <div className="flex-1 space-y-6 text-left max-w-xl">
                <h1 className="text-4xl md:text-5xl font-black text-black leading-tight tracking-tight">
                    Less stress when sharing expenses <br />
                    <span
                        className={cn(
                            "inline-block transition-all duration-700 font-black ease-in-out transform",
                            currentItem.color,
                            fadeIn ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                        )}
                    >
                        {currentItem.text}
                    </span>
                </h1>

                {/* Icons Row: Home -> Heart (LV) -> Car -> Plane (Flight) -> Asterisk (Star) */}
                <div className="flex gap-6 text-2xl text-gray-400 pt-2 items-center">
                    {HERO_ITEMS.map((item, i) => (
                        <item.Icon
                            key={i}
                            onClick={() => setIndex(i)}
                            className={cn(
                                "w-8 h-8 cursor-pointer transition-all duration-300",
                                index === i ? `${item.activeColor} scale-110` : item.hoverColor
                            )}
                        />
                    ))}
                </div>

                <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                    Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family.
                </p>

                <button className={cn(
                    "px-8 py-4 text-lg font-bold text-white rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95",
                    currentItem.bgColor
                )}>
                    Split the <span className="lowercase">{currentItem.buttonText}</span>
                </button>

                {showPlatformIcons && (
                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium pt-6">
                        <span>Free for</span>
                        <Apple className="w-5 h-5 text-gray-400" />
                        <span>iPhone,</span>
                        <Smartphone className="w-5 h-5 text-gray-400" />
                        <span>Android, and web.</span>
                    </div>
                )}
            </div>

            {/* Right Column: Dynamic Image */}
            <div className="flex-1 flex justify-center items-center mt-12 md:mt-0 relative">
                <div className="relative w-full max-w-lg h-[400px] flex items-center justify-center overflow-hidden">
                    {HERO_ITEMS.map((item, i) => (
                        <img
                            key={i}
                            src={item.image}
                            alt="Feature"
                            className={cn(
                                "absolute w-auto h-full max-h-full object-contain transition-all duration-[2500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] transform",
                                i === index
                                    ? "opacity-100 translate-x-0 scale-100"
                                    : "opacity-0 translate-x-24 scale-95"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
