import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/context/ExpenseContext";
import { format } from "date-fns";
import { Calendar, User, Trash2, Edit, MessageSquare, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AddExpenseModal } from "./AddExpenseModal";
import { addCommentToExpense, Comment } from "@/services/expenseService";
import { subscribeToExpenseActivities, Activity } from "@/services/activityService";
import { auth } from "@/lib/firebase"; // To get current user ID
import { toast } from "sonner";
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
    const [tab, setTab] = useState<"details" | "history" | "comments">("details");
    const [activities, setActivities] = useState<Activity[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");

    // Sync comments from expense object when it changes
    const expense = expenses.find(e => e.id === expenseId);

    useEffect(() => {
        if (expense?.comments) {
            // Sort by date desc (newest at bottom for chat feel? usually chat is bottoms up)
            // Let's do newest at bottom.
            const sorted = [...expense.comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setComments(sorted);
        } else {
            setComments([]);
        }
    }, [expense]);

    // Subscribe to history
    useEffect(() => {
        if (!expenseId || !isOpen) return;

        const unsubscribe = subscribeToExpenseActivities(expenseId, (acts) => {
            setActivities(acts);
        });

        return () => unsubscribe();
    }, [expenseId, isOpen]);

    if (!expenseId) return null;
    if (!expense) return null;

    const handleSendComment = async () => {
        if (!newComment.trim()) return;

        try {
            await addCommentToExpense(expense.id, {
                text: newComment,
                userId: auth.currentUser?.uid || "anonymous",
                userName: userName || "User"
            });
            setNewComment("");
        } catch (error) {
            toast.error("Failed to post comment");
        }
    };

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

                <div className="flex items-center gap-4 px-6 border-b border-gray-100">
                    <button
                        onClick={() => setTab("details")}
                        className={`text-xs font-bold uppercase tracking-widest py-4 border-b-2 transition-all ${tab === "details" ? "border-[#ff6d2f] text-[#ff6d2f]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                    >
                        Details
                    </button>
                    <button
                        onClick={() => setTab("history")}
                        className={`text-xs font-bold uppercase tracking-widest py-4 border-b-2 transition-all ${tab === "history" ? "border-[#ff6d2f] text-[#ff6d2f]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                    >
                        History
                    </button>
                    <button
                        onClick={() => setTab("comments")}
                        className={`text-xs font-bold uppercase tracking-widest py-4 border-b-2 transition-all ${tab === "comments" ? "border-[#ff6d2f] text-[#ff6d2f]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                    >
                        Comments ({comments.length})
                    </button>
                </div>

                <div className="p-6 h-[300px] overflow-y-auto custom-scrollbar relative">
                    {tab === "details" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
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
                                <div className="space-y-2">
                                    {expense.participants.map(person => {
                                        let share = 0;
                                        if (expense.splitMethod === "equally") {
                                            if (expense.participants.length > 0) {
                                                share = expense.amount / expense.participants.length;
                                            }
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
                    )}

                    {tab === "history" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            {activities.length === 0 ? (
                                <div className="text-center text-gray-400 text-xs py-10">No edit history found.</div>
                            ) : (
                                activities.map((act) => (
                                    <div key={act.id} className="relative pl-6 pb-6 border-l w-full border-gray-200 last:border-0 last:pb-0">
                                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-300 ring-4 ring-white" />
                                        <div className="flex flex-col gap-1 -mt-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-900">{act.description}</span>
                                                <span className="text-[10px] text-gray-400">{format(act.createdAt, "MMM d, h:mm a")}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-500">by {act.createdBy}</span>

                                            {/* Changes Diff View */}
                                            {act.details?.changes && act.details.changes.length > 0 && (
                                                <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
                                                    {act.details.changes.map((change, idx) => (
                                                        <div key={idx} className="text-xs flex flex-col gap-1">
                                                            <span className="font-bold text-gray-700 uppercase text-[10px]">{change.field}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="line-through text-red-400 opacity-70">{String(change.oldValue)}</span>
                                                                <div className="text-gray-300">→</div>
                                                                <span className="text-green-600 font-bold">{String(change.newValue)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {tab === "comments" && (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                                {comments.length === 0 ? (
                                    <div className="text-center text-gray-400 text-xs py-10 flex flex-col items-center gap-2">
                                        <MessageSquare className="w-8 h-8 opacity-20" />
                                        No comments yet. Start the discussion!
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className={`flex flex-col gap-1 ${comment.userName === userName ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] rounded-lg p-3 text-xs ${comment.userName === userName ? 'bg-[#ff6d2f] text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                                <p>{comment.text}</p>
                                            </div>
                                            <span className="text-[9px] text-gray-400 px-1">
                                                {comment.userName === userName ? "You" : comment.userName} • {format(new Date(comment.createdAt), "h:mm a")}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                                <Input
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Type a comment..."
                                    className="h-10 text-xs rounded-xl bg-gray-50 border-gray-200"
                                    onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                                />
                                <Button size="icon" className="h-10 w-10 shrink-0 bg-black hover:bg-[#32dd9e] rounded-xl transition-colors" onClick={handleSendComment} disabled={!newComment.trim()}>
                                    <Send className="w-4 h-4 text-white" />
                                </Button>
                            </div>
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
