import { cn } from "@/lib/utils";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

interface NavbarProps {
    className?: string;
    onSignUpClick?: () => void;
    onLoginClick?: () => void;
    user?: User | null;
    profile?: any;
}

export function Navbar({ className, onSignUpClick, onLoginClick, user, profile }: NavbarProps) {
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center w-full">
            <nav
                className={cn(
                    "flex justify-between items-center px-8 py-3 transition-all duration-300",
                    "w-[90%] md:w-[80%] rounded-full",
                    "bg-white/70 backdrop-blur-xl border border-gray-200 shadow-xl",
                    className
                )}
            >
                <div className="flex items-center gap-2">
                    <img src={logo} alt="SplitWayy Logo" className="h-10 w-auto cursor-pointer" />
                    <span className="text-xl font-black text-black tracking-tighter italic">SplitWayy</span>
                </div>

                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link to="/" className="text-base font-bold text-purple-600 hover:text-purple-700 transition-colors drop-shadow-sm">
                                Home
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 pl-1 pr-3 py-1 bg-[#32dd9e] hover:bg-[#2bc58d] rounded-full transition-all shadow-lg hover:shadow-[#32dd9e]/20 hover:scale-105 active:scale-95 group outline-none">
                                        <Avatar className="h-8 w-8 border-2 border-white/20">
                                            <AvatarImage src={profile?.photoURL || user.photoURL || undefined} alt="User" />
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
                                    <DropdownMenuItem className="cursor-pointer font-medium text-gray-700 focus:bg-[#32dd9e]/10 focus:text-[#32dd9e] rounded-lg h-10 px-3">
                                        Create a group
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer font-medium text-gray-700 focus:bg-[#32dd9e]/10 focus:text-[#32dd9e] rounded-lg h-10 px-3">
                                        Fairness calculators
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer font-medium text-gray-700 focus:bg-[#32dd9e]/10 focus:text-[#32dd9e] rounded-lg h-10 px-3">
                                        Contact support
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
                            <button
                                onClick={onLoginClick}
                                className="text-sm font-bold text-gray-600 hover:text-black transition-colors"
                            >
                                Log in
                            </button>
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
