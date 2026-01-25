import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { User } from "firebase/auth";
import { WorkspaceHero } from "@/components/WorkspaceHero";
import { Navbar } from "@/components/Navbar";
import { MainFooter } from "@/components/MainFooter";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import landScapeBg from "@/assets/images/LandScape.jpg";

interface DashboardLayoutProps {
    user: User;
    profile?: any;
    showOnboarding?: boolean;
    onOnboardingComplete?: () => void;
    children?: React.ReactNode; // For standalone pages like AccountSettings
}

export function DashboardLayout({ user, profile, showOnboarding, onOnboardingComplete, children }: DashboardLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isProfilePage = location.pathname.includes('/account') || location.pathname.includes('/profile') || location.pathname.includes('/deactivate');



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
                <main
                    className={cn(
                        "flex-1 flex flex-col relative min-w-0 overflow-auto transition-all duration-500",
                        isProfilePage ? "bg-cover bg-center bg-fixed bg-no-repeat" : "bg-white"
                    )}
                    style={isProfilePage ? { backgroundImage: `url(${landScapeBg})` } : {}}
                >
                    {isProfilePage && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm pointer-events-none sticky-0" />
                    )}

                    <Navbar
                        user={user}
                        profile={profile}
                        variant="dashboard"
                        onMobileMenuClick={() => setMobileMenuOpen(true)}
                        className={isProfilePage ? "bg-white/40 border-white/40 shadow-lg backdrop-blur-xl" : ""}
                    />
                    <div className="flex-1 relative z-10">
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
                    <div className={cn(
                        "w-full relative z-30 border-t",
                        isProfilePage ? "bg-white/40 border-white/40 backdrop-blur-md" : "bg-white border-gray-100"
                    )}>
                        <MainFooter />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
