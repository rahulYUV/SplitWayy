import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import homeImg from "@/assets/images/Home.png";
import flightImg from "@/assets/images/Flight.png";
import lvImg from "@/assets/images/lv.png";
import ridesImg from "@/assets/images/rides.png";
import currencyImg from "@/assets/images/currency.png";
import { Plane, Home, Heart, Asterisk, Car } from 'lucide-react';

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
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-6 py-8 mt-32 md:mt-24 w-full z-10 relative">
            <div className="flex-1 space-y-6 text-left max-w-xl">
                <h1 className="text-3xl md:text-5xl font-black text-black leading-tight tracking-tight">
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
                                "w-6 h-6 md:w-8 md:h-8 cursor-pointer transition-all duration-300",
                                index === i ? `${item.activeColor} scale-110` : item.hoverColor
                            )}
                        />
                    ))}
                </div>

                <p className="text-base md:text-lg text-gray-400 leading-relaxed max-w-lg">
                    Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family.
                </p>

                <button className={cn(
                    "px-8 py-4 text-base md:text-lg font-bold text-white rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95",
                    currentItem.bgColor
                )}>
                    Split the <span className="lowercase">{currentItem.buttonText}</span>
                </button>

                <div className="flex items-center gap-6 mt-32 transition-opacity duration-500">
                    {[homeImg, flightImg, ridesImg, lvImg, currencyImg].map((img, i) => (
                        <motion.img
                            key={i}
                            src={img}
                            alt="icon"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.7, 1, 0.7],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.4, // Staggered delay for "one by one" effect
                                ease: "easeInOut"
                            }}
                            className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-sm"
                        />
                    ))}
                </div>


            </div>

            {/* Right Column: Dynamic Image */}
            <div className="flex-1 flex justify-center items-center mt-12 md:mt-0 relative">
                <div className="relative w-full max-w-lg h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
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
