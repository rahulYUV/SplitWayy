import { useState } from "react";
import { MoreVertical, Plus, ArrowRight, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CurrencyRupeeIcon from "@/components/ui/icons/currency-rupee-icon";
import { Breadcrumbs } from "./Breadcrumbs";
import { AddExpenseModal } from "./AddExpenseModal";
import { useParams, useNavigate } from "react-router-dom";
import { useExpenses, Expense } from "@/context/ExpenseContext";
import { deleteFriend } from "@/services/friendService";
import { deleteExpense } from "@/services/expenseService"; // Added import
import { logActivity } from "@/services/activityService";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";

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
    const navigate = useNavigate();
    const { getFriendBalance, friends, expenses, groups } = useExpenses();
    const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
    const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);

    // Find the display name: either from props, or find in context based on the slug ID
    const friendFromContext = friends.find(f => f.displayName?.toLowerCase().replace(/\s+/g, '-') === id);

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

    const handleDeleteFriend = async () => {
        if (Math.abs(balance) > 0.5) {
            toast.error("Cannot delete pending friend: Please settle existing balance first.", {
                description: (
                    <span className="text-gray-600 font-medium">
                        You have a remaining balance of ₹{Math.abs(balance).toFixed(3)}
                    </span>
                )
            });
            return;
        }

        // 1. Check Group Membership (BLOCKING)
        const linkedGroups = groups.filter(g =>
            g.members.some(m => m.name.toLowerCase() === displayName.toLowerCase())
        );

        if (linkedGroups.length > 0) {
            const groupNames = linkedGroups.map(g => g.name).join(", ");
            toast.error(`Cannot delete ${displayName}`, {
                description: `They are a member of the following groups: ${groupNames}. Please remove them from the group(s) first.`
            });
            return;
        }

        // 2. Handle Associated Expenses (CONFIRM & DELETE)
        // Combine active and orphan expenses - we delete ALL if confirmed.
        if (friendExpenses.length > 0) {
            const confirmExpenses = window.confirm(
                `${displayName} is involved in ${friendExpenses.length} expense(s). Deleting this friend will PERMANENTLY DELETE these transactions.\n\nAre you sure you want to proceed?`
            );
            if (!confirmExpenses) return;

            try {
                const toastId = toast.loading("Deleting expenses...");
                await Promise.all(friendExpenses.map(exp => deleteExpense(exp.id)));
                toast.dismiss(toastId);
                toast.success(`Deleted ${friendExpenses.length} associated expenses.`);
            } catch (error) {
                console.error("Failed to delete expenses", error);
                toast.error("Failed to delete associated expenses. Please try again.");
                return;
            }
        } else {
            // Confirm deletion even if no expenses, just to be safe
            const confirm = window.confirm(`Are you sure you want to delete ${displayName}? This action cannot be undone.`);
            if (!confirm) return;
        }

        // 3. Delete Friend Document (if it exists)
        if (friendFromContext?.id) {
            try {
                await deleteFriend(friendFromContext.id);
            } catch (error) {
                console.error("Delete friend error:", error);
                toast.error("Failed to delete friend record");
                return;
            }
        }

        // 4. Log and Redirect
        if (auth.currentUser?.uid) {
            await logActivity({
                type: "delete_group", // generic delete type
                description: `Deleted friend: ${displayName}`,
                details: {
                    groupName: "Friends",
                    deletedAt: new Date()
                },
                createdBy: userName,
                userId: auth.currentUser.uid,
                visibleToUserEmails: auth.currentUser?.email ? [auth.currentUser.email] : []
            });
        }

        toast.success("Friend deleted successfully");
        navigate("/");
    };

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 w-full overflow-y-auto custom-scrollbar">
            <div className="px-2 py-6 border-b border-gray-100 w-full mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 group/header cursor-default">
                <Breadcrumbs userName={userName} currentPage={displayName} />
                <div className="flex items-center gap-4">


                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-2xl w-12 h-12 md:w-14 md:h-14 transition-all focus:ring-0 shadow-sm">
                                <MoreVertical className="w-5 h-5 md:w-6 md:h-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-white border-gray-100 shadow-xl rounded-xl p-2">
                            <DropdownMenuItem
                                onClick={handleDeleteFriend}
                                className="gap-2 text-red-500 focus:text-red-500 cursor-pointer font-bold uppercase text-xs tracking-widest py-3 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Friend
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AddExpenseModal userName={userName} defaultParticipants={[displayName]} hideManualParticipantEntry={true}>
                        <Button className="bg-[#ff6d2f] hover:bg-[#ff8552] text-white font-black uppercase italic px-6 md:px-8 h-12 md:h-14 rounded-2xl shadow-[0_4px_0_#9c3d14] md:shadow-[0_8px_0_#9c3d14] active:shadow-none active:translate-y-[4px] md:active:translate-y-[8px] transition-all border border-white/10 flex items-center gap-2 md:gap-4 text-sm md:text-lg w-full md:w-auto">
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            Add expense
                        </Button>
                    </AddExpenseModal>
                </div>
            </div>

            <div className="space-y-8 pb-20">
                {/* Balance Card */}
                <div className="bg-white border border-gray-100 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 flex flex-col items-center justify-center text-center gap-4 md:gap-6 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col gap-2 relative z-10 w-full">
                        <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-gray-400">Current Standing</span>
                        {balance === 0 ? (
                            <h3 className="text-3xl md:text-6xl font-black text-gray-200 italic tracking-tighter drop-shadow-sm">
                                All settled up
                            </h3>
                        ) : (
                            <h3 className={cn(
                                "text-3xl md:text-6xl font-black italic tracking-tighter drop-shadow-sm flex flex-wrap items-center justify-center gap-1 md:gap-2 break-all",
                                balance > 0 ? "text-[#32dd9e]" : "text-[#ff6d2f]"
                            )}>
                                <span className="whitespace-nowrap">{balance > 0 ? "Owes you" : "You owe"}</span>
                                <div className="flex items-center">
                                    <CurrencyRupeeIcon className="w-6 h-6 md:w-[44px] md:h-[44px] translate-y-[-1px]" color={balance > 0 ? "#32dd9e" : "#ff6d2f"} />
                                    <span>{Math.abs(balance).toLocaleString()}</span>
                                </div>
                            </h3>
                        )}
                    </div>

                    <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4 relative z-10" />

                    {balance !== 0 && (
                        <Button
                            onClick={() => setIsSettleUpOpen(true)}
                            className={cn(
                                "font-black uppercase italic px-6 py-4 md:px-12 md:py-8 h-auto rounded-xl md:rounded-2xl transition-all border-4 text-sm md:text-xl flex items-center gap-2 md:gap-4 relative z-10 w-full md:w-auto justify-center",
                                balance > 0
                                    ? "bg-[#32dd9e] hover:bg-[#45e6a9] text-white shadow-[0_6px_0_#1a8c63] md:shadow-[0_10px_0_#1a8c63] border-white/10"
                                    : "bg-black hover:bg-gray-900 text-white shadow-[0_6px_0_#333] md:shadow-[0_10px_0_#333] border-white/5 cancel-shadow"
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
                                            <span className={item.paidBy === "you" || item.paidBy === userName || item.paidBy === "You" ? "text-[#32dd9e]" : "text-gray-500"}>
                                                {item.paidBy === "you" || item.paidBy === userName || item.paidBy === "You" ? "You" : item.paidBy} paid
                                            </span>
                                            {" • "}
                                            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-end">
                                        <span className={item.paidBy === "you" || item.paidBy === userName || item.paidBy === "You" ? "text-[#32dd9e]" : "text-gray-400"}>
                                            {item.paidBy === "you" || item.paidBy === userName || item.paidBy === "You" ? "you paid" : "your share"}
                                        </span>
                                        <span className={`text-xl font-black tracking-tighter flex items-center gap-0.5 ${item.paidBy === "you" || item.paidBy === userName || item.paidBy === "You" ? "text-[#32dd9e]" : "text-gray-900"
                                            }`}>
                                            <CurrencyRupeeIcon size={16} />
                                            {(() => {
                                                const isPayerMe = item.paidBy === "You" || item.paidBy === userName || item.paidBy === "you";
                                                const targetNames = isPayerMe ? [displayName] : ["You", userName, userName.split(' ')[0]];

                                                let share = 0;
                                                const participants = item.participants.map(p => p.toLowerCase());

                                                if (item.splitMethod === "equally") {
                                                    const isTargetInvolved = targetNames.some(t => participants.includes(t.toLowerCase()));
                                                    if (isTargetInvolved && item.participants.length > 0) {
                                                        share = item.amount / item.participants.length;
                                                    }
                                                } else if (item.splitMethod === "exact") {
                                                    targetNames.forEach(t => {
                                                        share += Number(item.splitDetails?.[t] || 0);
                                                    });
                                                } else if (item.splitMethod === "percentage") {
                                                    targetNames.forEach(t => {
                                                        share += (item.amount * (Number(item.splitDetails?.[t] || 0))) / 100;
                                                    });
                                                }

                                                if (share === 0 && !isPayerMe && item.paidBy !== displayName) return item.amount.toLocaleString();

                                                return share > 0 ? share.toLocaleString(undefined, { maximumFractionDigits: 2 }) : item.amount.toLocaleString();
                                            })()}
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
                friendEmail={friendFromContext?.email}
                balance={balance}
                userName={userName}
            />
        </div>
    );
}
