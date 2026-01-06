import { useState } from "react";
import { format } from "date-fns";
import { Receipt, User, Users, FileText, CheckCircle2, Share2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { auth } from "@/lib/firebase";
import { useExpenses } from "@/context/ExpenseContext";
import { deleteExpense } from "@/services/expenseService";
import { shareBillViaEmail } from "@/utils/emailUtils";
import { toast } from "sonner";
import { AddExpenseModal } from "./AddExpenseModal";
import CurrencyRupeeIcon from "@/components/ui/icons/currency-rupee-icon";

interface ExpenseDetailsDialogProps {
    expenseId: string | null;
    isOpen: boolean;
    onClose: () => void;
    userName: string;
}

export function ExpenseDetailsDialog({ expenseId, isOpen, onClose, userName }: ExpenseDetailsDialogProps) {
    const { expenses } = useExpenses();
    const [isEditing, setIsEditing] = useState(false);

    const selectedExpense = expenses.find(e => e.id === expenseId);

    if (!selectedExpense) return null;

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this expense?")) {
            await deleteExpense(selectedExpense.id);
            onClose();
            toast.success("Expense deleted");
        }
    };

    const calculateShare = (amount: number, participants: string[]) => {
        return amount / (participants.length || 1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl [&>button[aria-label=Close]]:hidden">
                <div className="bg-[#32dd9e] p-8 pb-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50" />

                    {/* Share Button */}
                    <button
                        onClick={() => shareBillViaEmail(selectedExpense, userName)}
                        className="absolute top-4 left-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all z-20 group/share"
                        title="Share Bill via Email"
                    >
                        <Share2 className="w-5 h-5 group-hover/share:scale-110 transition-transform" />
                    </button>

                    {/* 3 Dots Menu */}
                    <div className="absolute top-4 right-12 z-20">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px] bg-white border-gray-100 shadow-xl rounded-xl z-[60] p-1.5">
                                <DropdownMenuItem
                                    onClick={() => setIsEditing(true)}
                                    className="gap-3 cursor-pointer text-xs font-bold uppercase tracking-widest py-3 hover:bg-blue-50 text-blue-600 focus:text-blue-700 focus:bg-blue-50 rounded-lg mb-1"
                                >
                                    <div className="p-1 bg-blue-100 rounded-md">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </div>
                                    Edit Expense
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="gap-3 text-red-600 focus:text-red-700 cursor-pointer text-xs font-bold uppercase tracking-widest py-3 hover:bg-red-50 focus:bg-red-50 rounded-lg"
                                >
                                    <div className="p-1 bg-red-100 rounded-md">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </div>
                                    Delete Expense
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Close Button (Custom) */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all z-20"
                    >
                        <span className="sr-only">Close</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>

                    <Receipt className="w-16 h-16 text-white mx-auto mb-4 relative z-10 opacity-90" />
                    <DialogTitle className="text-2xl font-black uppercase text-white tracking-tight relative z-10">
                        {selectedExpense.description}
                    </DialogTitle>
                    <div className="text-4xl font-black text-white mt-2 flex items-center justify-center gap-1 relative z-10">
                        <CurrencyRupeeIcon size={28} color="white" />
                        {selectedExpense.amount.toLocaleString()}
                    </div>
                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-2 relative z-10">
                        Added by {selectedExpense.createdBy === auth.currentUser?.uid ? "You" : selectedExpense.createdBy || "Unknown"} on {format(new Date(selectedExpense.date), "MMM d, yyyy")}
                    </p>

                    {/* ZigZag / Jagged Edge Effect */}
                    <div
                        className="absolute bottom-0 left-0 w-full h-4"
                        style={{
                            background: `linear-gradient(-45deg, white 10px, transparent 10px), linear-gradient(45deg, white 10px, transparent 10px)`,
                            backgroundSize: '20px 20px',
                            backgroundRepeat: 'repeat-x',
                            backgroundPosition: 'left bottom'
                        }}
                    />
                </div>

                <ScrollArea className="max-h-[60vh]">
                    <div className="p-6 space-y-6">
                        {/* Payer Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <User size={14} /> Payer Details
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 border border-gray-200">
                                        <AvatarFallback className="bg-white text-gray-900 text-xs font-bold">
                                            {selectedExpense.paidBy.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-gray-900">
                                        {selectedExpense.paidBy === "you" || selectedExpense.paidBy === userName ? "You" : selectedExpense.paidBy} paid
                                    </span>
                                </div>
                                <span className="font-bold text-gray-900 flex items-center">
                                    <CurrencyRupeeIcon size={12} className="text-gray-400 mr-0.5" />
                                    {selectedExpense.amount.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Split Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <Users size={14} /> Split with {selectedExpense.participants.map(p => p === "you" || p === userName || (p.toLowerCase() === auth.currentUser?.displayName?.toLowerCase()) ? "You" : p).join(", ")}
                            </div>
                            <div className="space-y-2">
                                {selectedExpense.participants.map((person, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 border border-gray-100">
                                                <AvatarFallback className="bg-gray-100 text-gray-600 text-[10px] font-bold">
                                                    {person.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {person === "you" || person === userName || (person.toLowerCase() === auth.currentUser?.displayName?.toLowerCase()) ? "You" : person}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium">owes</span>
                                            </div>
                                        </div>
                                        <span className="font-bold text-gray-900 flex items-center">
                                            <CurrencyRupeeIcon size={12} className="text-gray-400 mr-0.5" />
                                            {calculateShare(selectedExpense.amount, selectedExpense.participants).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Calculated Info / Summary */}
                        {(selectedExpense.paidBy === userName || selectedExpense.paidBy === "you") && (
                            <div className="bg-[#32dd9e]/10 p-4 rounded-xl border border-[#32dd9e]/20 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-[#32dd9e] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[#32dd9e] font-bold text-sm">You paid for this</p>
                                    <p className="text-[#32dd9e]/80 text-xs mt-1">
                                        You are owed <span className="font-black">₹{(selectedExpense.amount - calculateShare(selectedExpense.amount, selectedExpense.participants)).toFixed(2)}</span> total.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Bill Image */}
                        {selectedExpense.billImageUrl && (
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    <FileText size={14} /> Attached Bill
                                </div>
                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                    <img
                                        src={selectedExpense.billImageUrl}
                                        alt="Bill Receipt"
                                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                                        onClick={() => window.open(selectedExpense.billImageUrl, '_blank')}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                    <p className="text-[10px] text-gray-400 text-center w-full">
                        Expense ID: <span className="font-mono text-gray-300">{selectedExpense.id}</span>
                    </p>
                </DialogFooter>

            </DialogContent>

            {/* Edit Modal (Controlled) */}
            <AddExpenseModal
                mode="edit"
                initialData={selectedExpense}
                open={isEditing}
                onOpenChange={setIsEditing}
                groupId={selectedExpense.groupId}
                userName={userName}
            />
        </Dialog>
    );
}
