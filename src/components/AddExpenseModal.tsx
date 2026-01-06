"use client"

import React, { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { Receipt, Plus, Users, Wallet, CreditCard, X, Check, ArrowRight, IndianRupee, Calendar as CalendarIcon, UserCheck } from "lucide-react"
import { sendExpenseNotification } from "@/services/emailService"
import { updateExpense } from "@/services/expenseService"
import { toast } from "sonner"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useExpenses } from "@/context/ExpenseContext"

const expenseSchema = z.object({
    description: z.string().min(3, "Description must be at least 3 characters"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
    participants: z.array(z.string()).min(0),
    paidBy: z.string().min(1, "Select who paid"),
    splitMethod: z.enum(["equally", "percentage"]),
    splitDetails: z.record(z.string(), z.string()).optional(),
    payerDetails: z.record(z.string(), z.string()).optional(),
    notes: z.string().optional(),
    date: z.date(),
    groupId: z.string().nullable().optional(),
    billImageUrl: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

interface AddExpenseModalProps {
    children?: React.ReactNode
    userName?: string
    groupId?: string | null
    mode?: "add" | "edit"
    initialData?: any // Expense type
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AddExpenseModal({ children, groupId, userName, mode = "add", initialData, open: controlledOpen, onOpenChange }: AddExpenseModalProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen

    const setOpen = (val: boolean) => {
        if (onOpenChange) onOpenChange(val)
        else setInternalOpen(val)
    }

    const [billImage, setBillImage] = useState<string | null>(null)
    const [manualEmails, setManualEmails] = useState<Record<string, string>>({})
    const { addExpense, groups, friends } = useExpenses()

    // Find group if groupId is provided
    const selectedGroup = groups.find(g => g.id === groupId)
    const groupMemberNames = selectedGroup?.members.map(m => m.name).filter(n => n !== "You") || []

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: mode === "edit" && initialData ? {
            description: initialData.description,
            amount: String(initialData.amount),
            participants: initialData.participants || [],
            paidBy: initialData.paidBy,
            splitMethod: initialData.splitMethod,
            splitDetails: initialData.splitDetails || {},
            payerDetails: initialData.payerDetails || {},
            notes: initialData.notes || "",
            date: initialData.date instanceof Date ? initialData.date : new Date(initialData.date),
            groupId: initialData.groupId,
            billImageUrl: initialData.billImageUrl,
        } : {
            description: "",
            amount: "",
            participants: groupId ? groupMemberNames : [],
            paidBy: "You",
            splitMethod: "equally",
            splitDetails: {},
            payerDetails: {},
            notes: "",
            date: new Date(),
            groupId: groupId || undefined,
            billImageUrl: undefined,
        },
    })

    // Update form when initialData changes
    useEffect(() => {
        if (mode === "edit" && initialData) {
            form.reset({
                description: initialData.description,
                amount: String(initialData.amount),
                participants: initialData.participants || [],
                paidBy: initialData.paidBy,
                splitMethod: initialData.splitMethod,
                splitDetails: initialData.splitDetails || {},
                payerDetails: initialData.payerDetails || {},
                notes: initialData.notes || "",
                date: initialData.date ? new Date(initialData.date) : new Date(),
                groupId: initialData.groupId,
                billImageUrl: initialData.billImageUrl,
            })
            setBillImage(initialData.billImageUrl || null)
        }
    }, [initialData, mode, form])

    // Reset participants when groupId changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setBillImage(null);
            if (groupId && selectedGroup) {
                form.setValue("participants", groupMemberNames)
                form.setValue("groupId", groupId)
            } else if (!groupId && mode === "add") {
                form.setValue("participants", [])
                form.setValue("groupId", undefined)
            }
        } else {
            setBillImage(null);
        }
    }, [isOpen, groupId, selectedGroup, mode])

    const participants = useWatch({ control: form.control, name: "participants" })
    const splitMethod = useWatch({ control: form.control, name: "splitMethod" })
    const paidBy = useWatch({ control: form.control, name: "paidBy" })
    const amount = useWatch({ control: form.control, name: "amount" })
    const splitDetails = useWatch({ control: form.control, name: "splitDetails" }) || {}
    const payerDetails = useWatch({ control: form.control, name: "payerDetails" }) || {}

    const allInvolved = ["You", ...participants]

    const onSubmit = async (values: ExpenseFormValues) => {
        try {
            // Auto-add text from search box if user forgot to click +
            let finalParticipants = [...values.participants]
            // Note: In new manual mode, we rely on state manualEmails and + click. 
            // But if user typed in manual-name inputs and pressed Save, we could try to capture it.
            // For safety, we skip incomplete inputs to avoid bugs, as per previous logic.

            if (values.splitMethod === "percentage") {
                const totalPercent = ["You", ...finalParticipants].reduce((acc, name) => acc + (Number(values.splitDetails?.[name]) || 0), 0)
                if (Math.abs(totalPercent - 100) > 0.1) {
                    toast.error("Total percentage must add up to 100%")
                    return
                }
            }

            if (values.paidBy === "multiple") {
                const totalPaid = ["You", ...finalParticipants].reduce((acc, name) => acc + (Number(values.payerDetails?.[name]) || 0), 0)
                if (Math.abs(totalPaid - Number(values.amount)) > 0.1) {
                    toast.error(`Total paid (₹${totalPaid}) must match total amount (₹${values.amount})`)
                    return
                }
            }

            // Gather Emails for Sync & Notifications
            const pEmails: string[] = [];
            finalParticipants.forEach(p => {
                // 1. Direct Email Input
                if (p.includes('@')) {
                    pEmails.push(p);
                    return;
                }

                // 2. Lookup in Saved Friends
                const friend = friends.find(f => f.displayName === p);
                if (friend?.email) {
                    pEmails.push(friend.email);
                    return;
                }

                // 3. Lookup in Group Members
                if (groupId && selectedGroup) {
                    const member = selectedGroup.members.find(m => m.name === p);
                    if (member?.email) {
                        pEmails.push(member.email);
                        return;
                    }
                }

                // 4. Lookup in Manual Inputs
                if (manualEmails[p]) {
                    pEmails.push(manualEmails[p]);
                }
            });

            const expenseData = {
                description: values.description,
                amount: Number(values.amount),
                participants: finalParticipants,
                participantEmails: pEmails,
                paidBy: values.paidBy,
                splitMethod: values.splitMethod,
                splitDetails: values.splitDetails,
                payerDetails: values.payerDetails,
                date: values.date,
                groupId: values.groupId || null,
                billImageUrl: values.billImageUrl,
            }

            if (mode === "edit" && initialData?.id) {
                await updateExpense(initialData.id, expenseData)
                toast.success("Expense updated!")
            } else {
                await addExpense(expenseData)

                // Send Email Notifications (Only on Create)
                if (pEmails.length > 0) {
                    const splitAmt = Number((Number(values.amount) / (finalParticipants.length + 1)).toFixed(2));
                    pEmails.forEach(email => {
                        const pName = finalParticipants.find(p => p.includes(email) || friends.find(f => f.email === email)?.displayName === p) || "Friend";
                        sendExpenseNotification(
                            email,
                            pName,
                            userName || "A Friend",
                            values.description,
                            Number(values.amount),
                            splitAmt
                        );
                    });
                }

                toast.success("Expense added successfully!", {
                    description: `${values.description} - ₹${values.amount}`,
                })
            }

            setOpen(false)
            form.reset()
            setBillImage(null)

        } catch (error) {
            console.error("Failed to save expense:", error)
            toast.error(
                error instanceof Error ? error.message : "Failed to save expense. Please try again."
            )
        }
    }

    const friendsList = friends.map(f => f.displayName)

    const toggleParticipant = (friend: string) => {
        const current = form.getValues("participants")
        const updated = current.includes(friend)
            ? current.filter(p => p !== friend)
            : [...current, friend]
        form.setValue("participants", updated, { shouldValidate: true })
    }

    const isAllGroupSelected = groupId && participants.length === groupMemberNames.length

    const toggleAllGroup = () => {
        if (isAllGroupSelected) {
            form.setValue("participants", [], { shouldValidate: true })
        } else {
            form.setValue("participants", groupMemberNames, { shouldValidate: true })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-white border-none rounded-3xl p-0 overflow-hidden shadow-2xl flex flex-col md:h-auto overflow-y-auto max-h-[95vh]">
                {/* Clean Header */}
                <div className="bg-[#32dd9e] px-8 py-5 pb-10 flex items-center justify-between shrink-0 text-white relative">
                    <div className="flex items-center gap-3 font-semibold relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <DialogTitle className="text-lg leading-tight font-bold text-white">
                                {groupId ? `Add to ${selectedGroup?.name}` : "Add New Expense"}
                            </DialogTitle>
                            <span className="text-[10px] text-white/70 uppercase tracking-widest">
                                {mode === "edit" ? "Modify expense details" : (groupId ? "Select who's involved in this bill" : "Split bills with your gang")}
                            </span>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors relative z-10">
                        <X className="w-5 h-5" />
                    </button>

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

                <div className="p-8 bg-white">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* Section 1: Participants */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <label className="text-xs font-semibold text-gray-900">
                                            {groupId ? "Select Participants" : "Add Participants"}
                                        </label>
                                        <span className="text-[10px] text-gray-400">
                                            {groupId ? "Only selected members will share this bill" : "Search or select from your list"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                        <Users size={12} className="text-[#32dd9e]" />
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{participants.length + 1} INVOLVED</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {groupId && (
                                        <button
                                            type="button"
                                            onClick={toggleAllGroup}
                                            className={cn(
                                                "self-start h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border italic shadow-md flex items-center gap-2",
                                                isAllGroupSelected
                                                    ? "bg-black text-white border-black"
                                                    : "bg-white text-black/40 border-gray-200 hover:border-black/20"
                                            )}
                                        >
                                            <UserCheck className={cn("w-3.5 h-3.5", isAllGroupSelected ? "text-[#32dd9e]" : "text-black/10")} />
                                            With You and : All of {selectedGroup?.name}
                                        </button>
                                    )}

                                    <div className="flex flex-wrap gap-2 items-center">
                                        {/* Show group members as toggleable buttons */}
                                        {groupId ? (
                                            selectedGroup?.members.map(member => {
                                                if (member.name === "You") return null;
                                                const isSelected = participants.includes(member.name);
                                                return (
                                                    <button
                                                        key={member.name}
                                                        type="button"
                                                        onClick={() => toggleParticipant(member.name)}
                                                        className={cn(
                                                            "h-9 px-4 rounded-xl text-[10px] font-semibold transition-all border flex items-center gap-2",
                                                            isSelected
                                                                ? "bg-black text-white border-black"
                                                                : "bg-white text-gray-400 border-gray-200 hover:border-[#32dd9e]/50 hover:text-gray-600"
                                                        )}
                                                    >
                                                        {isSelected && <Check className="w-3 h-3 text-[#32dd9e]" />}
                                                        {member.name}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <>
                                                <div className="flex flex-col gap-2 w-full">
                                                    <div className="flex items-end gap-2 w-full">
                                                        <div className="flex-1 space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider pl-1">Name</label>
                                                            <Input
                                                                id="manual-name"
                                                                placeholder="e.g. Anjali"
                                                                className="h-10 bg-gray-50 border-gray-100 rounded-lg text-xs"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        document.getElementById('manual-add-btn')?.click();
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email <span className="text-gray-300 font-normal">(Optional)</span></label>
                                                            <Input
                                                                id="manual-email"
                                                                placeholder="anjali@gmail.com"
                                                                className="h-10 bg-gray-50 border-gray-100 rounded-lg text-xs"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        document.getElementById('manual-add-btn')?.click();
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            id="manual-add-btn"
                                                            onClick={() => {
                                                                const nameInput = document.getElementById('manual-name') as HTMLInputElement;
                                                                const emailInput = document.getElementById('manual-email') as HTMLInputElement;
                                                                const name = nameInput.value.trim();
                                                                const email = emailInput.value.trim();

                                                                if (name && !participants.includes(name)) {
                                                                    toggleParticipant(name);
                                                                    if (email) {
                                                                        setManualEmails(prev => ({ ...prev, [name]: email }));
                                                                    }
                                                                    nameInput.value = '';
                                                                    emailInput.value = '';
                                                                    nameInput.focus();
                                                                } else if (!name) {
                                                                    toast.error("Please enter a name");
                                                                }
                                                            }}
                                                            className="h-10 w-10 bg-black hover:bg-[#32dd9e] text-white rounded-lg p-0 flex items-center justify-center shrink-0"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-[9px] text-gray-400 pl-1">Add email to notify them instantly!</p>
                                                </div>

                                                {/* Display added participants as chips */}
                                                {participants.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                        <div className="w-full text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Added Participants:</div>
                                                        {participants.map((name) => (
                                                            <div
                                                                key={name}
                                                                className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold group hover:bg-red-500 transition-all"
                                                            >
                                                                <span>{name}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleParticipant(name)}
                                                                    className="hover:scale-125 transition-transform"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {friendsList.map(friend => {
                                                    const isSelected = participants.includes(friend);
                                                    return (
                                                        <button
                                                            key={friend}
                                                            type="button"
                                                            onClick={() => toggleParticipant(friend)}
                                                            className={cn(
                                                                "h-9 px-4 rounded-xl text-[10px] font-semibold transition-all border flex items-center gap-2",
                                                                isSelected
                                                                    ? "bg-black text-white border-black"
                                                                    : "bg-white text-gray-400 border-gray-200 hover:border-[#32dd9e]/50 hover:text-gray-600"
                                                            )}
                                                        >
                                                            {isSelected && <Check className="w-3 h-3 text-[#32dd9e]" />}
                                                            {friend}
                                                        </button>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                {/* Details Card */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5 col-span-2">
                                                    <FormLabel className="text-xs font-semibold text-gray-900">Description</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Dinner, Movie, Groceries..."
                                                            className="h-11 bg-gray-50 border-gray-100 rounded-xl px-4 text-xs font-medium focus:bg-white shadow-sm"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-xs font-semibold text-gray-900">Amount</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="0.00"
                                                                className="h-11 bg-gray-50 border-gray-100 rounded-xl pl-10 text-sm font-bold focus:bg-white shadow-sm"
                                                                {...field}
                                                            />
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                                <IndianRupee size={14} />
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5 flex flex-col">
                                                    <FormLabel className="text-xs font-semibold text-gray-900">Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "h-11 bg-gray-50 border-gray-100 rounded-xl px-4 text-xs text-left font-medium hover:bg-white",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
                                                                    ) : (
                                                                        <span>Pick a date</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => {
                                                                    const today = new Date();
                                                                    today.setHours(23, 59, 59, 999);
                                                                    return date > today || date < new Date("1900-01-01");
                                                                }}
                                                                initialFocus
                                                                className="rounded-2xl"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Bill Image Upload (Optional) */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                                            <Receipt size={12} className="text-gray-400" />
                                            Bill Image (Optional)
                                        </label>
                                        <div className="relative">
                                            {!billImage ? (
                                                <label
                                                    htmlFor="bill-image-upload"
                                                    className="flex flex-col items-center justify-center h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#32dd9e] hover:bg-[#32dd9e]/5 transition-all cursor-pointer group"
                                                >
                                                    <Plus className="w-5 h-5 text-gray-300 group-hover:text-[#32dd9e] mb-1" />
                                                    <span className="text-[10px] text-gray-400 group-hover:text-[#32dd9e] font-semibold">Click to upload bill image</span>
                                                    <input
                                                        id="bill-image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setBillImage(reader.result as string);
                                                                    form.setValue("billImageUrl", reader.result as string);
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            ) : (
                                                <div className="relative h-24 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden group">
                                                    <img src={billImage} alt="Bill preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setBillImage(null);
                                                            form.setValue("billImageUrl", undefined);
                                                        }}
                                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                                                <Wallet size={12} className="text-gray-400" />
                                                Payer
                                            </label>
                                            <FormField
                                                control={form.control}
                                                name="paidBy"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-11 border-gray-200 rounded-xl px-4 text-xs font-semibold bg-white shadow-sm">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-gray-100 shadow-xl overflow-hidden">
                                                            <SelectItem value="You" className="text-xs font-bold">You</SelectItem>
                                                            {allInvolved.filter(p => p !== "You").map(p => (
                                                                <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                                                            ))}
                                                            <SelectItem value="multiple" className="text-xs text-[#32dd9e] font-black">Multiple Payers</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                                                <CreditCard size={12} className="text-gray-400" />
                                                Split
                                            </label>
                                            <FormField
                                                control={form.control}
                                                name="splitMethod"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-11 border-gray-200 rounded-xl px-4 text-xs font-semibold bg-white shadow-sm">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-gray-100 shadow-xl overflow-hidden">
                                                            <SelectItem value="equally" className="text-xs font-bold italic tracking-tighter">Equally</SelectItem>
                                                            <SelectItem value="percentage" className="text-xs font-bold italic tracking-tighter">By Percent</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary & Advanced Section */}
                                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 space-y-4">
                                    {(paidBy === "multiple" || splitMethod === "percentage") ? (
                                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                            {allInvolved.map((person) => (
                                                <div key={person} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{person}</span>
                                                    <div className="flex gap-2">
                                                        {paidBy === "multiple" && (
                                                            <Input
                                                                placeholder="₹ Paid"
                                                                className="h-8 w-20 px-2 text-[10px] border-gray-100 rounded-lg text-right font-bold"
                                                                value={payerDetails[person] || ""}
                                                                onChange={(e) => form.setValue(`payerDetails.${person}`, e.target.value)}
                                                            />
                                                        )}
                                                        {splitMethod === "percentage" && (
                                                            <Input
                                                                placeholder="% Share"
                                                                className="h-8 w-16 px-2 text-[10px] border-gray-100 rounded-lg text-right font-bold"
                                                                value={splitDetails[person] || ""}
                                                                onChange={(e) => form.setValue(`splitDetails.${person}`, e.target.value)}
                                                            />
                                                        )}
                                                        <div className="w-16 flex flex-col items-end justify-center">
                                                            <span className="text-[8px] text-gray-400 font-bold uppercase leading-none mb-0.5">SHARE</span>
                                                            <span className="text-[10px] text-black font-black leading-none">
                                                                ₹{splitMethod === "equally"
                                                                    ? ((Number(amount) || 0) / allInvolved.length).toFixed(0)
                                                                    : (((Number(amount) || 0) * (Number(splitDetails[person]) || 0)) / 100).toFixed(0)
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                                            <div className="w-12 h-12 bg-[#32dd9e]/10 rounded-full flex items-center justify-center">
                                                <Users size={20} className="text-[#32dd9e]" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest leading-none italic">Standard Split</h4>
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Everyone pays their equal share</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-gray-200/50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Calculated Balance</span>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white">
                                                    <IndianRupee size={10} />
                                                </div>
                                                <span className="text-xl font-bold text-black tracking-tighter">
                                                    {(Number(amount) || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Each Pays</span>
                                            <p className="text-sm font-bold text-[#32dd9e] mt-0.5">
                                                ₹{((Number(amount) || 0) / allInvolved.length).toFixed(0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex gap-4 pt-4 shrink-0 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                    className="h-12 px-8 rounded-xl text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 h-12 bg-black hover:bg-black/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 group transition-all"
                                >
                                    Save Bill Details
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
