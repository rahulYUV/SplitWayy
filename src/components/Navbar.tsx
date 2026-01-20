import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import logo from "../assets/images/Home.png";
import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { GithubLiquidButton, LoginLiquidButton } from "@/components/ui/GithubLiquidButton";


interface NavbarProps {
    className?: string;
    onSignUpClick?: () => void;
    onLoginClick?: () => void;
    user?: User | null;
    profile?: any;
    variant?: 'landing' | 'dashboard';
    onMobileMenuClick?: () => void;
}

export function Navbar({ className, onSignUpClick, onLoginClick, user, profile, variant = 'landing', onMobileMenuClick }: NavbarProps) {
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const isDashboard = variant === 'dashboard';

    const [firestorePhotoURL, setFirestorePhotoURL] = useState<string | null>(null);

    useEffect(() => {
        if (user?.uid) {
            import("@/services/userService").then(({ getUserProfile }) => {
                getUserProfile(user.uid).then(profile => {
                    if (profile?.photoURL) {
                        setFirestorePhotoURL(profile.photoURL)
                    }
                })
            })
        }
    }, [user?.uid]);

    return (
        <div className={cn(
            "z-50 flex justify-center w-full transition-all duration-300",
            isDashboard ? "relative pt-6 pb-2" : "fixed top-6 left-0 right-0"
        )}>
            <nav
                className={cn(
                    "flex justify-between items-center px-4 md:px-8 py-3 transition-all duration-300",
                    isDashboard ? "w-[calc(100%-3rem)] mx-6 rounded-[2rem]" : "w-[95%] md:w-[80%] rounded-full",
                    "bg-white/70 backdrop-blur-xl border border-gray-200 shadow-xl",
                    className
                )}
            >
                <div className="flex items-center gap-4">
                    {isDashboard && (
                        <button
                            onClick={onMobileMenuClick}
                            className="lg:hidden flex hover:bg-gray-100 rounded-lg p-2 transition-colors"
                        >
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>
                    )}
                    {isDashboard && (
                        <SidebarTrigger className="hidden lg:flex" />
                    )}
                    <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-2 md:gap-3">
                        <img src={logo} alt="SplitWayy Logo" className="h-7 md:h-10 w-auto cursor-pointer" />
                        <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight hidden sm:block">SplitWayy</span>
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    <GithubLiquidButton className="hidden sm:flex" />

                    {user ? (
                        <div className="flex items-center gap-6">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 pl-1 pr-3 py-1 bg-[#32dd9e] hover:bg-[#2bc58d] rounded-full transition-all shadow-lg hover:shadow-[#32dd9e]/20 hover:scale-105 active:scale-95 group outline-none">
                                        <Avatar className="h-8 w-8 border-2 border-white/20">
                                            <AvatarImage src={firestorePhotoURL || profile?.photoURL || user.photoURL || undefined} alt="User" />
                                            <AvatarFallback className="bg-white/20 text-white">
                                                {(profile?.displayName || user.displayName)?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-black text-white max-w-[100px] truncate">
                                            {profile?.displayName || user.displayName || "User"}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-white group-data-[state=open]:rotate-180 transition-transform" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl p-2 border-none shadow-xl bg-white/80 backdrop-blur-xl">
                                    <DropdownMenuItem asChild>
                                        <Link to="/account" className="cursor-pointer font-medium text-gray-700 focus:bg-[#32dd9e]/10 focus:text-[#32dd9e] rounded-lg h-10 px-3 w-full flex items-center">
                                            Your account
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/?create_group=true" className="cursor-pointer font-medium text-gray-700 focus:bg-[#32dd9e]/10 focus:text-[#32dd9e] rounded-lg h-10 px-3 w-full flex items-center">
                                            Create a group
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild>
                                        <Link to="/support" className="cursor-pointer font-medium text-gray-700 focus:bg-[#32dd9e]/10 focus:text-[#32dd9e] rounded-lg h-10 px-3 w-full flex items-center">
                                            Contact support
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-200/50 my-1" />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer font-bold text-red-500 focus:bg-red-50 focus:text-red-600 rounded-lg h-10 px-3"
                                    >
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <>
                            <LoginLiquidButton onClick={onLoginClick} />
                            <button
                                onClick={onSignUpClick}
                                className="px-6 py-2.5 text-sm font-black text-white bg-[#32dd9e] hover:bg-[#2bc58d] rounded-full transition-all shadow-lg hover:shadow-[#32dd9e]/20 hover:scale-105 active:scale-95"
                            >
                                Sign up
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
}
