import { User } from "firebase/auth";
import { WorkspaceHero } from "@/components/WorkspaceHero";
import { MainFooter } from "@/components/MainFooter";

interface DashboardLayoutProps {
    user: User;
    showOnboarding?: boolean;
    onOnboardingComplete?: () => void;
}

export function DashboardLayout({ user, showOnboarding, onOnboardingComplete }: DashboardLayoutProps) {
    return (
        <div className="w-full min-h-screen flex flex-col bg-white">
            <main className="flex-1 w-full flex flex-col relative">
                {/* Hero section for members - Workspace Style */}
                <WorkspaceHero
                    user={user}
                    showOnboarding={showOnboarding}
                    onOnboardingComplete={onOnboardingComplete}
                />
            </main>

            {/* Minimal Footer for Dashboard */}
            <MainFooter />
        </div>
    );
}
