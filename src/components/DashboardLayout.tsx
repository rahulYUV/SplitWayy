import { User } from "firebase/auth";
import { Hero } from "@/components/Hero";
import { MainFooter } from "@/components/MainFooter";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
    user: User;
}

export function DashboardLayout({ user }: DashboardLayoutProps) {
    return (
        <div className="w-full min-h-screen flex flex-col bg-white">
            <main className="flex-1 w-full flex flex-col items-center relative">
                {/* Hero section for members - simplified/personalized */}
                <div className="h-[80vh] w-full flex items-center justify-center overflow-hidden">
                    <Hero showPlatformIcons={false} />
                </div>

                {/* Dashboard content placeholder */}
                {/* Dashboard content placeholder removed for now */}
                <div className="w-full max-w-6xl px-6 py-12 relative z-20">
                    {/* Content will be added here in Phase 3 */}
                </div>

                {/* Spacer to give content room above footer */}
                <div className="h-24" />
            </main>

            {/* Minimal Footer for Dashboard */}
            <MainFooter />
        </div>
    );
}
