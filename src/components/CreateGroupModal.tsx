"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Users, X, Plus, Home, Plane, Heart, Layout, Sparkles, Mail, ArrowRight, UserPlus } from "lucide-react"
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
    const [isLoading, setIsLoading] = useState(false)
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
        setIsLoading(true)
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
            toast.error(
                error instanceof Error ? error.message : "Failed to create group. Please try again."
            )
        } finally {
            setIsLoading(false)
        }
    }

    const groupTypes = [
        { value: "Home", icon: Home, label: "Home", gradient: "from-blue-400 to-blue-600" },
        { value: "Trip", icon: Plane, label: "Trip", gradient: "from-purple-400 to-purple-600" },
        { value: "Couple", icon: Heart, label: "Couple", gradient: "from-pink-400 to-pink-600" },
        { value: "Other", icon: Layout, label: "Other", gradient: "from-gray-400 to-gray-600" },
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-white border-none rounded-3xl p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh] [&>button]:hidden">
                {/* Modern Header with Gradient */}
                <div className="relative bg-gradient-to-br from-[#ff6d2f] via-[#ff8552] to-[#ffaa7f] px-8 md:px-10 py-8 md:py-10 text-white shrink-0">
                    {/* Animated background patterns */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>

                    <div className="relative z-10 flex items-start justify-between">
                        <div className="flex items-start gap-4 md:gap-5">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-black/10">
                                <Users className="w-7 h-7 md:w-8 md:h-8 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] md:text-xs text-white/80 font-bold uppercase tracking-[0.3em] mb-2">Phase 01</span>
                                <DialogTitle className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                                    Start a New Group
                                </DialogTitle>
                                <p className="text-sm text-white/70 mt-2 hidden sm:block">Create and manage shared expenses easily</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2.5 rounded-xl transition-all active:scale-90"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* ZigZag Bottom Edge (Receipt Style) */}
                    <div
                        className="absolute bottom-0 left-0 w-full h-3 z-20"
                        style={{
                            background: "linear-gradient(45deg, transparent 33.33%, #ffffff 33.33%, #ffffff 66.66%, transparent 66.66%), linear-gradient(-45deg, transparent 33.33%, #ffffff 33.33%, #ffffff 66.66%, transparent 66.66%)",
                            backgroundSize: "16px 32px",
                            backgroundPosition: "0 16px",
                            backgroundRepeat: "repeat-x"
                        }}
                    />
                </div>

                <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 md:py-10 custom-scrollbar">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 md:space-y-10">

                            {/* Group Name Section */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#ff6d2f] flex items-center gap-2">
                                    <Sparkles size={14} className="text-[#ff6d2f]" />
                                    The Identity
                                </label>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight mb-3 block">
                                                My group shall be called...
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        placeholder="e.g., Beach Vacation Squad"
                                                        className="h-14 md:h-16 text-lg md:text-xl font-semibold bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl px-6 focus:border-[#ff6d2f] focus:ring-4 focus:ring-[#ff6d2f]/10 transition-all placeholder:text-gray-300 shadow-sm"
                                                        {...field}
                                                    />
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#ff6d2f]/0 via-[#ff6d2f]/5 to-[#ff6d2f]/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Members Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                                        <UserPlus size={14} />
                                        Group Members
                                    </label>
                                    <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        <span className="hidden sm:inline">💡 </span>You're auto-included!
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Current User Card */}
                                    <div className="relative flex items-center gap-3 bg-gradient-to-r from-[#ff6d2f]/10 to-[#ff8552]/10 border-2 border-[#ff6d2f]/20 p-4 md:p-5 rounded-2xl">
                                        <div className="absolute top-2 right-2 bg-[#ff6d2f] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">OWNER</div>
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#ff6d2f] to-[#ff8552] rounded-xl flex items-center justify-center text-white text-sm md:text-base font-black shadow-lg">
                                            YU
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm md:text-base font-bold text-gray-900">You</span>
                                            <span className="text-xs text-gray-500">Group creator</span>
                                        </div>
                                    </div>

                                    {/* Member Input Fields */}
                                    {fields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="group flex items-center gap-2 md:gap-3 animate-in fade-in slide-in-from-top-4 duration-300 bg-white border-2 border-gray-100 hover:border-gray-200 rounded-2xl p-3 md:p-4 transition-all"
                                        >
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                                                <FormField
                                                    control={form.control}
                                                    name={`members.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-0">
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        placeholder="Friend's name"
                                                                        className="h-11 md:h-12 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 text-sm font-medium focus:bg-white focus:border-[#ff6d2f] focus:ring-2 focus:ring-[#ff6d2f]/10 transition-all"
                                                                        {...field}
                                                                    />
                                                                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                                                                        placeholder="email@example.com"
                                                                        className="h-11 md:h-12 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 text-sm font-medium focus:bg-white focus:border-[#ff6d2f] focus:ring-2 focus:ring-[#ff6d2f]/10 transition-all"
                                                                        {...field}
                                                                    />
                                                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="w-10 h-10 md:w-11 md:h-11 border-2 border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add Person Button */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => append({ name: "", email: "" })}
                                        className="w-full h-12 md:h-14 border-2 border-dashed border-gray-200 rounded-2xl text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-[#ff6d2f] hover:border-[#ff6d2f] hover:bg-[#ff6d2f]/5 transition-all gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <Plus size={16} className="shrink-0" />
                                        <span className="hidden sm:inline">Add Another Person</span>
                                        <span className="sm:hidden">Add Person</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Type and Icon Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                {/* Type Section */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Group Type</label>
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger className="h-14 md:h-16 border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl px-5 text-sm font-semibold shadow-sm hover:border-gray-300 transition-all">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                                                    {groupTypes.map(type => (
                                                        <SelectItem
                                                            key={type.value}
                                                            value={type.value}
                                                            className="rounded-xl h-12 text-sm font-medium focus:bg-gradient-to-r focus:from-[#ff6d2f]/10 focus:to-[#ff8552]/10 focus:text-[#ff6d2f] mb-1"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center text-white`}>
                                                                    <type.icon size={16} />
                                                                </div>
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
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Group Icon <span className="text-gray-400">(Optional)</span></label>
                                    <div className="relative">
                                        {!groupIcon ? (
                                            <label
                                                htmlFor="group-icon-upload"
                                                className="flex flex-col items-center justify-center h-32 w-full md:h-36 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#ff6d2f] hover:from-[#ff6d2f]/5 hover:to-[#ff8552]/5 transition-all cursor-pointer group"
                                            >
                                                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mb-2 group-hover:from-[#ff6d2f] group-hover:to-[#ff8552] transition-all">
                                                    <Layout className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-600 group-hover:text-[#ff6d2f]">Click to upload</span>
                                                <span className="text-xs text-gray-400 mt-1">512x512 recommended</span>
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
                                            <div className="relative h-32 md:h-36 w-full bg-gray-50 border-2 border-gray-200 rounded-2xl overflow-hidden group shadow-lg">
                                                <img src={groupIcon} alt="Group icon preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setGroupIcon(null);
                                                            form.setValue("groupIcon", undefined);
                                                        }}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 md:gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                    className="h-12 md:h-14 flex-1 rounded-2xl text-sm font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-100 order-2 sm:order-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isLoading}
                                    className="h-12 md:h-14 flex-[2] bg-gradient-to-r from-[#ff6d2f] to-[#ff8552] hover:from-[#ff8552] hover:to-[#ffaa7f] text-white rounded-2xl text-sm font-bold uppercase tracking-wider shadow-xl hover:shadow-2xl hover:shadow-[#ff6d2f]/20 flex items-center justify-center gap-3 group transition-all order-1 sm:order-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            Create Group Now
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
