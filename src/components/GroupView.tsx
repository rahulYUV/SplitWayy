import { useState } from "react";
import { Plus, MoreVertical, History, Wallet, UserCheck, Layout, Home, Plane, Heart, Receipt, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "./Breadcrumbs";
import { AddExpenseModal } from "./AddExpenseModal";
import { useParams } from "react-router-dom";
import { useExpenses } from "@/context/ExpenseContext";
import { cn } from "@/lib/utils";
import { ExpenseDetailsDialog } from "./ExpenseDetailsDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function GroupView({ userName }: { userName: string }) {
    const { id } = useParams();
    const { groups, getGroupExpenses } = useExpenses();
    const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

    const group = groups.find(g => g.id === id);
    // Sort expenses by date descending
    const expenses = getGroupExpenses(id || "").sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
        const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
        return dateB - dateA;
    });

    if (!group) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20">
                <div className="text-white/20 font-black uppercase italic tracking-[1em]">Group Not Found</div>
            </div>
        );
    }

    // Dynamic Balance Calculation for this group
    const myNetBalance = expenses.reduce((acc, expense) => {
        const allInvolved = ["You", ...expense.participants];
        // If I'm not involved, skip
        const amIInvolved = allInvolved.some(p => p === "You" || p === userName || p.toLowerCase() === "you");
        if (!amIInvolved && expense.paidBy !== "You" && expense.paidBy !== userName && expense.paidBy.toLowerCase() !== "you") return acc;

        let myShare = 0;
        // Simple equal split logic for now as per app convention, or use splitDetails if available
        // Note: The context's getGroupExpenses returns expenses.
        // We assume equal split unless splitMethod differs.
        const participantCount = expense.participants.length || 1;
        // Logic from previous implementation:
        if (expense.splitMethod === "equally") {
            // participants list usually DOES NOT include the payer unless specified?
            // In this app, participants = "Split with [A, B]". Payer = "C".
            // Usually Total People = Participants + Payer (if payer is involved in split).
            // But existing logic: "allInvolved" used "You" + participants.
            // Let's stick to previous simpler logic:
            myShare = expense.amount / (allInvolved.length || 1);
        } else if (expense.splitDetails?.["You"]) {
            myShare = (expense.amount * Number(expense.splitDetails["You"])) / 100;
        } else {
            myShare = expense.amount / (allInvolved.length || 1);
        }

        const paidByMe = expense.paidBy === "You" || expense.paidBy === userName || expense.paidBy.toLowerCase() === "you";

        if (paidByMe) {
            // I paid, others owe me (total - my share)
            return acc + (expense.amount - myShare);
        } else {
            // Someone else paid, I owe my share
            // Only if I am in participants
            const amIParticipant = expense.participants.some(p => p === "You" || p === userName || p.toLowerCase() === "you");
            // Previous logic just checked "allInvolved.includes('You')" which it forcefully added.
            // But if I am NEITHER payer NOR participant, do I owe?
            // "You" is always in allInvolved in previous logic?
            // Line 27: const allInvolved = ["You", ...expense.participants];
            // Then Line 28: if (!allInvolved.includes("You")) ... (always true).
            // This logic seems slightly flawed in original but I will preserve the *intent* of finding my balance.
            // If I am in the group, I am likely involved.
            return acc - myShare;
        }
    }, 0);

    const groupTypes = {
        Home: { icon: Home, color: "text-blue-400", bg: "bg-blue-400/10" },
        Trip: { icon: Plane, color: "text-yellow-400", bg: "bg-yellow-400/10" },
        Couple: { icon: Heart, color: "text-red-400", bg: "bg-red-400/10" },
        Other: { icon: Layout, color: "text-gray-400", bg: "bg-gray-400/10" },
    };

    const typeConfig = groupTypes[group.type as keyof typeof groupTypes] || groupTypes.Other;

    return (
        <div className="flex-1 flex flex-col p-8 w-full animate-in fade-in duration-700 overflow-y-auto custom-scrollbar">
            {/* 1. Header Section */}
            <div className="px-2 py-6 border-b border-gray-100 w-full mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3", typeConfig.bg)}>
                        <typeConfig.icon size={40} className={typeConfig.color} />
                    </div>
                    <div className="flex flex-col">
                        <Breadcrumbs userName={userName} currentPage={group.name} />
                        <div className="flex items-center gap-3 mt-1">
                            <h1 className="text-4xl font-black text-black italic tracking-tighter uppercase">{group.name}</h1>
                            <div className="bg-gray-100 border border-gray-200 px-3 py-1 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                {group.members.length + 1} People
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <AddExpenseModal userName={userName} groupId={group.id}>
                        <Button className="bg-[#ff6d2f] hover:bg-[#ff8552] text-white font-black uppercase italic px-10 h-16 rounded-[1.5rem] shadow-[0_8px_0_#9c3d14] active:shadow-none active:translate-y-[8px] transition-all border border-white/10 flex items-center gap-4 text-xl group">
                            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                            Add an expense
                        </Button>
                    </AddExpenseModal>

                    <Button className="bg-[#32dd9e] hover:bg-[#32dd9e]/90 text-white font-black uppercase italic px-10 h-16 rounded-[1.5rem] shadow-[0_8px_0_#1d8a62] active:shadow-none active:translate-y-[8px] transition-all border border-black/10 flex items-center gap-4 text-xl">
                        <UserCheck className="w-6 h-6" />
                        Settle up
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-2xl w-16 h-16 transition-all">
                                <MoreVertical className="w-8 h-8" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-white border-gray-100 shadow-xl rounded-xl p-2">
                            <DropdownMenuItem
                                onClick={() => toast.info("Edit Group functionality coming soon!")}
                                className="gap-2 text-blue-600 focus:text-blue-700 cursor-pointer text-xs font-bold uppercase tracking-widest py-3 hover:bg-blue-50 rounded-lg mb-1"
                            >
                                <Pencil className="w-4 h-4" /> Edit Group
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => toast.info("Delete Group functionality coming soon!")}
                                className="gap-2 text-red-600 focus:text-red-700 cursor-pointer text-xs font-bold uppercase tracking-widest py-3 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Group
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* 2. Content Section */}
            {expenses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-1000">
                    <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl relative overflow-hidden group">
                        {/* Decorative Background Blur */}
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#ff6d2f]/10 blur-[80px] rounded-full group-hover:bg-[#ff6d2f]/20 transition-all duration-1000" />
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#32dd9e]/5 blur-[80px] rounded-full group-hover:bg-[#32dd9e]/15 transition-all duration-1000" />

                        {/* Character Placeholder (Using a stylistic SVG) */}
                        <div className="w-64 h-64 shrink-0 relative z-10 flex items-center justify-center">
                            <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
                                <rect x="40" y="40" width="120" height="120" rx="20" fill="black" className="animate-bounce" style={{ animationDuration: '3s' }} />
                                <path d="M70 160C70 160 80 200 100 210C120 220 140 180 140 180" stroke="black" strokeWidth="12" strokeLinecap="round" opacity="0.1" />
                                <circle cx="85" cy="85" r="8" fill="white" />
                                <circle cx="115" cy="85" r="8" fill="white" />
                                <path d="M85 120C90 125 110 125 115 120" stroke="white" strokeWidth="6" strokeLinecap="round" />
                            </svg>
                        </div>

                        <div className="flex flex-col text-center md:text-left relative z-10">
                            <h2 className="text-5xl font-black text-black italic tracking-tighter uppercase leading-none">The group has not<br />recorded any bills yet</h2>
                            <p className="text-gray-400 text-lg font-bold uppercase tracking-widest mt-6 max-w-md">
                                Be the first to add an expense and start splitting with the gang!
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-4 px-4 flex items-center gap-4">
                        <History size={12} />
                        Recent Group Activity
                    </div>
                    {expenses.map((expense, idx) => (
                        <div key={expense.id}
                            onClick={() => setSelectedExpenseId(expense.id)}
                            className="bg-white border border-gray-100 hover:border-[#32dd9e]/30 hover:shadow-lg rounded-3xl p-6 transition-all group flex items-center justify-between cursor-pointer"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#32dd9e] transition-colors">
                                    <Receipt size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-black font-bold text-lg">{expense.description}</span>
                                    <span className="text-gray-400 text-xs font-medium uppercase tracking-widest flex items-center gap-2">
                                        <Wallet size={12} />
                                        Paid by {expense.paidBy} • {format(new Date(expense.date), "MMM dd, yyyy")}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-black italic">₹{expense.amount.toLocaleString()}</span>
                                <span className="text-[#32dd9e] text-[10px] font-black uppercase tracking-tight italic">Split {expense.splitMethod}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. Footer Stats (Mini Card) */}
            {expenses.length > 0 && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col gap-1 shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Group Spending</span>
                        <span className="text-3xl font-black text-black italic">₹{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
                    </div>
                    <div className={cn(
                        "rounded-3xl p-6 flex flex-col gap-1 border shadow-sm bg-white",
                        myNetBalance >= 0
                            ? "border-[#32dd9e]/30"
                            : "border-[#ff6d2f]/30"
                    )}>
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            myNetBalance >= 0 ? "text-[#32dd9e]" : "text-[#ff6d2f]"
                        )}>Your Net Balance</span>
                        <span className={cn(
                            "text-3xl font-black italic",
                            myNetBalance >= 0 ? "text-[#32dd9e]" : "text-[#ff6d2f]"
                        )}>
                            {myNetBalance >= 0 ? "+" : "-"}₹{Math.abs(myNetBalance).toLocaleString()}
                        </span>
                    </div>
                </div>
            )}

            {/* Expense Details Dialog */}
            <ExpenseDetailsDialog
                expenseId={selectedExpenseId}
                isOpen={!!selectedExpenseId}
                onClose={() => setSelectedExpenseId(null)}
                userName={userName}
            />
        </div>
    );
}
