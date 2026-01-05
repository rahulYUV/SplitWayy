
import { cn } from "@/lib/utils";
import logo from "../assets/images/Home.png";

interface NavbarProps {
    className?: string;
    onSignUpClick?: () => void;
}

export function Navbar({ className, onSignUpClick }: NavbarProps) {
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
                    <button className="text-sm font-bold text-gray-600 hover:text-black transition-colors">
                        Log in
                    </button>
                    <button
                        onClick={onSignUpClick}
                        className="px-6 py-2.5 text-sm font-black text-white bg-[#32dd9e] hover:bg-[#2bc58d] rounded-full transition-all shadow-lg hover:shadow-[#32dd9e]/20 hover:scale-105 active:scale-95"
                    >
                        Sign up
                    </button>
                </div>
            </nav>
        </div>
    );
}
