import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Camera, CreditCard, Banknote, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useExpenses } from "@/context/ExpenseContext";
import { toast } from "sonner";
import CurrencyRupeeIcon from "./ui/icons/currency-rupee-icon";

interface SettleUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    friendName: string; // The person we are settling with
    balance: number; // Positive: They owe me. Negative: I owe them.
    userName: string; // Current user
    groupId?: string; // Optional: Link settlement to a group
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function SettleUpModal({ isOpen, onClose, friendName, balance, userName, groupId }: SettleUpModalProps) {
    // Determine default mode based on balance
    // If balance > 0 (They owe me), default to 'take' (receiving money)
    // If balance < 0 (I owe them), default to 'give' (paying money)
    const initialMode = balance >= 0 ? "take" : "give";
    const [mode, setMode] = useState<"give" | "take">(initialMode);

    // Amount is always positive absolute value
    const [amount, setAmount] = useState(Math.abs(balance).toString());
    const [date, setDate] = useState(new Date());
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { addExpense } = useExpenses();

    useEffect(() => {
        setAmount(Math.abs(balance).toString());
        setMode(balance >= 0 ? "take" : "give");
    }, [balance, isOpen]);

    const handleSettle = async (method: "cash" | "online") => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setIsLoading(true);

        try {
            if (method === "online") {
                // Razorpay Logic
                // This is relevant only if I am PAYING (Give mode)
                // Or if I requested money? Usually 'Pay' button is for Paying.
                if (mode !== "give") {
                    toast.error("Online payment is usually for paying others.");
                    setIsLoading(false);
                    return;
                }

                // MOCK RAZORPAY OPTIONS
                const options = {
                    key: "rzp_test_placeholder", // Replace with real key later
                    amount: numAmount * 100, // Amount in paise
                    currency: "INR",
                    name: "SplitWayy",
                    description: `Settle up with ${friendName}`,
                    image: "https://your-logo-url.com/logo.png",
                    handler: async function (_response: any) {
                        // Payment Success
                        await recordPayment(numAmount, "online");
                    },
                    prefill: {
                        name: userName,
                        email: "user@example.com",
                        contact: "9999999999"
                    },
                    theme: {
                        color: "#32dd9e"
                    }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.open();

                // We stop loading here because the modal takes over, 
                // but we might want to keep it loading until verified. 
                // For now, let's reset loading as the user interacts with Razorpay.
                setIsLoading(false);
                return;
            }

            // Cash Payment
            await recordPayment(numAmount, "cash");

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
            setIsLoading(false);
        }
    };

    const recordPayment = async (val: number, _type: "cash" | "online") => {
        // Log payment type if needed for analytics
        // console.log(`Recording ${type} payment`);

        try {
            // Logic Recap:
            // "Give" (I pay X): Payer=You, Split=[You:0, Friend:100%]
            // "Take" (X pays Me): Payer=Friend, Split=[You:100%, Friend:0%] (I receive it)

            // Wait, standard Expense Logic:
            // "I Paid 100". Shared with [Me, Friend].
            // If I want to transfer 100 to Friend.
            // I paid 100. Friend consumed 100.

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
                // notes not supported by interface
            });

            toast.success(`Settled ₹${val} with ${friendName}`);
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Failed to record settlement");
        } finally {
            setIsLoading(false);
        }
    };

    // QR Code URL (UPI Intent)
    // upi://pay?pa=address&pn=name&am=amount
    // Using a placeholder address for now
    const upiLink = `upi://pay?pa=demouser@upi&pn=${userName}&am=${amount}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

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

                    {/* Mode Toggle as Tabs */}
                    <div className="absolute bottom-0 left-0 w-full flex">
                        <button
                            onClick={() => setMode("give")}
                            className={cn(
                                "flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors",
                                mode === "give" ? "bg-white text-[#32dd9e]" : "bg-[#2bc48a] text-white/60 hover:bg-[#2ebf88]"
                            )}
                        >
                            Pay {friendName}
                        </button>
                        <button
                            onClick={() => setMode("take")}
                            className={cn(
                                "flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors",
                                mode === "take" ? "bg-white text-[#32dd9e]" : "bg-[#2bc48a] text-white/60 hover:bg-[#2ebf88]"
                            )}
                        >
                            Receive from {friendName}
                        </button>
                    </div>
                </DialogHeader>

                <div className="p-6 flex flex-col gap-6">

                    {/* Amount Input */}
                    <div className="flex flex-col items-center justify-center gap-2 pt-4">
                        <Label className="uppercase text-[10px] tracking-[0.2em] text-gray-400 font-bold">Total Amount</Label>
                        <div className="flex items-center justify-center">
                            <CurrencyRupeeIcon className="text-gray-900 w-8 h-8" />
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-5xl font-black text-center border-none shadow-none focus-visible:ring-0 p-0 h-auto w-40 placeholder:text-gray-200"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {mode === "take" && (
                        <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center gap-4 text-center border border-dashed border-gray-200">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Show this QR to {friendName}</span>
                            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 opacity-90 mix-blend-multiply" />
                            </div>
                            <p className="text-[10px] text-gray-400 max-w-[200px]">
                                Scan to pay via UPI (Note: This uses a demo VPA)
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                onClick={() => setDate(new Date())}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(date, "MMM dd, yyyy")}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-50 bg-transparent"
                                onClick={() => {
                                    const note = prompt("Enter notes:");
                                    if (note) setNotes(note);
                                }}
                            >
                                <Camera className="mr-2 h-4 w-4" />
                                {notes ? "Edit Notes" : "Add Notes"}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        {mode === "give" && (
                            <Button
                                onClick={() => handleSettle("online")}
                                disabled={isLoading}
                                className="w-full bg-[#3395ff] hover:bg-[#2b85e6] text-white font-bold h-14 rounded-2xl shadow-[0_4px_0_#1f6bc4] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
                            >
                                <CreditCard size={18} />
                                Pay Online
                            </Button>
                        )}

                        <Button
                            onClick={() => handleSettle("cash")}
                            disabled={isLoading}
                            className={`w-full text-white font-bold h-14 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm ${mode === "give" ? "bg-[#32dd9e] hover:bg-[#2bc48a] shadow-[0_4px_0_#1a8c63]" : "bg-[#32dd9e] hover:bg-[#2bc48a] shadow-[0_4px_0_#1a8c63]"}`}
                        >
                            <Banknote size={18} />
                            Record Cash Payment
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
