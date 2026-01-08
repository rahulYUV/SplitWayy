import React, { createContext, useContext, useEffect, useState } from "react";
import { Expense, subscribeToUserExpenses, createExpense, updateExpense, deleteExpense } from "@/services/expenseService";
import { subscribeToUserFriends, Friend } from "@/services/friendService";
export type { Expense };
import { toast } from "sonner";
import { Group, subscribeToUserGroups, createGroup } from "@/services/groupService";
import { logActivity } from "@/services/activityService";
import { User } from "firebase/auth";

interface ExpenseContextType {
    expenses: Expense[];
    groups: Group[];
    friends: { id?: string; name: string; email?: string; avatar?: string; displayName?: string }[];
    loading: boolean;
    addExpense: (expense: Omit<Expense, "id" | "createdBy">) => Promise<void>;
    editExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
    removeExpense: (id: string) => Promise<void>;
    addGroup: (groupData: Omit<Group, "id" | "createdAt" | "updatedAt">) => Promise<void>;
    getGroupExpenses: (groupId: string) => Expense[];
    getFriendBalance: (friendName: string) => number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children, user }: { children: React.ReactNode; user?: User | null }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [userFriends, setUserFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setExpenses([]);
            setGroups([]);
            setLoading(false);
            return;
        }

        const unsubExpenses = subscribeToUserExpenses(user.uid, user.email, (data) => {
            // Sort client-side to avoid Index requirements
            const sortedData = data.sort((a, b) => {
                const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
                const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
                return dateB - dateA;
            });
            setExpenses(sortedData);
            setLoading(false);
        });

        const unsubGroups = subscribeToUserGroups(user.uid, user.email, (data) => {
            setGroups(data);
        });

        const unsubFriends = subscribeToUserFriends(user.uid, (data) => {
            setUserFriends(data);
        });

        return () => {
            unsubExpenses();
            unsubGroups();
            unsubFriends();
        };
    }, [user]);

    const addExpense = async (expenseData: Omit<Expense, "id" | "createdBy">) => {
        try {
            // Ensure creator's email is in participantEmails so they can see the expense
            const pEmails = new Set(expenseData.participantEmails || []);
            if (user?.email) {
                pEmails.add(user.email);
            }

            // Ensure creator is in participants list (as "You" or their name)
            const participants = new Set(expenseData.participants || []);
            if (!participants.size) {
                participants.add("You");
            }

            const newExpense = {
                ...expenseData,
                participants: Array.from(participants),
                participantEmails: Array.from(pEmails),
                createdBy: user?.uid || "unknown"
            };

            await createExpense(newExpense as any);
            toast.success("Expense added successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to add expense.");
        }
    };

    const addGroup = async (groupData: Omit<Group, "id" | "createdAt" | "updatedAt">) => {
        try {
            if (!user) throw new Error("Must be logged in to create group");

            // Add creator as member explicitly if not already
            const members = [...groupData.members];
            const isCreatorIn = members.some(m => m.name === "You" || m.email === user.email);
            if (!isCreatorIn) {
                // Force add creator so they are part of the group and splits
                members.push({
                    name: "You",
                    email: user.email || undefined
                });
            }

            await createGroup({ ...groupData, members }, user.uid);

            // Log Activity
            await logActivity({
                type: "create_group",
                description: `Group "${groupData.name}" was created`,
                details: {
                    groupName: groupData.name,
                    participants: members.map(m => m.name),
                    createdAt: new Date()
                },
                createdBy: user.displayName || user.email || "You",
                userId: user.uid,
                visibleToUserEmails: members.map(m => m.email).filter((e): e is string => !!e)
            });

            // toast success handled in component or here? Component handles it.
        } catch (error) {
            console.error(error);
            throw error; // Re-throw for component handling
        }
    };

    const editExpense = async (id: string, updates: Partial<Expense>) => {
        try {
            await updateExpense(id, updates);
            toast.success("Expense updated!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update expense.");
        }
    };

    const removeExpense = async (id: string) => {
        try {
            // Find expense details before deleting for logging
            const expenseToDelete = expenses.find(e => e.id === id);

            await deleteExpense(id);

            if (expenseToDelete) {
                await logActivity({
                    type: "delete_expense",
                    description: `Deleted expense: ${expenseToDelete.description}`,
                    details: {
                        amount: expenseToDelete.amount,
                        paidBy: expenseToDelete.paidBy,
                        participants: expenseToDelete.participants,
                        date: expenseToDelete.date instanceof Date ? expenseToDelete.date : new Date(expenseToDelete.date),
                        deletedAt: new Date(),
                        groupName: groups.find(g => g.id === expenseToDelete.groupId)?.name
                    },
                    createdBy: user?.displayName || user?.email || "You",
                    userId: user?.uid,
                    visibleToUserEmails: [
                        ...(expenseToDelete.participantEmails || []),
                        user?.email
                    ].filter((e): e is string => !!e),
                    relatedGroupId: expenseToDelete.groupId || undefined
                });
            }

            toast.success("Expense deleted.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete expense.");
        }
    };

    const getGroupExpenses = (groupId: string) => {
        return expenses.filter(e => e.groupId === groupId);
    };

    const getFriendBalance = (friendName: string) => {
        let netBalance = 0;
        const lowerFriendName = friendName.toLowerCase().trim();

        // Determine "My Name" used in expenses
        const myNames = ["You"];
        if (user?.displayName) myNames.push(user.displayName);
        if (user?.displayName?.split(' ')[0]) myNames.push(user.displayName.split(' ')[0]);
        // Normalize my names
        const lowerMyNames = myNames.map(n => n.toLowerCase().trim());

        expenses.forEach(expense => {
            const payerLower = expense.paidBy.toLowerCase().trim();
            const isPayerMe = lowerMyNames.includes(payerLower);
            const isPayerFriend = payerLower === lowerFriendName;

            // Participation Check
            const participantsLower = expense.participants.map(p => p.toLowerCase().trim());
            const isFriendInvolved = participantsLower.includes(lowerFriendName);
            const amIInvolved = participantsLower.some(p => lowerMyNames.includes(p));

            if (!isFriendInvolved && !amIInvolved) return;

            const count = expense.participants.length;

            let amount = 0;
            if (expense.splitMethod === "equally") {
                if (count > 0) {
                    amount = expense.amount / count;
                }
            } else if (expense.splitMethod === "exact") {
                if (isPayerMe) {
                    // Find friend key
                    const key = Object.keys(expense.splitDetails || {}).find(k => k.toLowerCase().trim() === lowerFriendName);
                    if (key) amount = Number(expense.splitDetails?.[key] || 0);
                } else if (isPayerFriend) {
                    // Find me key
                    const keys = Object.keys(expense.splitDetails || {});
                    for (const myName of lowerMyNames) {
                        const key = keys.find(k => k.toLowerCase().trim() === myName);
                        if (key) {
                            const val = Number(expense.splitDetails?.[key] || 0);
                            if (val > 0) {
                                amount = val;
                                break;
                            }
                        }
                    }
                }
            } else if (expense.splitMethod === "percentage") {
                if (isPayerMe) {
                    const key = Object.keys(expense.splitDetails || {}).find(k => k.toLowerCase().trim() === lowerFriendName);
                    if (key) {
                        const p = Number(expense.splitDetails?.[key] || 0);
                        amount = (expense.amount * p) / 100;
                    }
                } else if (isPayerFriend) {
                    let p = 0;
                    const keys = Object.keys(expense.splitDetails || {});
                    for (const myName of lowerMyNames) {
                        const key = keys.find(k => k.toLowerCase().trim() === myName);
                        if (key) {
                            const val = Number(expense.splitDetails?.[key] || 0);
                            if (val > 0) {
                                p = val;
                                break;
                            }
                        }
                    }
                    amount = (expense.amount * p) / 100;
                }
            }

            if (isPayerMe && isFriendInvolved) {
                netBalance += amount;
            } else if (isPayerFriend && amIInvolved) {
                netBalance -= amount;
            }
        });

        return netBalance;
    };

    // Derive friends list from groups AND explicit friends
    const friends = React.useMemo(() => {
        const unique = new Map<string, { id?: string; name: string; email?: string; avatar?: string; displayName?: string }>();

        // 1. Add explicit friends first (they have IDs)
        userFriends.forEach(f => {
            // Normalized key
            unique.set(f.displayName.toLowerCase().trim(), {
                id: f.id,
                name: f.displayName,
                email: f.email,
                displayName: f.displayName
            });
        });

        // 2. Add Group Members if not already present
        groups.forEach(g => {
            g.members.forEach(m => {
                const isMe =
                    m.name === "You" ||
                    (user?.email && m.email === user.email) ||
                    (user?.displayName && m.name.toLowerCase().trim() === user.displayName.toLowerCase().trim());

                if (!isMe && !unique.has(m.name.toLowerCase().trim())) {
                    unique.set(m.name.toLowerCase().trim(), { ...m, displayName: m.name });
                }
            });
        });
        return Array.from(unique.values());
    }, [groups, userFriends, user]);

    return (
        <ExpenseContext.Provider value={{
            expenses,
            groups,
            friends,
            loading,
            addExpense,
            editExpense,
            removeExpense,
            addGroup,
            getGroupExpenses,
            getFriendBalance
        }}>
            {children}
        </ExpenseContext.Provider>
    );
}

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error("useExpenses must be used within an ExpenseProvider");
    }
    return context;
};
