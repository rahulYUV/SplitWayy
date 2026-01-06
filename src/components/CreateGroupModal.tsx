"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Users, X, Plus, Home, Plane, Heart, Layout, Check, Sparkles, Mail } from "lucide-react"
import { toast } from "sonner"

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
import { useExpenses } from "@/context/ExpenseContext"

const groupSchema = z.object({
    name: z.string().min(3, "Group name must be at least 3 characters"),
    type: z.enum(["Home", "Trip", "Couple", "Other"]),
    members: z.array(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email").optional().or(z.literal("")),
    })).min(1, "Add at least one member"),
    groupIcon: z.string().optional(),
})

type GroupFormValues = z.infer<typeof groupSchema>

interface CreateGroupModalProps {
    children: React.ReactNode
}

export function CreateGroupModal({ children }: CreateGroupModalProps) {
    const [open, setOpen] = useState(false)
    const [groupIcon, setGroupIcon] = useState<string | null>(null)
    const { addGroup } = useExpenses()

    const form = useForm<GroupFormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            name: "",
            type: "Home",
            members: [{ name: "", email: "" }],
            groupIcon: undefined,
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "members",
    })

    const onSubmit = async (values: GroupFormValues) => {
        // Clean up empty emails - only include email if it has a value
        const cleanedMembers = values.members.map(m => {
            const member: any = { name: m.name };
            if (m.email && m.email.trim()) {
                member.email = m.email;
            }
            return member;
        })

        try {
            const groupData: any = {
                name: values.name,
                type: values.type,
                members: cleanedMembers,
            };

            // Only add groupIcon if it exists
            if (values.groupIcon) {
                groupData.groupIcon = values.groupIcon;
            }

            await addGroup(groupData)

            toast.success(`Group "${values.name}" created!`, {
                description: `Ready to split expenses with ${values.members.length + 1} people.`,
            })
            setOpen(false)
            form.reset()
            setGroupIcon(null)
        } catch (error) {
            console.error("Failed to create group:", error)
            console.error("Group data:", { name: values.name, type: values.type, members: cleanedMembers })
            toast.error(
                error instanceof Error ? error.message : "Failed to create group. Please try again."
            )
        }
    }

    const groupTypes = [
        { value: "Home", icon: Home, label: "Home" },
        { value: "Trip", icon: Plane, label: "Trip" },
        { value: "Couple", icon: Heart, label: "Couple" },
        { value: "Other", icon: Layout, label: "Other" },
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white border-none rounded-[2.5rem] p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Visual Header */}
                <div className="bg-black px-10 py-8 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#32dd9e] rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-[#32dd9e]/20">
                            <Users className="w-6 h-6 text-black" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-[#32dd9e] font-black uppercase tracking-[0.3em]">Phase 01</span>
                            <DialogTitle className="text-2xl font-black italic uppercase tracking-tight text-white leading-none mt-1">Start a new group</DialogTitle>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all active:scale-90">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                            {/* Group Name Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 flex items-center gap-2">
                                    <Sparkles size={12} className="text-[#32dd9e]" />
                                    The identity
                                </label>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-3xl font-black text-black tracking-tighter leading-none mb-4 block">My group shall be called...</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. FunkyTown"
                                                    className="h-16 text-2xl font-bold bg-gray-50 border-none rounded-2xl px-6 focus:ring-2 focus:ring-[#32dd9e] transition-all placeholder:text-gray-200"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Members Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Group Members</label>
                                    <div className="text-[9px] font-bold text-gray-400 italic">Tip: You're automatically included!</div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 opacity-60">
                                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-xs font-black">YU</div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-black">You</span>
                                            <span className="text-[10px] text-gray-400">Owner</span>
                                        </div>
                                    </div>

                                    {fields.map((field, index) => (
                                        <div key={field.id} className="group flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <FormField
                                                    control={form.control}
                                                    name={`members.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-0">
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        placeholder="Name"
                                                                        className="h-12 bg-gray-50 border-none rounded-xl pl-10 text-xs font-bold focus:bg-white"
                                                                        {...field}
                                                                    />
                                                                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`members.${index}.email`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-0">
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        placeholder="Email address (optional)"
                                                                        className="h-12 bg-gray-50 border-none rounded-xl pl-10 text-xs font-bold focus:bg-white"
                                                                        {...field}
                                                                    />
                                                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="w-10 h-10 border border-gray-100 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 hover:border-red-100 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => append({ name: "", email: "" })}
                                        className="w-full h-12 border-dashed border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#32dd9e] hover:border-[#32dd9e] hover:bg-[#32dd9e]/5 transition-all gap-2"
                                    >
                                        <Plus size={14} />
                                        Add a person
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Type Section */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Group Type</label>
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger className="h-14 border-none bg-gray-50 rounded-2xl px-5 text-xs font-bold shadow-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                                    {groupTypes.map(type => (
                                                        <SelectItem
                                                            key={type.value}
                                                            value={type.value}
                                                            className="rounded-xl h-11 text-xs font-medium focus:bg-[#32dd9e]/10 focus:text-[#32dd9e]"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <type.icon size={14} />
                                                                {type.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                {/* Group Icon Upload */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Group Icon (Optional)</label>
                                    <div className="relative">
                                        {!groupIcon ? (
                                            <label
                                                htmlFor="group-icon-upload"
                                                className="flex flex-col items-center justify-center h-32 w-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#32dd9e] hover:bg-[#32dd9e]/5 transition-all cursor-pointer group"
                                            >
                                                <Layout className="w-8 h-8 text-gray-300 group-hover:text-[#32dd9e] mb-2" />
                                                <span className="text-[9px] text-gray-400 group-hover:text-[#32dd9e] font-bold text-center px-2">Click to upload<br />512x512 recommended</span>
                                                <input
                                                    id="group-icon-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setGroupIcon(reader.result as string);
                                                                form.setValue("groupIcon", reader.result as string);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        ) : (
                                            <div className="relative h-32 w-32 bg-gray-50 border-2 border-gray-200 rounded-2xl overflow-hidden group">
                                                <img src={groupIcon} alt="Group icon preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setGroupIcon(null);
                                                        form.setValue("groupIcon", undefined);
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Final Save */}
                            <div className="pt-6 border-t border-gray-100 flex gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                    className="h-14 flex-1 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-14 flex-[2] bg-black hover:bg-black/90 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 group transition-all"
                                >
                                    Create Group Now
                                    <Check className="w-4 h-4 group-hover:scale-125 transition-transform text-[#32dd9e]" />
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
