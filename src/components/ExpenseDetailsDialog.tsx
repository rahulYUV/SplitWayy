import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/context/ExpenseContext";
import { format } from "date-fns";
import { Calendar, User, Trash2, Edit } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { AddExpenseModal } from "./AddExpenseModal"; // Re-use for edit? Or just separate logic
// Actually AddExpenseModal usually handles 'mode="edit"'. 
// I'll assume AddExpenseModal can accept 'expenseId' or 'initialData'. 
// Previous analysis of AddExpenseModal showed it takes 'groupId'. 
// I'll stick to displaying details and Delete button for now, maybe Edit if easy.

export function ExpenseDetailsDialog({
    expenseId,
    isOpen,
    onClose,
    userName
}: {
    expenseId: string | null;
    isOpen: boolean;
    onClose: () => void;
    userName: string;
}) {
    const { expenses, removeExpense } = useExpenses();
    const [isEditing, setIsEditing] = useState(false);

    if (!expenseId) return null;

    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return null;

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this expense?")) {
            await removeExpense(expense.id);
            onClose();
        }
    };

    return (<>
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-3xl p-0 overflow-hidden border-orange-100">
                <div className="bg-[#ff6d2f] p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-start justify-between gap-4 z-10">
                            {expense.description}
                            <div className="flex gap-2 mr-10">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white border-0"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-white/20 hover:bg-red-500 text-white border-0"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </DialogTitle>
                        <div className="text-4xl font-black mt-2 z-10">₹{expense.amount.toLocaleString()}</div>
                        <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest mt-2 z-10">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(expense.date), "MMMM dd, yyyy")}
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400">
                            <User className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Paid By</span>
                            <span className="text-lg font-bold text-gray-900">{expense.paidBy}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Split Details ({expense.splitMethod})</span>
                        <ScrollArea className="h-[120px] pr-4">
                            <div className="space-y-2">
                                {expense.participants.map(person => {
                                    // Calculate share logic
                                    let share = 0;
                                    if (expense.splitMethod === "equally") {
                                        share = expense.amount / expense.participants.length;
                                    } else if (expense.splitDetails && expense.splitDetails[person]) {
                                        const val = Number(expense.splitDetails[person]);
                                        if (expense.splitMethod === "percentage") {
                                            share = (expense.amount * val) / 100;
                                        } else {
                                            share = val;
                                        }
                                    }

                                    return (
                                        <div key={person} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 font-medium">{person}</span>
                                            <span className="font-bold text-gray-900">₹{share.toFixed(2)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>

                    {expense.billImageUrl && (
                        <div className="pt-4 border-t border-gray-100">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Bill Receipt</span>
                            <div className="rounded-2xl overflow-hidden border border-gray-200">
                                <img src={expense.billImageUrl} alt="Bill" className="w-full h-auto max-h-[200px] object-cover" />
                            </div>
                            <Button variant="link" className="text-xs mt-1 h-auto p-0 text-blue-500" onClick={() => window.open(expense.billImageUrl!, "_blank")}>
                                View Full Image
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-0">
                    <Button onClick={onClose} className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 font-bold rounded-xl h-12">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {
            isEditing && (
                <AddExpenseModal
                    open={isEditing}
                    onOpenChange={setIsEditing}
                    mode="edit"
                    initialData={expense}
                    groupId={expense.groupId || undefined}
                    userName={userName}
                />
            )
        }
    </>);
}
