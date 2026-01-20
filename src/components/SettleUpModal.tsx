import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, CreditCard, Banknote, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useExpenses } from "@/context/ExpenseContext";
import { toast } from "sonner";
import CurrencyRupeeIcon from "./ui/icons/currency-rupee-icon";
import { sendSettlementNotification } from "@/services/emailService";

interface SettleUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    friendName: string; // The person we are settling with
    friendEmail?: string; // Friend's email for notifications
    balance: number; // Positive: They owe me. Negative: I owe them.
    userName: string; // Current user
    groupId?: string; // Optional: Link settlement to a group
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function SettleUpModal({ isOpen, onClose, friendName, friendEmail, balance, userName, groupId }: SettleUpModalProps) {
    // Determine mode based on balance
    // If balance > 0 (They owe me), mode is 'take' (receiving money)
    // If balance < 0 (I owe them), mode is 'give' (paying money)
    const mode = balance >= 0 ? "take" : "give";

    // Amount is always positive absolute value, not editable
    const amount = Math.abs(balance).toFixed(3);

    // Notes state
    const [date, setDate] = useState(new Date());
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [qrImage, setQrImage] = useState<string | null>(null);

    const { addExpense } = useExpenses();

    const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload a valid image file");
                return;
            }
            const url = URL.createObjectURL(file);
            setQrImage(url);
        }
    };

    const handleSettle = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setIsLoading(true);

        try {
            await recordPayment(numAmount, "cash");
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
            setIsLoading(false);
        }
    };

    const recordPayment = async (val: number, paymentType: "cash" | "online") => {
        try {
            let paidBy = "";
            let splitDetails = {};

            if (mode === "give") {
                // I am paying Friend
                paidBy = userName || "You";
                splitDetails = {
                    [userName || "You"]: "0",
                    [friendName]: "100"
                };
            } else {
                // Friend is paying Me
                paidBy = friendName;
                splitDetails = {
                    [userName || "You"]: "100",
                    [friendName]: "0"
                };
            }

            await addExpense({
                groupId: groupId || null, // Attach group ID if provided
                description: "Settlement",
                amount: val,
                date: date,
                paidBy: paidBy,
                participants: [friendName, userName || "You"], // Include both explicitly
                splitMethod: "percentage",
                splitDetails: splitDetails,
                category: "Payment",
                notes: notes,
            });

            toast.success(`Settled ₹${val} with ${friendName}`);

            // Send email notification to the friend
            if (friendEmail) {
                // Send notification asynchronously, don't wait for it
                sendSettlementNotification(
                    friendEmail,
                    friendName,
                    userName || "You",
                    val,
                    paymentType,
                    date,
                    notes
                ).catch(error => {
                    console.error('Failed to send settlement email:', error);
                    // Don't show error toast to avoid disrupting UX
                });
            }

            onClose();
            setQrImage(null); // Reset QR
        } catch (e) {
            console.error(e);
            toast.error("Failed to record settlement");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-3xl overflow-hidden border-0 p-0 gap-0">
                <DialogHeader className="bg-[#32dd9e] p-6 text-white pb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        {/* Decorative Icon */}
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter z-10 text-center">
                        Settle Up
                    </DialogTitle>
                    {/* Visual Flow */}
                    <div className="flex items-center justify-center gap-4 mt-6 z-10">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                <span className="font-bold text-white text-xs">{mode === "give" ? "YOU" : friendName.charAt(0)}</span>
                            </div>
                        </div>
                        <ArrowRight className="text-white/80 animate-pulse" />
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                <span className="font-bold text-white text-xs">{mode === "give" ? friendName.charAt(0) : "YOU"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Single Mode Display */}
                    <div className="absolute bottom-0 left-0 w-full flex">
                        <div
                            className={cn(
                                "flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors bg-white text-[#32dd9e]"
                            )}
                        >
                            {mode === "give" ? `Pay ${friendName}` : `Receive from ${friendName}`}
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 flex flex-col gap-6">

                    {/* Amount Input */}
                    <div className="flex flex-col items-center justify-center gap-2 pt-4">
                        <Label className="uppercase text-[10px] tracking-[0.2em] text-gray-400 font-bold">Total Amount</Label>
                        <div className="flex items-center justify-center">
                            <CurrencyRupeeIcon className="text-gray-900 w-8 h-8" />
                            <Input
                                type="text"
                                readOnly
                                value={amount}
                                className="text-5xl font-black text-center border-none shadow-none focus-visible:ring-0 p-0 h-auto w-40 placeholder:text-gray-200 cursor-default bg-transparent"
                            />
                        </div>
                    </div>

                    {mode === "take" && (
                        <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center gap-4 text-center border border-dashed border-gray-200 relative overflow-hidden group">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest relative z-10">Show Your QR to {friendName}</span>

                            {qrImage ? (
                                <div className="relative">
                                    <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm relative z-10">
                                        <img src={qrImage} alt="QR Code" className="w-40 h-40 object-contain" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 z-20">
                                        <label htmlFor="qr-upload-change" className="bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center">
                                            <CreditCard size={14} />
                                        </label>
                                        <input
                                            id="qr-upload-change"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleQrUpload}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full flex justify-center">
                                    <label
                                        htmlFor="qr-upload"
                                        className="flex flex-col items-center justify-center w-40 h-40 rounded-xl bg-white border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#32dd9e] hover:bg-[#32dd9e]/5 transition-all gap-2 group/upload"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover/upload:bg-[#32dd9e]/10 group-hover/upload:text-[#32dd9e] transition-colors text-gray-400">
                                            <CreditCard size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover/upload:text-[#32dd9e]">Upload QR</span>
                                    </label>
                                    <input
                                        id="qr-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleQrUpload}
                                    />
                                </div>
                            )}

                            <p className="text-[10px] text-gray-400 max-w-[200px] relative z-10">
                                {qrImage ? "Ask friend to scan this QR" : "Upload your Payment QR Code (UPI) to receive money"}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-50 w-full"
                                onClick={() => setDate(new Date())}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(date, "MMM dd, yyyy")}
                            </Button>
                            <Input
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes (optional)..."
                                className="h-12 rounded-xl border-gray-100 bg-gray-50/50"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <Button
                            onClick={handleSettle}
                            disabled={isLoading}
                            className={`w-full text-white font-bold h-14 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm bg-[#32dd9e] hover:bg-[#2bc48a] shadow-[0_4px_0_#1a8c63]`}
                        >
                            <Banknote size={18} />
                            Record Payment
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
