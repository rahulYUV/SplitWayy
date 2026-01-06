import { forwardRef, useImperativeHandle, useRef } from "react";
import { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { motion, useAnimate } from "framer-motion";

const CurrencyRupeeIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
    (
        { size = 24, color = "currentColor", strokeWidth = 2, className = "" },
        ref,
    ) => {
        const [scope, animate] = useAnimate();
        const isAnimating = useRef(false);

        const runSequence = async () => {
            if (!isAnimating.current) return;

            // Reset
            await animate(
                ".rupee-main, .rupee-line",
                { pathLength: 0, opacity: 0 },
                { duration: 0 }
            );

            // Draw line
            await animate(
                ".rupee-line",
                { pathLength: 1, opacity: 1 },
                { duration: 0.2, ease: "easeOut" }
            );

            // Draw main body
            await animate(
                ".rupee-main",
                { pathLength: 1, opacity: 1 },
                { duration: 0.3, ease: "easeOut" }
            );

            // Subtle scale pop
            await animate(
                ".rupee-symbol",
                { scale: [1, 1.1, 1] },
                { duration: 0.3 }
            );

            // Loop if still animating
            if (isAnimating.current) {
                setTimeout(runSequence, 200);
            }
        };

        const start = () => {
            if (isAnimating.current) return;
            isAnimating.current = true;
            runSequence();
        };

        const stop = () => {
            isAnimating.current = false;
            animate(
                ".rupee-main, .rupee-line",
                { pathLength: 1, opacity: 1 },
                { duration: 0.2 }
            );
            animate(".rupee-symbol", { scale: 1 }, { duration: 0.2 });
        };

        useImperativeHandle(ref, () => ({
            startAnimation: start,
            stopAnimation: stop,
        }));

        return (
            <motion.svg
                ref={scope}
                onMouseEnter={start}
                onMouseLeave={stop}
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`inline-block ${className}`}
                style={{ overflow: 'visible' }}
            >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <motion.g
                    className="rupee-symbol"
                    style={{ transformOrigin: "50% 50%" }}
                >
                    <motion.path
                        className="rupee-main"
                        d="M18 5h-11h3a4 4 0 0 1 0 8h-3l6 6"
                        pathLength={1}
                    />
                    <motion.path className="rupee-line" d="M7 9l11 0" pathLength={1} />
                </motion.g>
            </motion.svg>
        );
    },
);

CurrencyRupeeIcon.displayName = "CurrencyRupeeIcon";
export default CurrencyRupeeIcon;
