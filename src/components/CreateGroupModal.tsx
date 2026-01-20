"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Users, X, Plus, Home, Plane, Heart, Layout } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "react-router-dom"

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
})

type GroupFormValues = z.infer<typeof groupSchema>

interface CreateGroupModalProps {
    children?: React.ReactNode
}

export function CreateGroupModal({ children }: CreateGroupModalProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { addGroup } = useExpenses()
    const [searchParams, setSearchParams] = useSearchParams()

    // Open if query param exists
    React.useEffect(() => {
        if (searchParams.get('create_group') === 'true') {
            setOpen(true)
        }
    }, [searchParams])

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            // Remove query param when closing
            const newParams = new URLSearchParams(searchParams)
            newParams.delete('create_group')
            setSearchParams(newParams, { replace: true })
        }
    }

    const form = useForm<GroupFormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            name: "",
            type: "Home",
            members: [{ name: "", email: "" }],
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

            await addGroup(groupData)

            toast.success(`Group "${values.name}" created!`, {
                description: `Ready to split expenses with ${values.members.length + 1} people.`,
            })
            handleOpenChange(false)
            form.reset()
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
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-2 border-gray-100 rounded-3xl p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh] [&>button]:hidden">
                {/* Clean Header */}
                <div className="relative border-b border-gray-100 bg-white/50 px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                                New Group
                            </DialogTitle>
                            <p className="text-xs text-gray-500 font-medium">Create a space for shared expenses</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenChange(false)}
                        className="bg-gray-50 hover:bg-gray-100 p-2 rounded-xl transition-all text-gray-500 hover:text-gray-900"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* Group Name Section */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">
                                                Group Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. Summer Trip 2024"
                                                    className="h-14 text-lg font-semibold bg-gray-50 border border-gray-200 rounded-2xl px-5 focus:border-gray-400 focus:bg-white focus:ring-0 transition-all placeholder:text-gray-300"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Type Section */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Group Type</label>
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="h-14 border border-gray-200 bg-gray-50 rounded-2xl px-5 text-sm font-semibold shadow-sm hover:bg-white hover:border-gray-300 transition-all">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border border-gray-100 shadow-xl p-1 bg-white">
                                                {groupTypes.map(type => (
                                                    <SelectItem
                                                        key={type.value}
                                                        value={type.value}
                                                        className="rounded-lg h-10 text-sm font-medium focus:bg-gray-50 cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <type.icon size={14} className="text-gray-500" />
                                                            {type.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {/* Members Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Members
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    {/* Member Input Fields */}
                                    {fields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="group flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
                                        >
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <FormField
                                                    control={form.control}
                                                    name={`members.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-0">
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Name"
                                                                    className="h-11 bg-white border border-gray-200 rounded-xl px-4 text-sm font-medium focus:border-gray-400 focus:ring-0 transition-all"
                                                                    {...field}
                                                                />
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
                                                                <Input
                                                                    placeholder="Email (Optional)"
                                                                    className="h-11 bg-white border border-gray-200 rounded-xl px-4 text-sm font-medium focus:border-gray-400 focus:ring-0 transition-all"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
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
                                        className="w-full h-11 border border-dashed border-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-all gap-2"
                                    >
                                        <Plus size={14} />
                                        Add Member
                                    </Button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 flex gap-4">
                                <Button
                                    disabled={isLoading}
                                    className="h-12 flex-1 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl hover:shadow-gray-900/10 flex items-center justify-center gap-2 transition-all"
                                >
                                    {isLoading ? "Creating..." : "Create Group"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
