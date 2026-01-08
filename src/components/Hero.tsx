import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import homeImg from "@/assets/images/Home.png";
import flightImg from "@/assets/images/Flight.png";
import lvImg from "@/assets/images/lv.png";
import ridesImg from "@/assets/images/rides.png";
import { Plane, Home, Heart, Asterisk, Car } from 'lucide-react';
import { FastSplitLiquidButton } from "@/components/ui/GithubLiquidButton";

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

export function Hero() {
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
        <div className="flex flex-col-reverse md:flex-row items-center justify-between max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-16 sm:mt-20 md:mt-32 lg:mt-24 w-full z-10 relative gap-6 sm:gap-8 md:gap-12">

            {/* Left Column: Content (Shows second on mobile, first on desktop) */}
            <div className="flex-1 space-y-4 sm:space-y-6 text-center md:text-left max-w-xl w-full">
                {/* Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-black leading-tight tracking-tight">
                    Less stress when sharing expenses <br className="hidden sm:block" />
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

                {/* Icons Row */}
                <div className="flex gap-4 sm:gap-6 text-2xl text-gray-400 pt-2 items-center justify-center md:justify-start">
                    {HERO_ITEMS.map((item, i) => (
                        <item.Icon
                            key={i}
                            onClick={() => setIndex(i)}
                            className={cn(
                                "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 cursor-pointer transition-all duration-300",
                                index === i ? `${item.activeColor} scale-110` : item.hoverColor
                            )}
                        />
                    ))}
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed max-w-lg mx-auto md:mx-0">
                    Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 sm:gap-4 w-full">
                    <button className={cn(
                        "w-full sm:w-auto sm:flex-1 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-bold text-white rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95",
                        currentItem.bgColor
                    )}>
                        Split the <span className="lowercase">{currentItem.buttonText}</span>
                    </button>

                    <FastSplitLiquidButton className="h-[52px] sm:h-[60px] w-full sm:w-auto sm:flex-1 px-6 sm:px-8" />
                </div>
            </div>

            {/* Right Column: Dynamic Image (Shows first on mobile, second on desktop) */}
            <div className="flex-1 flex justify-center items-center relative w-full max-w-sm sm:max-w-md md:max-w-lg">
                <div className="relative w-full h-[240px] sm:h-[320px] md:h-[380px] lg:h-[450px] flex items-center justify-center overflow-hidden">
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
