import { motion, useScroll, useTransform } from "framer-motion";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { FooterSection } from "@/components/FooterSection";
import { MainFooter } from "@/components/MainFooter";
import { GridPattern } from "@/components/ui/shadcn-io/grid-pattern";
import { cn } from "@/lib/utils";

export function LandingPage() {
    const { scrollY } = useScroll();

    // Grid opacity starts at 0.18 for the Hero and fades to 0.08 on scroll
    const gridOpacity = useTransform(scrollY, [0, 600], [0.18, 0.08]);

    return (
        <>
            <motion.div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{ opacity: gridOpacity }}
            >
                <GridPattern
                    width={50}
                    height={50}
                    x={-1}
                    y={-1}
                    strokeDasharray={"4 2"}
                    className={cn(
                        "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
                        "stroke-black"
                    )}
                />
            </motion.div>

            <main className="w-full flex flex-col items-center relative z-10">
                {/* Full-screen wrapper to maintain original Hero centering */}
                <div className="min-h-screen w-full flex items-center justify-center">
                    <Hero />
                </div>
                <FooterSection />
                <Features />
                <MainFooter />
            </main>
        </>
    );
}
