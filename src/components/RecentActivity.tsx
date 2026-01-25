import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ArrowRight, Filter, Users, User as UserIcon, Banknote, HeartHandshake, Trash2, Edit } from "lucide-react";
import CurrencyRupeeIcon from "@/components/ui/icons/currency-rupee-icon";
import transactionIcon from "@/assets/images/transaction.svg";
import { Breadcrumbs } from "./Breadcrumbs";
import { useExpenses, Expense } from "@/context/ExpenseContext";
import { formatDistanceToNow, format } from "date-fns";
import { ExpenseDetailsDialog } from "./ExpenseDetailsDialog";
import { cn } from "@/lib/utils";
import { User } from "firebase/auth";
import { subscribeToActivities, Activity } from "@/services/activityService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function RecentActivity({ userName, user }: { userName: string; user: User }) {
    const { expenses } = useExpenses();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [filter, setFilter] = useState<'all' | 'groups' | 'friends' | 'payments'>('all');

    useEffect(() => {
        // Subscribe to activities with user context for privacy
        const unsubscribe = subscribeToActivities(user.uid, user.email, (data) => {
            setActivities(data);
        });
        return () => unsubscribe();
    }, [user.uid, user.email]);

    // Merge and Filter Logic
    const combinedItems = useMemo(() => {
        // 1. Transform Expenses to common shape or keep separate?
        // Let's create a unified list.
        type UnifiedItem = {
            id: string;
            date: Date;
            type: 'expense' | 'activity';
            data: Expense | Activity;
        };

        const expenseItems: UnifiedItem[] = expenses.map(e => ({
            id: e.id,
            date: e.date instanceof Date ? e.date : new Date(e.date),
            type: 'expense',
            data: e
        }));

        const activityItems: UnifiedItem[] = activities
            // REMOVED FILTER: Now we allow ALL activity types to pass through
            .map(a => ({
                id: a.id,
                date: a.createdAt,
                type: 'activity',
                data: a
            }));

        const all = [...expenseItems, ...activityItems].sort((a, b) => b.date.getTime() - a.date.getTime());

        // Track IDs of active expenses to avoid duplicates
        const activeExpenseIds = new Set(expenses.map(e => e.id));

        return all.filter(item => {
            if (item.type === 'expense') {
                const e = item.data as Expense;
                // ... (Existing expense filters) ...
                if (filter === 'all') return true;
                if (filter === 'groups') return e.groupId !== null && e.groupId !== undefined;
                if (filter === 'friends') return !e.groupId && e.category !== 'Payment';
                if (filter === 'payments') return e.category === 'Payment';
            } else {
                // Activity Logic
                const act = item.data as Activity;

                // INTELLIGENT DISPLAY LOGIC:
                // 1. Always show 'delete', 'update', 'settle_up', 'create_group' events.
                // 2. For 'add_expense':
                //    - If the expense still exists (isActive), HIDE this log (show the interactive Expense Card instead).
                //    - If the expense is GONE (deleted), SHOW this log so we have history.

                if (act.type === 'add_expense' && act.expenseId && activeExpenseIds.has(act.expenseId)) {
                    return false; // Hide log, show real card
                }

                // Show group activities in 'groups' or 'all'
                if (filter === 'all' || filter === 'groups') return true;
                // Show other activities if they match current context (could refine further)
                return false;
            }
            return true;
        });

    }, [expenses, activities, filter]);

    // Limit to most recent 20
    const recentItems = combinedItems.slice(0, 20);

    const handleCardClick = (item: { type: 'expense' | 'activity', data: any }) => {
        if (item.type === 'expense') {
            setSelectedExpenseId(item.data.id);
        } else {
            setSelectedActivity(item.data);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-8 w-full overflow-y-auto custom-scrollbar">
            <div className="px-2 py-6 border-b border-gray-100 w-full mb-8">
                <Breadcrumbs currentPage="RECENT ACTIVITY" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <button
                    onClick={() => setFilter('all')}
                    className={cn(
                        "h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                        filter === 'all' ? "bg-black text-white shadow-lg scale-105" : "bg-white border border-gray-100 text-gray-400 hover:text-gray-900"
                    )}
                >
                    <Filter size={14} />
                    You
                </button>
                <button
                    onClick={() => setFilter('groups')}
                    className={cn(
                        "h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                        filter === 'groups' ? "bg-[#3395ff] text-white shadow-lg scale-105" : "bg-white border border-gray-100 text-gray-400 hover:text-[#3395ff]"
                    )}
                >
                    <Users size={14} />
                    Groups
                </button>
                <button
                    onClick={() => setFilter('friends')}
                    className={cn(
                        "h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                        filter === 'friends' ? "bg-[#ff6d2f] text-white shadow-lg scale-105" : "bg-white border border-gray-100 text-gray-400 hover:text-[#ff6d2f]"
                    )}
                >
                    <UserIcon size={14} />
                    Friends
                </button>
                <button
                    onClick={() => setFilter('payments')}
                    className={cn(
                        "h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                        filter === 'payments' ? "bg-[#32dd9e] text-white shadow-lg scale-105" : "bg-white border border-gray-100 text-gray-400 hover:text-[#32dd9e]"
                    )}
                >
                    <Banknote size={14} />
                    Payments
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {recentItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <Receipt size={64} className="text-gray-300 mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] italic text-xs">No activity found</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {recentItems.map((item, i) => {
                            if (item.type === 'expense') {
                                const expense = item.data as Expense;
                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.03 }}
                                        key={expense.id}
                                        onClick={() => handleCardClick(item)}
                                        className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between hover:shadow-lg hover:border-[#32dd9e]/50 hover:scale-[1.01] transition-all cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className={cn(
                                            "absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity",
                                            expense.category === 'Payment' ? "bg-[#32dd9e]" : "bg-black"
                                        )} />

                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                                expense.category === 'Payment'
                                                    ? "bg-[#32dd9e]/10 text-[#32dd9e]"
                                                    : "bg-gray-50 text-gray-500 group-hover:bg-black/5 group-hover:text-black"
                                            )}>
                                                {expense.category === 'Payment' ? <HeartHandshake className="w-6 h-6" /> : <img src={transactionIcon} className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" alt="Transaction" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-bold uppercase text-sm tracking-tight group-hover:text-black transition-colors flex items-center gap-2">
                                                    {expense.description}
                                                    {expense.groupId && (
                                                        <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[#3395ff] text-[9px] font-black uppercase tracking-wider">Group</span>
                                                    )}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {expense.category && expense.category !== 'Other' && (
                                                        <span className="text-[9px] font-black uppercase text-white bg-black/20 px-1.5 rounded-md">{expense.category}</span>
                                                    )}
                                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                                        <span className={expense.paidBy === "you" || expense.paidBy === userName ? "text-[#32dd9e]" : "text-gray-500"}>
                                                            {expense.paidBy === "you" || expense.paidBy === userName ? "You" : expense.paidBy} paid
                                                        </span>
                                                        {" • "}
                                                        {formatDistanceToNow(new Date(expense.date), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-end">
                                                <span className={expense.paidBy === "you" || expense.paidBy === userName ? "text-[#32dd9e]" : "text-gray-400"}>
                                                    {expense.paidBy === "you" || expense.paidBy === userName ? "you lent" : "you borrowed"}
                                                </span>
                                                <span className={`text-xl font-black tracking-tighter flex items-center gap-0.5 ${expense.paidBy === "you" || expense.paidBy === userName ? "text-[#32dd9e]" : "text-red-400"
                                                    }`}>
                                                    <CurrencyRupeeIcon size={16} />
                                                    {expense.amount.toLocaleString()}
                                                </span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
                                        </div>
                                    </motion.div>
                                );
                            } else {
                                // Render Activity Item
                                const activity = item.data as Activity;
                                const isDelete = activity.type.includes('delete');
                                // const isUpdate = activity.type === 'update_expense';

                                const bgClass = isDelete ? "bg-red-50/50 border border-red-100 hover:border-red-200" : "bg-blue-50/50 border border-blue-100 hover:border-blue-200";
                                const barColor = isDelete ? "bg-red-500" : "bg-blue-500";
                                const iconBg = isDelete ? "bg-red-100 text-red-500 group-hover:bg-red-200" : "bg-blue-100 text-blue-500 group-hover:bg-blue-200";
                                const pillStyle = isDelete ? "border-red-100 text-red-400" : "border-blue-100 text-blue-400";

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.03 }}
                                        key={activity.id}
                                        onClick={() => handleCardClick(item)}
                                        className={cn(
                                            "p-5 rounded-2xl flex items-center justify-between hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden",
                                            bgClass
                                        )}
                                    >
                                        <div className={cn("absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity", barColor)} />
                                        <div className="flex items-center gap-5">
                                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", iconBg)}>
                                                {isDelete ? <Trash2 className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-bold uppercase text-sm tracking-tight group-hover:text-black transition-colors">
                                                    {activity.description}
                                                </span>
                                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                                    {activity.createdBy === userName ? "You" : activity.createdBy}
                                                    {isDelete
                                                        ? (activity.type === 'delete_group' ? " deleted this group" : " deleted an expense")
                                                        : (activity.type === 'create_group' ? " created this group" :
                                                            activity.type === 'add_expense' ? " added this expense" :
                                                                " updated this expense")
                                                    }
                                                    • {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className={cn("px-3 py-1 rounded-full bg-white border text-[10px] font-black uppercase tracking-widest", pillStyle)}>
                                                Details
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            }
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Expense Details Modal */}
            <ExpenseDetailsDialog
                expenseId={selectedExpenseId}
                isOpen={!!selectedExpenseId}
                onClose={() => setSelectedExpenseId(null)}
                userName={userName}
            />

            {/* Activity Details Dialog (Deleted Group) */}
            <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
                <DialogContent className="bg-white rounded-3xl p-8 max-w-md">
                    <DialogHeader>
                        <DialogTitle className={cn("text-2xl font-black uppercase italic tracking-tighter mb-2", selectedActivity?.type.includes('delete') ? "text-red-500" : "text-blue-500")}>
                            {selectedActivity?.type === 'delete_group' ? "Group Deleted" :
                                selectedActivity?.type === 'delete_expense' ? "Expense Deleted" :
                                    selectedActivity?.type === 'update_expense' ? "Expense Updated" : "Activity Details"}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedActivity && selectedActivity.type === 'delete_group' && selectedActivity.details && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Group Name</span>
                                <span className="text-xl font-bold text-black">{selectedActivity.details.groupName}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Created On</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {selectedActivity.details.createdAt ? format(selectedActivity.details.createdAt, "MMM dd, yyyy") : "N/A"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Deleted On</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {selectedActivity.details.deletedAt ? format(selectedActivity.details.deletedAt, "MMM dd, yyyy") : "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Participants</span>
                                <div className="flex flex-wrap gap-2">
                                    {selectedActivity.details.participants?.map(p => (
                                        <span key={p} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-xs font-bold text-gray-600">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 pt-4 border-t border-gray-100">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Action By</span>
                                <span className="text-sm font-bold text-gray-900">{selectedActivity.createdBy === userName ? "You" : selectedActivity.createdBy}</span>
                            </div>
                        </div>
                    )}
                    {selectedActivity && selectedActivity.type === 'delete_expense' && selectedActivity.details && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Expense Description</span>
                                <span className="text-xl font-bold text-black">{selectedActivity.description.replace('Deleted expense: ', '')}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</span>
                                    <span className="text-2xl font-black text-red-500">₹{selectedActivity.details.amount?.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Group</span>
                                    <span className="text-sm font-bold text-gray-900 italic">{selectedActivity.details.groupName || 'No Group'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Original Date</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {selectedActivity.details.date ? format(selectedActivity.details.date, "MMM dd, yyyy") : "N/A"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Deleted On</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {selectedActivity.details.deletedAt ? format(selectedActivity.details.deletedAt, "MMM dd, yyyy") : "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Paid By</span>
                                <span className="text-sm font-bold text-gray-900">{selectedActivity.details.paidBy === userName ? "You" : selectedActivity.details.paidBy}</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Participants Involved</span>
                                <div className="flex flex-wrap gap-2">
                                    {selectedActivity.details.participants?.map(p => (
                                        <span key={p} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-xs font-bold text-gray-600">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 pt-4 border-t border-gray-100">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Deleted By</span>
                                <span className="text-sm font-bold text-gray-900">{selectedActivity.createdBy === userName ? "You" : selectedActivity.createdBy}</span>
                            </div>
                        </div>
                    )}
                    {selectedActivity && selectedActivity.type === 'update_expense' && selectedActivity.details && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</span>
                                <span className="text-xl font-bold text-black">{selectedActivity.description.replace("Updated: ", "")}</span>
                            </div>

                            <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Changes Log</span>
                                {selectedActivity.details.changes?.length ? (
                                    selectedActivity.details.changes.map((change, idx) => (
                                        <div key={idx} className="flex flex-col gap-1 border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                                            <span className="text-xs font-bold text-gray-600 uppercase">{change.field}</span>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-red-400 line-through decoration-red-400/50">{String(change.oldValue)}</span>
                                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                                <span className="text-green-600 font-black">{String(change.newValue)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-500 italic">No specific field changes recorded.</span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Updated On</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {format(selectedActivity.createdAt, "MMM dd, yyyy • hh:mm a")}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Updated By</span>
                                    <span className="text-sm font-bold text-gray-900">{selectedActivity.createdBy === userName ? "You" : selectedActivity.createdBy}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {selectedActivity && selectedActivity.type === 'add_expense' && selectedActivity.details && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Expense Description</span>
                                <span className="text-xl font-bold text-black">{selectedActivity.description.replace('Added expense: ', '')}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</span>
                                    <span className="text-2xl font-black text-green-500">₹{selectedActivity.details.amount?.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Group</span>
                                    <span className="text-sm font-bold text-gray-900 italic">{selectedActivity.details.groupName || 'No Group'}</span>
                                </div>
                            </div>

                            {/* Same details as normal expense */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Original Date</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {selectedActivity.details.date ? format(selectedActivity.details.date, "MMM dd, yyyy") : "N/A"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Created On</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {selectedActivity.createdAt ? format(selectedActivity.createdAt, "MMM dd, yyyy") : "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Paid By</span>
                                <span className="text-sm font-bold text-gray-900">{selectedActivity.details.paidBy === userName ? "You" : selectedActivity.details.paidBy}</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Participants Involved</span>
                                <div className="flex flex-wrap gap-2">
                                    {selectedActivity.details.participants?.map(p => (
                                        <span key={p} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-xs font-bold text-gray-600">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="mt-4">
                        <DialogClose asChild>
                            <Button className="w-full bg-gray-100 hover:bg-gray-200 text-black font-bold uppercase rounded-xl h-12">Close</Button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
