import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { User } from "firebase/auth";
import { WorkspaceHero } from "@/components/WorkspaceHero";
import { Navbar } from "@/components/Navbar";
import { MainFooter } from "@/components/MainFooter";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";

interface DashboardLayoutProps {
    user: User;
    profile?: any;
    showOnboarding?: boolean;
    onOnboardingComplete?: () => void;
    children?: React.ReactNode; // For standalone pages like AccountSettings
}

export function DashboardLayout({ user, profile, showOnboarding, onOnboardingComplete, children }: DashboardLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="w-full min-h-screen flex bg-white font-sans">
                {/* Mobile Sidebar (Sheet) */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetContent side="left" className="p-0 border-r border-gray-100 w-[280px]">
                        <AppSidebar forceExpanded={true} />
                    </SheetContent>
                </Sheet>

                {/* Sticky Sidebar Container (Desktop Only) */}
                <div className="sticky top-0 h-screen hidden lg:block z-20">
                    <AppSidebar user={user} />
                </div>

                {/* Main Content Area - Scrollable */}
                <main className="flex-1 flex flex-col relative bg-white min-w-0 overflow-auto">
                    <Navbar
                        user={user}
                        profile={profile}
                        variant="dashboard"
                        onMobileMenuClick={() => setMobileMenuOpen(true)}
                    />
                    <div className="flex-1">
                        {/* If children provided (Settings, etc.), render them directly. 
                            Otherwise, wrap with WorkspaceHero for Mat-based pages. */}
                        {children ? (
                            <div className="p-4 md:p-8">
                                {children}
                            </div>
                        ) : (
                            <WorkspaceHero
                                user={user}
                                showOnboarding={showOnboarding}
                                onOnboardingComplete={onOnboardingComplete}
                            />
                        )}
                    </div>

                    {/* Footer */}
                    <div className="w-full relative z-30 bg-white border-t border-gray-100">
                        <MainFooter />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
