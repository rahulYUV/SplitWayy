"use client"

import React, { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { Receipt, Plus, Users, Wallet, CreditCard, X, Check, IndianRupee, Calendar as CalendarIcon, UserCheck, Tag, Repeat } from "lucide-react"
import { sendExpenseNotification } from "@/services/emailService"
import { updateExpense } from "@/services/expenseService"
import { logActivity } from "@/services/activityService"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"
import { format } from "date-fns"
import logo from "@/assets/images/Home.png"

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
import { cn, compressImage, isOnline, formatFileSize, validateImageFile } from "@/lib/utils"
import { useExpenses } from "@/context/ExpenseContext"

const expenseSchema = z.object({
    description: z.string().min(3, "Description must be at least 3 characters"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number").refine((val) => Number(val) <= 1000000, "Not allowed to add more than 10 Lakh"),
    participants: z.array(z.string()).min(0),
    paidBy: z.string().min(1, "Select who paid"),
    splitMethod: z.enum(["equally", "percentage", "exact"]),
    splitDetails: z.record(z.string(), z.string()).optional(),
    payerDetails: z.record(z.string(), z.string()).optional(),
    notes: z.string().optional(),
    date: z.date(),
    groupId: z.string().nullable().optional(),
    billImageUrl: z.string().nullable().optional(),
    category: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(["weekly", "monthly"]).default("monthly"),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

interface AddExpenseModalProps {
    children?: React.ReactNode
    userName?: string
    groupId?: string | null
    defaultParticipants?: string[]
    hideManualParticipantEntry?: boolean
    mode?: "add" | "edit"
    initialData?: any // Expense type
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const Label = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <label className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
        <span className="text-gray-400">{icon}</span>
        {text}
    </label>
)

export function AddExpenseModal({ children, groupId, userName, defaultParticipants = [], hideManualParticipantEntry = false, mode = "add", initialData, open: controlledOpen, onOpenChange }: AddExpenseModalProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen

    const setOpen = (val: boolean) => {
        if (onOpenChange) onOpenChange(val)
        else setInternalOpen(val)
    }

    const [billImage, setBillImage] = useState<string | null>(null)
    const [isImageUploading, setIsImageUploading] = useState(false)
    const [manualEmails, setManualEmails] = useState<Record<string, string>>({})
    const [everyonePaidOwn, setEveryonePaidOwn] = useState(false)
    const [manualName, setManualName] = useState("")
    const [manualEmail, setManualEmail] = useState("")
    const { addExpense, groups, friends } = useExpenses()

    // Find group if groupId is provided
    const selectedGroup = groups.find(g => g.id === groupId)
    // Ensure "You" is always an option, even if missing from group members list (legacy data fix)
    const groupMemberNames = Array.from(new Set([...(selectedGroup?.members.map(m => m.name) || []), "You"]));

    // Logic for default participants: "You" + defaultParticipants (deduplicated)
    const initialParticipants = groupId
        ? groupMemberNames
        : Array.from(new Set(["You", ...defaultParticipants]));

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema) as any,
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
            category: initialData.category || "Other",
            isRecurring: initialData.recurring?.isRecurring ?? false,
            recurringInterval: initialData.recurring?.interval || "monthly",
        } : {
            description: "",
            amount: "",
            participants: initialParticipants,
            paidBy: "You",
            splitMethod: "equally",
            splitDetails: {},
            payerDetails: {},
            notes: "",
            date: new Date(),
            groupId: groupId || undefined,
            billImageUrl: undefined,
            category: "Other",
            isRecurring: false,
            recurringInterval: "monthly",
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
                category: initialData.category || "Other",
                isRecurring: initialData.recurring?.isRecurring ?? false,
                recurringInterval: initialData.recurring?.interval || "monthly",
            })
            setBillImage(initialData.billImageUrl || null)
        }
    }, [initialData, mode, form])

    const handleAddManualParticipant = () => {
        const name = manualName.trim();
        const email = manualEmail.trim();

        if (name) {
            if (!participants.includes(name)) {
                toggleParticipant(name);
                if (email) {
                    setManualEmails(prev => ({ ...prev, [name]: email }));
                }
                setManualName("");
                setManualEmail("");
                toast.success(`Added ${name}`);
            } else {
                toast.error(`${name} is already added`);
            }
        } else {
            toast.error("Please enter a name");
        }
    }

    // Reset participants when groupId changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setBillImage(null);
            setEveryonePaidOwn(false);
            setManualEmails({});
            setManualName("");
            setManualEmail("");
            if (groupId && selectedGroup) {
                form.setValue("participants", groupMemberNames)
                form.setValue("groupId", groupId)
            } else if (!groupId && mode === "add") {
                const defaults = Array.from(new Set(["You", ...defaultParticipants]));
                form.setValue("participants", defaults)
                form.setValue("groupId", undefined)
            }
        } else {
            setBillImage(null);
            setEveryonePaidOwn(false);
        }
    }, [isOpen, groupId, selectedGroup, mode])

    const participants = useWatch({ control: form.control, name: "participants" })
    const splitMethod = useWatch({ control: form.control, name: "splitMethod" })
    const paidBy = useWatch({ control: form.control, name: "paidBy" })
    const amount = useWatch({ control: form.control, name: "amount" })
    const splitDetails = useWatch({ control: form.control, name: "splitDetails" }) || {}
    const payerDetails = useWatch({ control: form.control, name: "payerDetails" }) || {}

    const allInvolved = participants

    useEffect(() => {
        if (everyonePaidOwn) {
            form.setValue("splitMethod", "exact");
        }
    }, [everyonePaidOwn, form]);

    const handleOwnShareChange = (person: string, val: string) => {
        form.setValue(`payerDetails.${person}`, val);
        form.setValue(`splitDetails.${person}`, val);

        // Calculate new Total live
        const newTotal = allInvolved.reduce((acc, p) => {
            const pVal = p === person ? val : (payerDetails[p] || "0");
            return acc + (Number(pVal) || 0);
        }, 0);

        form.setValue("amount", String(newTotal));
    }

    const onSubmit = async (values: ExpenseFormValues) => {
        try {
            if (Number(values.amount) > 1000000) {
                toast.error("Expense limit exceeded! Max allowed is ₹10,00,000");
                return;
            }
            const finalParticipants = [...values.participants]

            if (values.splitMethod === "percentage") {
                const totalPercent = finalParticipants.reduce((acc, name) => acc + (Number(values.splitDetails?.[name]) || 0), 0)
                // Stricter validation: 0.01% tolerance
                if (Math.abs(totalPercent - 100) > 0.01) {
                    toast.error(`Total percentage is ${totalPercent.toFixed(2)}% - must be exactly 100%`)
                    return
                }
            }

            if (values.splitMethod === "exact") {
                const totalExact = finalParticipants.reduce((acc, name) => acc + (Number(values.splitDetails?.[name]) || 0), 0)
                // Stricter validation: ₹0.50 tolerance
                if (Math.abs(totalExact - Number(values.amount)) > 0.5) {
                    toast.error(`Total split (₹${totalExact.toFixed(2)}) must match expense (₹${Number(values.amount).toFixed(2)})`)
                    return
                }
            }

            if (values.paidBy === "multiple") {
                const totalPaid = finalParticipants.reduce((acc, name) => acc + (Number(values.payerDetails?.[name]) || 0), 0)
                if (Math.abs(totalPaid - Number(values.amount)) > 0.1) {
                    toast.error(`Total paid (₹${totalPaid}) must match total amount (₹${values.amount})`)
                    return
                }
            }

            // Auto-add pending manual participant if user forgot to click add
            const currentManualEmails = { ...manualEmails };
            if (manualName.trim()) {
                const name = manualName.trim();
                const email = manualEmail.trim();

                // Only add if not already in the list
                if (!finalParticipants.includes(name)) {
                    finalParticipants.push(name);
                    if (email) {
                        currentManualEmails[name] = email;
                    }
                    toast.info(`Included ${name} in the expense`);
                }
            }

            // Gather Emails for Sync & Notifications
            const pEmails: string[] = [];
            finalParticipants.forEach(p => {
                if (p.includes('@')) {
                    pEmails.push(p);
                    return;
                }
                const friend = friends.find(f => f.displayName === p);
                if (friend?.email) {
                    pEmails.push(friend.email);
                    return;
                }
                if (groupId && selectedGroup) {
                    const member = selectedGroup.members.find(m => m.name === p);
                    if (member?.email) {
                        pEmails.push(member.email);
                        return;
                    }
                }
                if (currentManualEmails[p]) {
                    pEmails.push(currentManualEmails[p]);
                }
            });

            // Sanitize Data: Replace "You" with actual userName
            // This is CRITICAL. "You" must be resolved to the explicit userName if available, otherwise it causes ambiguity in shared groups.
            // If userName is not provided (e.g. some loose calling code?), we try to fallback to "You" but it is risky.
            const effectiveUserName = userName || auth.currentUser?.displayName || "You";

            const sanitizedParticipants = finalParticipants.map(p => p.trim() === "You" ? effectiveUserName : p.trim());

            // Allow user to be added if implicitly involved but not in list (for split safety)
            // But usually we respect the form.

            const sanitizeDetails = (details: Record<string, string> | undefined) => {
                if (!details) return {};
                const newDetails: Record<string, string> = {};
                Object.entries(details).forEach(([key, val]) => {
                    const newKey = key.trim() === "You" ? effectiveUserName : key.trim();
                    newDetails[newKey] = val;
                });
                return newDetails;
            };

            const expenseData = {
                description: values.description,
                amount: Number(values.amount),
                participants: sanitizedParticipants,
                participantEmails: pEmails,
                paidBy: (values.paidBy === "You" || values.paidBy.trim() === "You") ? effectiveUserName : values.paidBy,
                splitMethod: values.splitMethod,
                splitDetails: sanitizeDetails(values.splitDetails),
                payerDetails: sanitizeDetails(values.payerDetails),
                date: values.date,
                groupId: values.groupId || null,
                billImageUrl: values.billImageUrl || null,
                category: values.category || "Other",
                recurring: values.isRecurring ? {
                    isRecurring: true,
                    interval: values.recurringInterval,
                    active: true,
                    nextDue: (() => {
                        const d = new Date(values.date);
                        if (values.recurringInterval === 'weekly') {
                            d.setDate(d.getDate() + 7);
                        } else if (values.recurringInterval === 'monthly') {
                            // Smart Monthly Logic: Jan 31 -> Feb 28/29
                            const currentDay = d.getDate();
                            d.setMonth(d.getMonth() + 1);
                            if (d.getDate() !== currentDay) {
                                // Overflow happened (e.g. Feb 3 instead of Feb 28)
                                // Go back to last day of previous month
                                d.setDate(0);
                            }
                        }
                        return d;
                    })()
                } : null,
            }

            if (mode === "edit" && initialData?.id) {
                await updateExpense(initialData.id, expenseData)

                // Log Changes
                const changes: { field: string, oldValue: any, newValue: any }[] = []
                if (initialData.description !== expenseData.description) changes.push({ field: "Description", oldValue: initialData.description, newValue: expenseData.description })
                if (Number(initialData.amount) !== Number(expenseData.amount)) changes.push({ field: "Amount", oldValue: `₹${initialData.amount}`, newValue: `₹${expenseData.amount}` })

                // Compare dates safely
                const d1 = initialData.date instanceof Date ? initialData.date : new Date(initialData.date);
                const d2 = expenseData.date instanceof Date ? expenseData.date : new Date(expenseData.date);
                if (d1.toDateString() !== d2.toDateString()) {
                    changes.push({ field: "Date", oldValue: format(d1, 'MMM dd'), newValue: format(d2, 'MMM dd') })
                }

                if (changes.length > 0) {
                    await logActivity({
                        type: "update_expense",
                        description: `Updated: ${expenseData.description}`,
                        details: {
                            groupName: selectedGroup?.name,
                            amount: expenseData.amount,
                            changes: changes,
                            date: new Date()
                        },
                        createdBy: userName || "You",
                        userId: auth.currentUser?.uid,
                        expenseId: initialData?.id,
                        visibleToUserEmails: Array.from(new Set([...pEmails, auth.currentUser?.email || ""].filter(Boolean)))
                    });
                }

                toast.success("Expense updated!")
            } else {
                await addExpense(expenseData)

                await logActivity({
                    type: "add_expense",
                    description: `Added: ${expenseData.description}`,
                    details: {
                        groupName: selectedGroup?.name,
                        amount: expenseData.amount,
                        paidBy: expenseData.paidBy,
                        participants: expenseData.participants,
                        date: new Date()
                    },
                    createdBy: userName || "You",
                    userId: auth.currentUser?.uid,
                    visibleToUserEmails: Array.from(new Set([...pEmails, auth.currentUser?.email || ""].filter(Boolean)))
                });


                if (pEmails.length > 0) {
                    pEmails.forEach(email => {
                        // 1. Identify Participant Name
                        let pName = "Friend";

                        // Check if email belongs to a friend
                        const friendMatch = friends.find(f => f.email === email);
                        if (friendMatch && finalParticipants.includes(friendMatch.displayName || "")) {
                            pName = friendMatch.displayName || friendMatch.name || "Friend";
                        }
                        // Check group members
                        else if (selectedGroup) {
                            const memberMatch = selectedGroup.members.find(m => m.email === email);
                            if (memberMatch && finalParticipants.includes(memberMatch.name)) {
                                pName = memberMatch.name;
                            }
                        }

                        // Check manual entry
                        if (pName === "Friend") {
                            const manualMatch = Object.entries(manualEmails).find(([name, e]) => e === email && finalParticipants.includes(name));
                            if (manualMatch) pName = manualMatch[0];
                        }

                        // Fallback: If the email itself is in the participants list (unlikely based on valid chars but possible in loose logic)
                        if (pName === "Friend" && finalParticipants.includes(email)) {
                            pName = email;
                        }

                        // 2. Calculate Their Specific Share
                        let myShare = 0;
                        if (values.splitMethod === 'equally' || !values.splitMethod) {
                            myShare = Number(values.amount) / finalParticipants.length;
                        } else if (values.splitMethod === 'exact') {
                            myShare = Number(values.splitDetails?.[pName]) || 0;
                        } else if (values.splitMethod === 'percentage') {
                            const percent = Number(values.splitDetails?.[pName]) || 0;
                            myShare = (Number(values.amount) * percent) / 100;
                        }

                        sendExpenseNotification(
                            email,
                            pName,
                            userName || "SplitWayy User",
                            values.description,
                            Number(values.amount),
                            Number(myShare.toFixed(2))
                        );
                    });

                    toast.success(`Sent emails to ${pEmails.length} participants`);
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

    const friendsList = friends
        .map(f => f.displayName)
        .filter((n): n is string => !!n)
        .filter(n => n.toLowerCase() !== userName?.toLowerCase())

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
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-transparent border-none shadow-none drop-shadow-2xl h-[85vh] flex flex-col [&>button:last-child]:hidden">
                {/* Clean Header */}
                <div className="bg-[#32dd9e] px-8 py-5 pb-10 flex items-center justify-between shrink-0 text-white relative rounded-t-3xl">
                    <div className="flex items-center gap-3 font-semibold relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        </div>
                        <div className="flex flex-col">
                            <DialogTitle className="text-lg leading-tight font-bold text-white">
                                {groupId ? `Add to ${selectedGroup?.name}` : "Add New Expense"}
                            </DialogTitle>
                            <span className="text-[10px] text-white/70 uppercase tracking-widest">
                                {mode === "edit" ? "Modify expense details" : (groupId ? "Select who's involved in this bill" : "Split with close ones")}
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

                <div className="p-8 bg-white flex-1 overflow-y-auto custom-scrollbar">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                            console.error("Form Validation Errors:", errors);
                            toast.error("Please check the form for errors. Some fields are missing or invalid.");
                        })} className="space-y-8">

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
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{participants.length} INVOLVED</span>
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

                                    {/* Display added participants as chips */}


                                    <div className="flex flex-wrap gap-2 items-center">
                                        {/* Show group members as toggleable buttons */}
                                        {groupId ? (
                                            groupMemberNames.map(name => {
                                                const isSelected = participants.includes(name);
                                                return (
                                                    <button
                                                        key={name}
                                                        type="button"
                                                        onClick={() => toggleParticipant(name)}
                                                        className={cn(
                                                            "h-9 px-4 rounded-xl text-[10px] font-semibold transition-all border flex items-center gap-2",
                                                            isSelected
                                                                ? "bg-black text-white border-black"
                                                                : "bg-white text-gray-400 border-gray-200 hover:border-[#32dd9e]/50 hover:text-gray-600"
                                                        )}
                                                    >
                                                        {isSelected && <Check className="w-3 h-3 text-[#32dd9e]" />}
                                                        {name}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <>
                                                {!hideManualParticipantEntry && (
                                                    <div className="flex flex-col gap-2 w-full">
                                                        <div className="flex items-end gap-2 w-full">
                                                            <div className="flex-1 space-y-1">
                                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider pl-1">Name</label>
                                                                <Input
                                                                    value={manualName}
                                                                    onChange={(e) => setManualName(e.target.value)}
                                                                    placeholder="e.g. Joe Root"
                                                                    className="h-10 bg-gray-50 border-gray-100 rounded-lg text-xs"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            handleAddManualParticipant();
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email <span className="text-gray-300 font-normal">(Optional)</span></label>
                                                                <Input
                                                                    value={manualEmail}
                                                                    onChange={(e) => setManualEmail(e.target.value)}
                                                                    placeholder="joe.root@gmail.com"
                                                                    className="h-10 bg-gray-50 border-gray-100 rounded-lg text-xs"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            handleAddManualParticipant();
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                id="manual-add-btn"
                                                                onClick={handleAddManualParticipant}
                                                                className="h-10 w-10 bg-black hover:bg-[#32dd9e] text-white rounded-lg p-0 flex items-center justify-center shrink-0"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        <p className="text-[9px] text-gray-400 pl-1">Add email to notify them instantly!</p>
                                                    </div>
                                                )}

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
                                                                {manualEmails[name] && <span className="text-[8px] opacity-70 ml-1">(@)</span>}
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
                                            control={form.control as any}
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
                                            control={form.control as any}
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
                                            control={form.control as any}
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

                                    {/* Category & Recurring */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label icon={<Tag size={12} />} text="Category" />
                                            <FormField
                                                control={form.control as any}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-11 bg-gray-50 border-gray-100 rounded-xl px-4 text-xs font-semibold focus:bg-white">
                                                                    <SelectValue placeholder="Select Category" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                                                {["Food", "Travel", "Rent", "Entertainment", "Utilities", "Other"].map(cat => (
                                                                    <SelectItem key={cat} value={cat} className="text-xs font-medium">{cat}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label icon={<Repeat size={12} />} text="Recurring?" />
                                            <div className="flex gap-2">
                                                <FormField
                                                    control={form.control as any}
                                                    name="isRecurring"
                                                    render={({ field }) => (
                                                        <button
                                                            type="button"
                                                            onClick={() => field.onChange(!field.value)}
                                                            className={cn(
                                                                "h-11 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 flex-1",
                                                                field.value ? "bg-black text-white border-black" : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                                                            )}
                                                        >
                                                            {field.value && <Check size={12} />}
                                                            {field.value ? "Yes" : "No"}
                                                        </button>
                                                    )}
                                                />
                                                {form.watch("isRecurring") && (
                                                    <FormField
                                                        control={form.control as any}
                                                        name="recurringInterval"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-11 w-24 bg-gray-50 border-gray-100 rounded-xl px-2 text-[10px] font-bold uppercase focus:bg-white">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="rounded-xl border-gray-100 min-w-[100px]">
                                                                        <SelectItem value="weekly" className="text-xs">Weekly</SelectItem>
                                                                        <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        </div>
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
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                // Validate file type
                                                                if (!validateImageFile(file)) {
                                                                    toast.error("Invalid file type! Please upload an image file (JPEG, PNG, WebP, or GIF)");
                                                                    e.target.value = ''; // Reset input
                                                                    return;
                                                                }

                                                                // Validate file size (max 5MB for faster upload)
                                                                const maxSize = 5 * 1024 * 1024; // 5MB
                                                                if (file.size > maxSize) {
                                                                    toast.error(`File too large! Max size is ${formatFileSize(maxSize)}`);
                                                                    e.target.value = ''; // Reset input
                                                                    return;
                                                                }

                                                                // Check if online
                                                                if (!isOnline()) {
                                                                    toast.error("No internet connection. Please check and try again.");
                                                                    e.target.value = ''; // Reset input
                                                                    return;
                                                                }

                                                                setIsImageUploading(true);
                                                                const uploadToastId = toast.loading("Compressing image...");

                                                                try {
                                                                    // Step 1: Compress image VERY aggressively for base64
                                                                    // Target: < 500KB for Firestore compatibility
                                                                    const compressedFile = await compressImage(file, 0.2, 300);
                                                                    const savedSize = file.size - compressedFile.size;
                                                                    console.log(`Compressed: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)} (saved ${formatFileSize(savedSize)})`);

                                                                    // Check if compressed file is still too large
                                                                    const maxBase64Size = 500 * 1024; // 500KB limit for base64
                                                                    if (compressedFile.size > maxBase64Size) {
                                                                        toast.error(`Image still too large after compression. Please use an image smaller than 2MB.`, { id: uploadToastId });
                                                                        setBillImage(null);
                                                                        form.setValue("billImageUrl", undefined);
                                                                        e.target.value = '';
                                                                        return;
                                                                    }

                                                                    toast.loading("Processing...", { id: uploadToastId });

                                                                    // Step 2: Convert to base64
                                                                    const reader = new FileReader();

                                                                    reader.onloadend = () => {
                                                                        const base64String = reader.result as string;

                                                                        // Set preview
                                                                        setBillImage(base64String);

                                                                        // Save base64 string directly to form
                                                                        // This will be saved in Firestore
                                                                        form.setValue("billImageUrl", base64String);

                                                                        toast.success(`Bill saved! (${formatFileSize(compressedFile.size)})`, { id: uploadToastId });
                                                                        setIsImageUploading(false);
                                                                    };

                                                                    reader.onerror = () => {
                                                                        toast.error("Failed to process image", { id: uploadToastId });
                                                                        setBillImage(null);
                                                                        form.setValue("billImageUrl", undefined);
                                                                        setIsImageUploading(false);
                                                                    };

                                                                    // Read as base64
                                                                    reader.readAsDataURL(compressedFile);

                                                                } catch (error) {
                                                                    console.error("Image processing failed:", error);

                                                                    let errorMessage = "Failed to process image.";
                                                                    if (error instanceof Error) {
                                                                        errorMessage = `Error: ${error.message}`;
                                                                    }

                                                                    toast.error(errorMessage, { id: uploadToastId });
                                                                    setBillImage(null);
                                                                    form.setValue("billImageUrl", undefined);
                                                                } finally {
                                                                    setIsImageUploading(false);
                                                                    e.target.value = ''; // Reset input for next upload
                                                                }
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
                                            <Label icon={<Wallet size={12} />} text="Payer" />
                                            <FormField
                                                control={form.control as any}
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
                                            <Label icon={<CreditCard size={12} />} text="Split" />
                                            <FormField
                                                control={form.control as any}
                                                name="splitMethod"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-11 border-gray-200 rounded-xl px-4 text-xs font-semibold bg-white shadow-sm">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-gray-100 shadow-xl overflow-hidden">
                                                            <SelectItem value="equally" className="text-xs font-bold italic tracking-tighter">Equally</SelectItem>
                                                            <SelectItem value="percentage" className="text-xs font-bold italic tracking-tighter">By Percent</SelectItem>
                                                            <SelectItem value="exact" className="text-xs font-bold italic tracking-tighter">Exact Amount</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary & Advanced Section */}
                                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 space-y-4">
                                    {/* Multiple Payers Section */}
                                    {paidBy === "multiple" && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#32dd9e]">Who Paid?</span>
                                                <span className="text-[10px] font-bold text-gray-400">Total: ₹{allInvolved.reduce((acc, p) => acc + (Number(payerDetails[p]) || 0), 0)}</span>
                                            </div>

                                            {/* Toggle: Everyone paid their own */}
                                            <div
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                    everyonePaidOwn ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100 hover:border-gray-300"
                                                )}
                                                onClick={() => {
                                                    const newState = !everyonePaidOwn;
                                                    setEveryonePaidOwn(newState);
                                                    if (newState) {
                                                        allInvolved.forEach(p => form.setValue(`splitDetails.${p}`, payerDetails[p] || ""));
                                                        form.setValue("splitMethod", "exact");
                                                    }
                                                }}
                                            >
                                                <div className={cn("w-5 h-5 rounded-lg border flex items-center justify-center transition-colors", everyonePaidOwn ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300")}>
                                                    {everyonePaidOwn && <Check className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Everyone paid for themselves?</span>
                                                    <span className="text-[9px] text-gray-400 font-semibold">Bill amount tracks the sum of payments</span>
                                                </div>
                                            </div>

                                            <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                                {allInvolved.map((person) => (
                                                    <div key={`payer-${person}`} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{person}</span>
                                                        <Input
                                                            placeholder={everyonePaidOwn ? "₹ Spent" : "₹ Paid"}
                                                            className={cn(
                                                                "h-8 w-24 px-2 text-[10px] border-gray-100 rounded-lg text-right font-bold focus:border-[#32dd9e]",
                                                                everyonePaidOwn && "border-blue-200 focus:border-blue-500"
                                                            )}
                                                            value={payerDetails[person] || ""}
                                                            onChange={(e) => {
                                                                if (everyonePaidOwn) {
                                                                    handleOwnShareChange(person, e.target.value);
                                                                } else {
                                                                    form.setValue(`payerDetails.${person}`, e.target.value);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Split Section */}
                                    {(!everyonePaidOwn && (splitMethod === "percentage" || splitMethod === "exact")) && (
                                        <div className="space-y-3 pt-2">
                                            {paidBy === "multiple" && <div className="h-px bg-gray-200 w-full my-2" />}
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">How to Split?</span>
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    {splitMethod === "percentage"
                                                        ? `Total: ${allInvolved.reduce((acc, p) => acc + (Number(splitDetails[p]) || 0), 0)}%`
                                                        : `Total: ₹${allInvolved.reduce((acc, p) => acc + (Number(splitDetails[p]) || 0), 0)}`
                                                    }
                                                </span>
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                                {allInvolved.map((person) => (
                                                    <div key={`split-${person}`} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{person}</span>
                                                        <div className="flex gap-2 items-center">
                                                            {splitMethod === "percentage" ? (
                                                                <Input
                                                                    placeholder="% Share"
                                                                    className="h-8 w-16 px-2 text-[10px] border-gray-100 rounded-lg text-right font-bold focus:border-blue-400"
                                                                    value={splitDetails[person] || ""}
                                                                    onChange={(e) => form.setValue(`splitDetails.${person}`, e.target.value)}
                                                                />
                                                            ) : (
                                                                <Input
                                                                    placeholder="₹ Owed"
                                                                    className="h-8 w-24 px-2 text-[10px] border-gray-100 rounded-lg text-right font-bold focus:border-blue-400"
                                                                    value={splitDetails[person] || ""}
                                                                    onChange={(e) => form.setValue(`splitDetails.${person}`, e.target.value)}
                                                                />
                                                            )}
                                                            <div className="w-16 flex flex-col items-end justify-center opacity-50">
                                                                <span className="text-[8px] text-gray-400 font-bold uppercase leading-none mb-0.5">SHARE</span>
                                                                <span className="text-[10px] text-black font-black leading-none">
                                                                    ₹{splitMethod === "percentage"
                                                                        ? (((Number(amount) || 0) * (Number(splitDetails[person]) || 0)) / 100).toFixed(2)
                                                                        : (Number(splitDetails[person]) || 0).toFixed(2)
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Standard Split Info (Only when no custom split inputs are shown) */}
                                    {!(paidBy === "multiple" || splitMethod === "percentage" || splitMethod === "exact") && (
                                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                                            <div className="w-12 h-12 bg-[#32dd9e]/10 rounded-full flex items-center justify-center">
                                                <img src={logo} alt="SplitWayy" className="w-6 h-6 opacity-80" />
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
                                                ₹{((Number(amount) || 0) / allInvolved.length).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" disabled={isImageUploading} className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-xl text-sm font-bold shadow-xl transition-all hover:scale-[1.01]">
                                {isImageUploading ? "Uploading Image..." : (mode === "edit" ? "Update Expense" : "Add Expense")}
                            </Button>
                        </form>
                    </Form>
                </div>
                {/* Bottom ZigZag / Jagged Edge Effect */}
                <div
                    className="w-full h-4 shrink-0"
                    style={{
                        background: `linear-gradient(135deg, white 8px, transparent 8px), linear-gradient(225deg, white 8px, transparent 8px)`,
                        backgroundSize: '16px 16px',
                        backgroundPosition: 'left top',
                        backgroundRepeat: 'repeat-x'
                    }}
                />
            </DialogContent>
        </Dialog >
    )
}
