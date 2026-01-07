import { useState } from "react";
import { MoreVertical, Plus, Mail, ArrowRight, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CurrencyRupeeIcon from "@/components/ui/icons/currency-rupee-icon";
import { Breadcrumbs } from "./Breadcrumbs";
import { AddExpenseModal } from "./AddExpenseModal";
import { useParams } from "react-router-dom";
import { useExpenses, Expense } from "@/context/ExpenseContext";
import { cn } from "@/lib/utils";
import { sendInviteEmail } from "@/utils/emailUtils";
import { ExpenseDetailsDialog } from "./ExpenseDetailsDialog";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { SettleUpModal } from "@/components/SettleUpModal";

interface FriendViewProps {
    friendName?: string;
    userName: string;
}

export function FriendView({ friendName, userName }: FriendViewProps) {
    const { id } = useParams();
    const { getFriendBalance, friends, expenses } = useExpenses();
    const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
    const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);

    // Find the display name: either from props, or find in context based on the slug ID
    const friendFromContext = friends.find(f => f.displayName.toLowerCase().replace(/\s+/g, '-') === id);

    // If not in friends list, check unique names in expenses
    const namesInExpenses = Array.from(new Set(expenses.flatMap(e => e.participants)));
    const customFriendName = namesInExpenses.find(n => n.toLowerCase().replace(/\s+/g, '-') === id);

    const displayName = friendName || friendFromContext?.displayName || customFriendName || (id ? id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Arjun Sharma");

    const balance = getFriendBalance(displayName);

    // Filter Expenses for this friend
    const friendExpenses = expenses.filter(item => {
        const involved = [item.paidBy, ...item.participants];
        // Check exact match or substring match
        return involved.some(p => {
            const pLower = p.toLowerCase().trim();
            const dLower = displayName.toLowerCase().trim();
            return pLower === dLower || pLower.includes(dLower) || dLower.includes(pLower);
        });
    }).sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
        const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
        return dateB - dateA;
    });

    const handleCardClick = (expense: Expense) => {
        setSelectedExpenseId(expense.id);
    };

    return (
        <div className="flex-1 flex flex-col p-8 w-full overflow-y-auto custom-scrollbar">
            <div className="px-2 py-6 border-b border-gray-100 w-full mb-8 flex items-center justify-between group/header cursor-default">
                <Breadcrumbs userName={userName} currentPage={displayName} />
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => sendInviteEmail(displayName, userName)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-2xl w-14 h-14 transition-all focus:ring-0 shadow-sm"
                        title="Invite Friend via Email"
                    >
                        <Mail className="w-6 h-6" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-2xl w-14 h-14 transition-all focus:ring-0 shadow-sm">
                                <MoreVertical className="w-6 h-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-white border-gray-100 shadow-xl rounded-xl p-2">
                            <DropdownMenuItem
                                onClick={() => toast.info("Delete Friend logic coming soon!")}
                                className="gap-2 text-red-500 focus:text-red-500 cursor-pointer font-bold uppercase text-xs tracking-widest py-3 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Friend
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AddExpenseModal userName={userName}>
                        <Button className="bg-[#ff6d2f] hover:bg-[#ff8552] text-white font-black uppercase italic px-8 h-14 rounded-2xl shadow-[0_8px_0_#9c3d14] active:shadow-none active:translate-y-[8px] transition-all border border-white/10 flex items-center gap-4 text-lg">
                            <Plus className="w-5 h-5" />
                            Add expense
                        </Button>
                    </AddExpenseModal>
                </div>
            </div>

            <div className="space-y-8 pb-20">
                {/* Balance Card */}
                <div className="bg-white border border-gray-100 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center gap-6 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col gap-2 relative z-10">
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400">Current Standing</span>
                        {balance === 0 ? (
                            <h3 className="text-6xl font-black text-gray-200 italic tracking-tighter drop-shadow-sm">
                                All settled up
                            </h3>
                        ) : (
                            <h3 className={cn(
                                "text-6xl font-black italic tracking-tighter drop-shadow-sm flex items-center justify-center gap-2",
                                balance > 0 ? "text-[#32dd9e]" : "text-[#ff6d2f]"
                            )}>
                                {balance > 0 ? "Owes you" : "You owe"}
                                <CurrencyRupeeIcon size={44} color={balance > 0 ? "#32dd9e" : "#ff6d2f"} className="translate-y-[-2px]" />
                                {Math.abs(balance).toLocaleString()}
                            </h3>
                        )}
                    </div>

                    <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4 relative z-10" />

                    {balance !== 0 && (
                        <Button
                            onClick={() => setIsSettleUpOpen(true)}
                            className={cn(
                                "font-black uppercase italic px-12 py-8 rounded-2xl transition-all border-4 text-xl flex items-center gap-4 relative z-10",
                                balance > 0
                                    ? "bg-[#32dd9e] hover:bg-[#45e6a9] text-white shadow-[0_10px_0_#1a8c63] border-white/10"
                                    : "bg-black hover:bg-gray-900 text-white shadow-[0_10px_0_#333] border-white/5 cancel-shadow"
                            )}>
                            Settle with {displayName.split(' ')[0]}
                        </Button>
                    )}

                    <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.3em] mt-4 italic flex items-center justify-center gap-1 relative z-10">
                        {balance === 0 ? "Keep it this way!" : "Time to clear the dues"}
                    </p>

                    {/* Subtle Grid Background Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
                </div>

                {/* Friend's Transaction List */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-4">Transactions with {displayName.split(' ')[0]}</h3>
                    {friendExpenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-30">
                            <Receipt size={48} className="text-gray-300 mb-2" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No transactions yet</p>
                        </div>
                    ) : (
                        friendExpenses.map((item, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={item.id}
                                onClick={() => handleCardClick(item)}
                                className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between hover:shadow-lg hover:border-[#32dd9e]/50 hover:scale-[1.01] transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#32dd9e] opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 text-gray-500 group-hover:bg-[#32dd9e]/10 group-hover:text-[#32dd9e] transition-colors">
                                        <Receipt className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-900 font-bold uppercase text-sm tracking-tight group-hover:text-[#32dd9e] transition-colors">
                                            {item.description}
                                        </span>
                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            <span className={item.paidBy === "you" || item.paidBy === userName ? "text-[#32dd9e]" : "text-gray-500"}>
                                                {item.paidBy === "you" || item.paidBy === userName ? "You" : item.paidBy} paid
                                            </span>
                                            {" • "}
                                            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-end">
                                        <span className={item.paidBy === "you" || item.paidBy === userName ? "text-[#32dd9e]" : "text-gray-400"}>
                                            {item.paidBy === "you" || item.paidBy === userName ? "you lent" : "you borrowed"}
                                        </span>
                                        <span className={`text-xl font-black tracking-tighter flex items-center gap-0.5 ${item.paidBy === "you" || item.paidBy === userName ? "text-[#32dd9e]" : "text-red-400"
                                            }`}>
                                            <CurrencyRupeeIcon size={16} />
                                            {item.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#32dd9e] transition-colors" />
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Expense Details Dialog (Shared) */}
            <ExpenseDetailsDialog
                expenseId={selectedExpenseId}
                isOpen={!!selectedExpenseId}
                onClose={() => setSelectedExpenseId(null)}
                userName={userName}
            />

            <SettleUpModal
                isOpen={isSettleUpOpen}
                onClose={() => setIsSettleUpOpen(false)}
                friendName={displayName}
                balance={balance}
                userName={userName}
            />
        </div>
    );
}
