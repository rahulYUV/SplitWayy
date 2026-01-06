import { useState } from "react";
import { motion } from "framer-motion";
import { Receipt, ArrowRight } from "lucide-react";
import CurrencyRupeeIcon from "@/components/ui/icons/currency-rupee-icon";
import { Breadcrumbs } from "./Breadcrumbs";
import { useExpenses, Expense } from "@/context/ExpenseContext";
import { formatDistanceToNow } from "date-fns";
import { ExpenseDetailsDialog } from "./ExpenseDetailsDialog";

export function RecentActivity({ userName }: { userName: string }) {
    const { expenses } = useExpenses();
    const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

    // Derived state for reactivity


    // Limit to most recent 15 activities
    const recentExpenses = expenses.slice(0, 15);

    const handleCardClick = (expense: Expense) => {
        setSelectedExpenseId(expense.id);
    };

    return (
        <div className="flex-1 flex flex-col p-8 w-full overflow-y-auto custom-scrollbar">
            <div className="px-2 py-6 border-b border-gray-100 w-full mb-8">
                <Breadcrumbs userName={userName} currentPage="RECENT ACTIVITY" />
            </div>

            <div className="flex flex-col gap-4">
                {recentExpenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <Receipt size={64} className="text-gray-300 mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] italic text-xs">No recent activity found</p>
                    </div>
                ) : (
                    recentExpenses.map((item, i) => (
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

            {/* Expense Details Modal */}
            <ExpenseDetailsDialog
                expenseId={selectedExpenseId}
                isOpen={!!selectedExpenseId}
                onClose={() => setSelectedExpenseId(null)}
                userName={userName}
            />
        </div >
    );
}
