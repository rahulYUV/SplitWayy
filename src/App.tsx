import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { useState } from "react";
import { Features } from "@/components/Features";
import { FooterSection } from "@/components/FooterSection";
import { MainFooter } from "@/components/MainFooter";
import { SignUpModal } from "@/components/SignUpModal";
import { GridPattern } from "./components/ui/shadcn-io/grid-pattern";
import { cn } from "@/lib/utils";

function App() {
  const { scrollY } = useScroll();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  // Grid opacity starts at 0.18 for the Hero and fades to 0.08 on scroll
  const gridOpacity = useTransform(scrollY, [0, 600], [0.18, 0.08]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-background text-white selection:bg-purple-500/20">
      <Navbar onSignUpClick={() => setIsSignUpOpen(true)} />

      <SignUpModal isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />

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
        <div className="h-screen w-full flex items-center justify-center overflow-hidden">
          <Hero />
        </div>
        <FooterSection />
        <Features />
        <MainFooter />
      </main>
    </div>
  )
}

export default App
