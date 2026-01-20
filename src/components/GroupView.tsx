import { useState, useMemo } from "react";
import { auth } from "@/lib/firebase";
import {
    Plus,
    MoreVertical,
    History,
    Wallet,
    UserCheck,
    Layout,
    Home,
    Plane,
    Pencil,
    Trash2,
    Users,
    Heart,
    Receipt,
    LayoutList
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { calculateSmartDebts } from "@/lib/debtCalculator";

import { AddExpenseModal } from "./AddExpenseModal";
import { useParams, useNavigate } from "react-router-dom";
import { useExpenses } from "@/context/ExpenseContext";
import { cn } from "@/lib/utils";
import { ExpenseDetailsDialog } from "./ExpenseDetailsDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { SettleUpModal } from "./SettleUpModal";
import { toast } from "sonner";
import { GroupStatsChart } from "./GroupStatsChart";
import { GroupSpendingBarChart } from "./GroupSpendingBarChart";
import { LiquidGlassCard } from "@/components/ui/LiquidGlassCard";
import { deleteGroup, addUserToGroup } from "@/services/groupService";
import { deleteExpense } from "@/services/expenseService";
import { logActivity } from "@/services/activityService";
import { calculateDebts } from "@/lib/debtCalculator";

export function GroupView({ userName }: { userName: string }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { groups, getGroupExpenses, getFriendBalance } = useExpenses();
    const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
    const [isSelectionOpen, setIsSelectionOpen] = useState(false);
    const [settleMember, setSettleMember] = useState<{ name: string; email?: string; balance: number } | null>(null);
    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [isEditOpen, setIsEditOpen] = useState(false);

    const group = groups.find(g => g.id === id);
    // Sort expenses by date descending
    const expenses = getGroupExpenses(id || "").sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
        const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
        return dateB - dateA;
    });

    // Normalize expenses for debt calculation to merge "You" and "userName"
    const normalizedExpenses = useMemo(() => {
        return expenses.map(e => {
            const normalize = (name: string) => {
                const n = name?.trim();
                const u = userName?.trim();
                return (n === "You" || n === u) ? u : n;
            };

            return {
                ...e,
                paidBy: normalize(e.paidBy),
                participants: e.participants.map(normalize),
                payerDetails: e.payerDetails ? Object.entries(e.payerDetails).reduce((acc, [key, val]) => {
                    acc[normalize(key)] = val;
                    return acc;
                }, {} as Record<string, any>) : undefined,
                splitDetails: e.splitDetails ? Object.entries(e.splitDetails).reduce((acc, [key, val]) => {
                    acc[normalize(key)] = val;
                    return acc;
                }, {} as Record<string, any>) : undefined
            };
        });
    }, [expenses, userName]);

    // Calculate Debts
    const debts = useMemo(() => calculateDebts(normalizedExpenses), [normalizedExpenses]);


    // Check if group is settled (simplified)
    const isGroupSettled = useMemo(() => {
        if (!group || expenses.length === 0) return true;

        // If there are outstanding balances shown in "Who to settle with", you can't delete.
        // We verify this by running getFriendBalance for all members.
        // If ANY member has a balance relative to ME, it is NOT settled for ME.
        // Note: This logic only checks if *I* am settled. Ideally should check everyone.
        // But for MVP data consistency, users should settle up before deleting.

        const hasUnsettledDebts = group.members.some(m => {
            if (m.name === userName || m.name === "You") return false;
            const bal = getFriendBalance(m.name);
            return Math.abs(bal) >= 1;
        });

        return !hasUnsettledDebts;
    }, [group, expenses, userName, getFriendBalance]);

    const handleDeleteGroup = async () => {
        if (!group) return;

        toast.promise(
            async () => {
                // Log Activity first
                // Need to handle potential dates in group.createdAt
                let createdDate = new Date();
                try {
                    if (group.createdAt && typeof group.createdAt.toDate === 'function') {
                        createdDate = group.createdAt.toDate();
                    } else if (group.createdAt instanceof Date) {
                        createdDate = group.createdAt;
                    }
                } catch (e) {
                    console.warn("Date parse error", e);
                }

                // Ensure we have at least the current user's email
                const currentUserEmail = auth.currentUser?.email;
                const visibilityList = new Set([
                    ...(group.memberEmails || []),
                    currentUserEmail,
                    // If auth user email is null, try to use a passed prop or storage if defined (omitted here for safety, relying on auth)
                ].filter((e): e is string => !!e));

                await logActivity({
                    type: "delete_group",
                    description: `Group "${group.name}" was deleted`,
                    details: {
                        groupName: group.name,
                        deletedAt: new Date(),
                        createdAt: createdDate,
                        participants: group.members.map(m => m.name)
                    },
                    createdBy: userName || "Someone",
                    userId: auth.currentUser?.uid,
                    visibleToUserEmails: Array.from(visibilityList)
                });

                // Delete Group
                await deleteGroup(group.id);

                // Delete associated expenses
                const deleteExpensesPromises = expenses.map(e => deleteExpense(e.id));
                await Promise.all(deleteExpensesPromises);

                // Navigate away
                navigate("/");
            },
            {
                loading: 'Deleting group...',
                success: 'Group deleted successfully',
                error: 'Failed to delete group'
            }
        );
    };

    if (!group) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20">
                <div className="text-white/20 font-black uppercase italic tracking-[1em]">Group Not Found</div>
            </div>
        );
    }

    // Dynamic Balance Calculation for this group
    const overview = expenses.reduce((acc, expense) => {
        let efficientParticipants = [...expense.participants];
        // Handling Legacy "You"
        if (expense.paidBy === "You" && !efficientParticipants.includes("You")) {
            efficientParticipants.push("You");
        }

        const amIInvolved = efficientParticipants.includes(userName) || efficientParticipants.includes("You");

        const paidByMe = expense.paidBy === "You" || expense.paidBy === userName;

        if (!amIInvolved && !paidByMe) return acc;

        // Calculate My Share
        let myShare = 0;
        const totalPeople = efficientParticipants.length;

        if (expense.splitMethod === "equally") {
            if (amIInvolved && totalPeople > 0) {
                myShare = expense.amount / totalPeople;
            }
        } else {
            myShare = 0;
            if (expense.splitMethod === "percentage") {
                const p1 = Number(expense.splitDetails?.[userName] || 0);
                const p2 = Number(expense.splitDetails?.["You"] || 0);
                myShare = (expense.amount * (p1 + p2)) / 100;
            } else if (expense.splitMethod === "exact") {
                const s1 = Number(expense.splitDetails?.[userName] || 0);
                const s2 = Number(expense.splitDetails?.["You"] || 0);
                myShare = s1 + s2;
            }
        }

        const paidAmt = paidByMe ? expense.amount : 0;

        return {
            paid: acc.paid + paidAmt,
            share: acc.share + myShare,
            net: acc.net + (paidAmt - myShare)
        };
    }, { paid: 0, share: 0, net: 0 });

    const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

    const myTotalPaid = round2(overview.paid);
    const myTotalShare = round2(overview.share);
    const myNetBalance = round2(overview.net);

    // Calculate balances for each member relative to "You" (NET for this group)
    // 1. Gather all unique people involved in expenses + group members
    const allInvolvedPeople = Array.from(new Set([
        ...group.members.map(m => m.name),
        ...expenses.flatMap(e => e.participants),
        ...expenses.flatMap(e => e.paidBy === "multiple" && e.payerDetails ? Object.keys(e.payerDetails) : [e.paidBy])
    ]));

    const memberBalances = allInvolvedPeople
        .filter(name => name && name !== userName && name !== "You") // Exclude self
        .map(name => {
            let bal = 0;
            expenses.forEach(expense => {
                const payer = expense.paidBy === "You" ? userName : expense.paidBy;
                const efficientParticipants = [...expense.participants];
                if (expense.paidBy === "You" && !efficientParticipants.includes("You")) efficientParticipants.push("You");

                const amIInvolved = efficientParticipants.includes(userName) || efficientParticipants.includes("You");
                const isMemberInvolved = efficientParticipants.includes(name);

                if (!amIInvolved && !isMemberInvolved) return;

                const paidByMe = payer === userName;
                const paidByMember = payer === name;

                if (!paidByMe && !paidByMember) return;

                const totalPeople = efficientParticipants.length;
                let share = 0;
                if (expense.splitMethod === "equally" && totalPeople > 0) share = expense.amount / totalPeople;
                else if (expense.splitMethod === "percentage") {
                    if (paidByMe) {
                        const p = Number(expense.splitDetails?.[name] || 0);
                        share = (expense.amount * p) / 100;
                    } else {
                        const p = Number(expense.splitDetails?.[userName] || expense.splitDetails?.["You"] || 0);
                        share = (expense.amount * p) / 100;
                    }
                } else {
                    if (paidByMe) {
                        share = Number(expense.splitDetails?.[name] || 0);
                    } else {
                        share = Number(expense.splitDetails?.[userName] || expense.splitDetails?.["You"] || 0);
                    }
                }

                if (paidByMe && isMemberInvolved) bal += share;
                if (paidByMember && amIInvolved) bal -= share;
            });
            return { name: name, bal: round2(bal) };
        })
        .filter(d => Math.abs(d.bal) > 0.01); // Filter out resolved 0.01 differences

    // Chart Data Preparation
    const spendingByPayer: Record<string, number> = {};
    expenses.forEach(e => {
        // Exclude settlements/payments from group spending statistics
        if (e.category === "Payment" || e.description.toLowerCase() === "settlement") {
            return;
        }

        // Prepare canonical names for chart
        const normalizeForChart = (name: string) => {
            const n = name?.trim();
            const u = userName?.trim();
            return (n === "You" || n === u) ? "You" : n;
        };

        if (e.paidBy === "multiple" && e.payerDetails) {
            Object.entries(e.payerDetails).forEach(([person, amount]) => {
                const name = normalizeForChart(person);
                const amt = Number(amount) || 0;
                spendingByPayer[name] = (spendingByPayer[name] || 0) + amt;
            });
        } else {
            const name = normalizeForChart(e.paidBy);
            spendingByPayer[name] = (spendingByPayer[name] || 0) + e.amount;
        }
    });

    const totalSpending = round2(Object.values(spendingByPayer).reduce((a, b) => a + b, 0));

    const chartData = Object.entries(spendingByPayer).map(([name, value], index) => {
        const colors = ["#32dd9e", "#ff6d2f", "#3b82f6", "#facc15", "#a855f7", "#ec4899"];
        return {
            name,
            value,
            fill: colors[index % colors.length]
        };
    }).sort((a, b) => b.value - a.value);

    const groupTypes = {
        Home: { icon: Home, color: "text-blue-400", bg: "bg-blue-400/10" },
        Trip: { icon: Plane, color: "text-yellow-400", bg: "bg-yellow-400/10" },
        Couple: { icon: Heart, color: "text-red-400", bg: "bg-red-400/10" },
        Other: { icon: Layout, color: "text-gray-400", bg: "bg-gray-400/10" },
    };

    const typeConfig = groupTypes[group.type as keyof typeof groupTypes] || groupTypes.Other;

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 w-full animate-in fade-in duration-700 overflow-y-auto custom-scrollbar">
            {/* 1. Header Section */}
            <div className="px-2 py-6 border-b border-gray-100 w-full mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3", typeConfig.bg)}>
                        <typeConfig.icon size={40} className={typeConfig.color} />
                    </div>
                    <div className="flex flex-col">

                        <div className="flex items-center gap-3 mt-1">
                            <h1 className="text-2xl md:text-4xl font-black text-black italic tracking-tighter uppercase">{group.name}</h1>
                            <div className="bg-gray-100 border border-gray-200 px-3 py-1 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                {group.members.some(m => m.name === "You" || m.name === userName) ? group.members.length : group.members.length + 1} People
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                    <AddExpenseModal userName={userName} groupId={group.id}>
                        <Button className="flex-1 md:flex-none bg-[#ff6d2f] hover:bg-[#ff8552] text-white font-black uppercase italic px-4 md:px-10 h-12 md:h-16 rounded-[1.5rem] shadow-[0_4px_0_#9c3d14] md:shadow-[0_8px_0_#9c3d14] active:shadow-none active:translate-y-[4px] md:active:translate-y-[8px] transition-all border border-white/10 flex items-center justify-center gap-2 md:gap-4 text-xs md:text-xl group">
                            <Plus className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="truncate">Add Expense</span>
                        </Button>
                    </AddExpenseModal>

                    <Button
                        onClick={() => setIsSelectionOpen(true)}
                        className="flex-1 md:flex-none bg-[#32dd9e] hover:bg-[#32dd9e]/90 text-white font-black uppercase italic px-4 md:px-10 h-12 md:h-16 rounded-[1.5rem] shadow-[0_4px_0_#1d8a62] md:shadow-[0_8px_0_#1d8a62] active:shadow-none active:translate-y-[4px] md:active:translate-y-[8px] transition-all border border-black/10 flex items-center justify-center gap-2 md:gap-4 text-xs md:text-xl">
                        <UserCheck className="w-5 h-5 md:w-6 md:h-6" />
                        Settle
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-2xl w-12 h-12 md:w-16 md:h-16 transition-all flex items-center justify-center">
                                <MoreVertical className="w-5 h-5 md:w-8 md:h-8" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-white border-gray-100 shadow-xl rounded-xl p-2">
                            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                <DialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="gap-2 text-blue-600 focus:text-blue-700 cursor-pointer text-xs font-bold uppercase tracking-widest py-3 hover:bg-blue-50 rounded-lg mb-1"
                                    >
                                        <Pencil className="w-4 h-4" /> Edit Group
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent className="bg-white rounded-3xl p-8">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-black">Edit Group</DialogTitle>
                                    </DialogHeader>

                                    <div className="py-2 space-y-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Users className="w-4 h-4 text-[#32dd9e]" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add New Member</span>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider pl-1">Name</label>
                                                    <Input
                                                        value={newMemberName}
                                                        onChange={(e) => setNewMemberName(e.target.value)}
                                                        placeholder="Enter name"
                                                        className="bg-white border-gray-200 text-sm font-bold h-11"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email (Optional)</label>
                                                    <Input
                                                        value={newMemberEmail}
                                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                                        placeholder="Enter email"
                                                        className="bg-white border-gray-200 text-sm font-bold h-11"
                                                    />
                                                </div>
                                                <Button
                                                    onClick={async () => {
                                                        if (!newMemberName.trim()) {
                                                            toast.error("Please enter a name");
                                                            return;
                                                        }
                                                        try {
                                                            const memberToAdd: { name: string; email?: string } = {
                                                                name: newMemberName.trim(),
                                                            };
                                                            if (newMemberEmail.trim()) {
                                                                memberToAdd.email = newMemberEmail.trim();
                                                            }

                                                            await addUserToGroup(group.id, memberToAdd);
                                                            toast.success(`${newMemberName} added to group!`);
                                                            setNewMemberName("");
                                                            setNewMemberEmail("");
                                                            setIsEditOpen(false);
                                                        } catch (error) {
                                                            console.error("Add member error:", error);
                                                            toast.error("Failed to add member");
                                                        }
                                                    }}
                                                    className="w-full bg-black text-white font-bold uppercase tracking-widest hover:bg-[#32dd9e] h-12 rounded-xl mt-2"
                                                >
                                                    Add Member
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Only 'Add Member' is allowed currently</span>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="gap-2 text-red-600 focus:text-red-700 cursor-pointer text-xs font-bold uppercase tracking-widest py-3 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete Group
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent className="bg-white rounded-3xl p-8">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-red-600">Delete Group?</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4 text-gray-500 font-medium">
                                        Are you sure you want to delete <span className="font-bold text-black">{group.name}</span>?
                                        <br /><br />
                                        {isGroupSettled ? (
                                            <span>This will permanently remove the group and all associated expenses. A record of this deletion will be saved in Activities.</span>
                                        ) : (
                                            <span className="text-red-500 font-bold">Warning: You have unsettled debts in this group! It is recommended to settle up before deleting.</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-4">
                                        <DialogClose asChild>
                                            <Button variant="outline" className="flex-1 rounded-xl font-bold uppercase h-12">Cancel</Button>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <Button onClick={handleDeleteGroup} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase h-12">Delete</Button>
                                        </DialogClose>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* 3. Footer Stats (Mini Card) */}
            {expenses.length > 0 && (
                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
                    <LiquidGlassCard draggable={false} className="bg-white/90 rounded-3xl p-4 md:p-6 flex flex-col justify-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 relative z-30">Total Group Spending</span>
                        <span className="text-3xl md:text-4xl font-black text-black italic relative z-30">₹{totalSpending.toLocaleString()}</span>

                        {/* Settlements List */}
                        {debts.length > 0 && (
                            <div className="w-full mt-6 pt-4 border-t border-gray-100 relative z-30">
                                <div className="flex items-center gap-2 mb-3">
                                    <Wallet className="w-3 h-3 text-[#32dd9e]" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Settlement Plan</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {debts.map((debt, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white/60 p-3 rounded-xl border border-white shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
                                                    {debt.from.charAt(0)}
                                                </div>
                                                <span className="text-[10px] text-gray-600 font-medium">
                                                    <span className="font-bold text-black">{debt.from}</span> pay <span className="font-bold text-black">{debt.to}</span>
                                                </span>
                                            </div>
                                            <span className="text-xs font-black text-[#32dd9e]">₹{debt.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </LiquidGlassCard>

                    <GroupStatsChart data={chartData} totalSpending={totalSpending} />

                    <LiquidGlassCard draggable={false} className={cn(
                        "rounded-3xl p-4 md:p-6 flex flex-col justify-between relative overflow-hidden bg-white/90",
                        myNetBalance >= 0 ? "border-[#32dd9e]/30" : "border-[#ff6d2f]/30"
                    )}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 z-0">
                            {myNetBalance >= 0 ? <Wallet className="w-16 h-16 text-[#32dd9e]" /> : <History className="w-16 h-16 text-[#ff6d2f]" />}
                        </div>

                        <div className="space-y-3 relative z-30">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-700">You Paid</span>
                                <span className="text-sm font-bold text-black">₹{myTotalPaid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-700">Your Share (Usage)</span>
                                <span className="text-sm font-bold text-gray-500">₹{myTotalShare.toLocaleString()}</span>
                            </div>

                            {/* Breakdown List */}
                            <div className="pt-2 flex flex-col gap-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                                {memberBalances.map(m => (
                                    <div key={m.name} className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-gray-600 truncate max-w-[80px]">{m.name}</span>
                                        <span className={cn("font-bold", m.bal > 0 ? "text-[#32dd9e]" : "text-[#ff6d2f]")}>
                                            {m.bal > 0 ? "+" : "-"}₹{Math.abs(m.bal).toFixed(0)}
                                        </span>
                                    </div>
                                ))}
                                {memberBalances.length === 0 && myNetBalance !== 0 && (
                                    <span className="text-[9px] text-gray-300 italic">Settled via 3rd parties</span>
                                )}
                            </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-50 relative z-30">
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest block mb-1 values-center",
                                myNetBalance >= 0 ? "text-[#32dd9e]" : "text-[#ff6d2f]"
                            )}>Net Balance</span>
                            <div className="flex items-baseline gap-2">
                                <span className={cn(
                                    "text-3xl font-black italic",
                                    myNetBalance >= 0 ? "text-[#32dd9e]" : "text-[#ff6d2f]"
                                )}>
                                    {myNetBalance >= 0 ? "+" : "-"}₹{Math.abs(myNetBalance).toLocaleString()}
                                </span>
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-wider",
                                    myNetBalance >= 0 ? "text-[#32dd9e]/70" : "text-[#ff6d2f]/70"
                                )}>
                                    {myNetBalance >= 0 ? "You are owed" : "You owe"}
                                </span>
                            </div>
                        </div>
                    </LiquidGlassCard>
                </div>
            )}



            {/* 4. Bar Chart Section */}
            {expenses.length > 0 && (
                <div className="mb-10 space-y-8">
                    <GroupSpendingBarChart data={chartData} totalSpending={totalSpending} />

                    {/* Suggested Settlements - NEW FEATURE asked by user (Smart Debt) */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                            <LayoutList className="w-3 h-3" /> Smart Settlement Plan
                        </div>
                        <div className="space-y-3">
                            {(() => {
                                const debts = calculateSmartDebts(expenses, userName);
                                if (debts.length === 0) return <div className="text-xs text-gray-400 italic">All debts are settled!</div>;

                                return debts.map((debt, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-700">{debt.from === userName ? "You" : debt.from}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">pays</span>
                                            <span className="font-bold text-gray-700">{debt.to === userName ? "You" : debt.to}</span>
                                        </div>
                                        <span className="font-black text-black">₹{debt.amount}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Content Section */}
            {expenses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-1000">
                    <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#ff6d2f]/10 blur-[80px] rounded-full group-hover:bg-[#ff6d2f]/20 transition-all duration-1000" />
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#32dd9e]/5 blur-[80px] rounded-full group-hover:bg-[#32dd9e]/15 transition-all duration-1000" />

                        <div className="flex flex-col text-center md:text-left relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-black italic tracking-tighter uppercase leading-none">The group has not<br />recorded any bills yet</h2>
                            <p className="text-gray-400 text-sm md:text-lg font-bold uppercase tracking-widest mt-6 max-w-md">
                                Be the first to add an expense and start splitting with the gang!
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/90 mb-4 px-4 flex items-center gap-4">
                        <History size={12} />
                        Recent Group Activity
                    </div>
                    {expenses.map((expense, idx) => (
                        <div key={expense.id}
                            onClick={() => setSelectedExpenseId(expense.id)}
                            className="bg-white border border-gray-100 hover:border-[#32dd9e]/30 hover:shadow-lg rounded-3xl p-6 transition-all group flex items-center justify-between cursor-pointer"
                            style={{ animationDelay: `${idx * 100} ms` }}
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







            {/* Expense Details Dialog */}
            <ExpenseDetailsDialog
                expenseId={selectedExpenseId}
                isOpen={!!selectedExpenseId}
                onClose={() => setSelectedExpenseId(null)}
                userName={userName}
            />

            {/* Settle Up Selection Dialog (Simple Implementation) */}
            <Dialog open={isSelectionOpen} onOpenChange={setIsSelectionOpen}>
                <DialogContent className="bg-white rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Who to settle with?</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-4 max-h-[60vh] overflow-y-auto">
                        {group.members.filter(m => m.name !== userName && m.name !== "You").map((member) => {
                            const bal = getFriendBalance(member.name);
                            if (Math.abs(bal) < 1) return null; // Hide already settled
                            return (
                                <div key={member.name} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{member.name}</span>
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", bal > 0 ? "text-[#32dd9e]" : "text-[#ff6d2f]")}>
                                            {bal > 0 ? "owes you" : "you owe"} ₹{Math.abs(bal).toLocaleString()}
                                        </span>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setSettleMember({ name: member.name, email: member.email, balance: bal });
                                            setIsSelectionOpen(false);
                                        }}
                                        size="sm"
                                        className="bg-black text-white rounded-xl font-bold uppercase tracking-wider text-xs"
                                    >
                                        Settle
                                    </Button>
                                </div>
                            );
                        })}
                        {group.members.filter(m => Math.abs(getFriendBalance(m.name)) >= 1 && m.name !== userName).length === 0 && (
                            <div className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">
                                No outstanding balances
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {
                settleMember && (
                    <SettleUpModal
                        isOpen={!!settleMember}
                        onClose={() => setSettleMember(null)}
                        friendName={settleMember.name}
                        friendEmail={settleMember.email}
                        balance={settleMember.balance}
                        userName={userName}
                        groupId={group.id}
                    />
                )
            }
        </div >
    );
}
