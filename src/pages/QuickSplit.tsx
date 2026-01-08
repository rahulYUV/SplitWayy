import { useState, useEffect } from "react";
import { Plus, Trash2, RefreshCcw, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/ui/shadcn-io/grid-pattern";

// Types
interface GuestExpense {
    id: string;
    description: string;
    amount: number;
    paidBy: string;
    splitBetween: string[];
}

export function QuickSplit() {
    const [names, setNames] = useState<string[]>([]);
    const [newName, setNewName] = useState("");

    // Expense Form State
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [paidBy, setPaidBy] = useState("");

    const [expenses, setExpenses] = useState<GuestExpense[]>([]);

    // Determine current step: 0 = Names, 1 = Expenses, 2 = Results
    const [step, setStep] = useState(0);

    // Initial Load
    useEffect(() => {
        const storedNames = sessionStorage.getItem("qs_names");
        const storedExpenses = sessionStorage.getItem("qs_expenses");
        if (storedNames) setNames(JSON.parse(storedNames));
        if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
    }, []);

    // Persistence
    useEffect(() => {
        sessionStorage.setItem("qs_names", JSON.stringify(names));
    }, [names]);

    useEffect(() => {
        sessionStorage.setItem("qs_expenses", JSON.stringify(expenses));
    }, [expenses]);

    const handleAddName = () => {
        if (!newName.trim()) return;
        if (names.includes(newName.trim())) {
            toast.error("Name already exists");
            return;
        }
        setNames([...names, newName.trim()]);
        setNewName("");
    };

    const handleAddExpense = () => {
        if (!description || !amount || !paidBy) {
            toast.error("Please fill all fields");
            return;
        }
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            toast.error("Invalid amount");
            return;
        }

        const newExpense: GuestExpense = {
            id: Date.now().toString(),
            description,
            amount: val,
            paidBy,
            splitBetween: names // Simple split equally among all
        };

        setExpenses([...expenses, newExpense]);
        setDescription("");
        setAmount("");
        toast.success("Expense added");
    };

    const calculateSplits = () => {
        const balances: Record<string, number> = {};
        names.forEach(n => balances[n] = 0);

        expenses.forEach(exp => {
            const payer = exp.paidBy;

            // Prevent division by zero
            if (!exp.splitBetween || exp.splitBetween.length === 0) {
                console.warn(`Expense "${exp.description}" has no participants - skipping`);
                return;
            }

            const splitAmount = exp.amount / exp.splitBetween.length;

            // Payer paid full amount (+Credit)
            balances[payer] += exp.amount;

            // Everyone involved subtracts their share (-Debit)
            exp.splitBetween.forEach(person => {
                balances[person] -= splitAmount;
            });
        });

        // Resolve debts
        const debtors: { name: string, amt: number }[] = [];
        const creditors: { name: string, amt: number }[] = [];

        Object.entries(balances).forEach(([name, bal]) => {
            if (bal < -0.01) debtors.push({ name, amt: -bal }); // owes
            if (bal > 0.01) creditors.push({ name, amt: bal }); // is owed
        });

        // Match
        const transactions = [];
        let i = 0;
        let j = 0;

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];

            const amount = Math.min(debtor.amt, creditor.amt);
            transactions.push({
                from: debtor.name,
                to: creditor.name,
                amount
            });

            debtor.amt -= amount;
            creditor.amt -= amount;

            if (debtor.amt < 0.01) i++;
            if (creditor.amt < 0.01) j++;
        }

        return transactions;
    };

    const handleReset = () => {
        if (window.confirm("Clear all session data?")) {
            setNames([]);
            setExpenses([]);
            setStep(0);
            sessionStorage.removeItem("qs_names");
            sessionStorage.removeItem("qs_expenses");
        }
    };

    const transactions = calculateSplits();

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Background Grid - Same as Hero */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.15]">
                <GridPattern
                    width={50}
                    height={50}
                    x={-1}
                    y={-1}
                    strokeDasharray={"4 2"}
                    className={cn(
                        "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
                        "stroke-black"
                    )}
                />
            </div>

            <div className="relative z-10 pt-24 px-4 pb-12">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900">Fast Split <span className="text-[#2563EB] text-lg font-bold bg-[#EBF5FF] px-2 py-0.5 rounded-full ml-2">GUEST</span></h1>
                            <p className="text-gray-500 mt-1">Session-based basic splitting. Data vanishes on close.</p>
                        </div>
                        <button onClick={handleReset} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Reset Session">
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Steps Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                        {["1. Add People", "2. Add Expenses", "3. Results"].map((label, i) => (
                            <button
                                key={i}
                                onClick={() => setStep(i)}
                                className={cn(
                                    "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                                    step === i ? "bg-white shadow text-gray-900" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-6 md:p-8">
                        {step === 0 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-xl font-bold mb-4">Who is splitting?</h2>
                                <div className="flex gap-2 mb-6">
                                    <input
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddName()}
                                        placeholder="Enter Name (e.g. Alice)"
                                        className="flex-1 bg-gray-50 border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563EB]"
                                    />
                                    <button onClick={handleAddName} className="bg-[#2563EB] text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {names.map(name => (
                                        <div key={name} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-100">
                                            {name}
                                            <button onClick={() => setNames(names.filter(n => n !== name))} className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {names.length === 0 && <p className="text-gray-400 text-sm">No one added yet.</p>}
                                </div>

                                {names.length >= 2 && (
                                    <div className="mt-8 flex justify-end">
                                        <button onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full font-bold hover:scale-105 transition-transform">
                                            Next <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-xl font-bold mb-4">Add Expenses</h2>
                                <div className="space-y-3 mb-6">
                                    <input
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="What was it for?"
                                        className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563EB]"
                                    />
                                    <div className="flex gap-3">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="Amount"
                                            className="w-1/3 bg-gray-50 border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563EB]"
                                        />
                                        <select
                                            value={paidBy}
                                            onChange={e => setPaidBy(e.target.value)}
                                            className="flex-1 bg-gray-50 border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563EB]"
                                        >
                                            <option value="">Paid by...</option>
                                            {names.map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </div>
                                    <button onClick={handleAddExpense} className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                                        Add Expense
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {expenses.map((exp, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="font-bold text-gray-900">{exp.description}</p>
                                                <p className="text-xs text-gray-500">Paid by {exp.paidBy}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold">₹{exp.amount}</span>
                                                <button onClick={() => setExpenses(expenses.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {expenses.length === 0 && <p className="text-center text-gray-400 py-4">No expenses recorded.</p>}
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full font-bold hover:scale-105 transition-transform">
                                        See Results <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="text-xl font-bold mb-6">Settlement Plan</h2>

                                {transactions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400">Everything is settled! Or no data entered.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {transactions.map((t, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">{t.from[0]}</div>
                                                    <span className="text-gray-500 text-sm">pays</span>
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">{t.to[0]}</div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-gray-900 text-lg">₹{t.amount.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-400">{t.from} ➔ {t.to}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8 text-center text-xs text-gray-400">
                                    This is a temporary guest session.
                                    <br />Sign up to save groups, track balances over time, and more!
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
