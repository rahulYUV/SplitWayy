import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextClipPathRevealProps {
    text: string;
    className?: string;
    direction?: "top" | "bottom" | "left" | "right";
    duration?: number;
    delay?: number;
}

export function TextClipPathReveal({
    text,
    className,
    direction = "bottom",
    duration = 0.8,
    delay = 0,
}: TextClipPathRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

    const variants = {
        hidden: {
            clipPath:
                direction === "bottom" ? "inset(100% 0% 0% 0%)" :
                    direction === "top" ? "inset(0% 0% 100% 0%)" :
                        direction === "left" ? "inset(0% 100% 0% 0%)" :
                            "inset(0% 0% 0% 100%)",
            y: direction === "bottom" ? 20 : direction === "top" ? -20 : 0,
            x: direction === "right" ? 20 : direction === "left" ? -20 : 0,
            opacity: 0,
        },
        visible: {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            x: 0,
            opacity: 1,
        },
    };

    return (
        <div ref={ref} className={cn("overflow-hidden py-2", className)}>
            <motion.div
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={variants}
                transition={{
                    duration: duration,
                    delay: delay,
                    ease: [0.33, 1, 0.68, 1], // Custom cubic-bezier for smooth reveal
                }}
            >
                {text}
            </motion.div>
        </div>
    );
}
