import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
    onSnapshot,
    collection,
    query,
    where,
    or,
    Timestamp
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createExpense } from "@/services/expenseService";
import { createGroup } from "@/services/groupService";
import { getFriends, Friend } from "@/services/friendService";

export interface Expense {
    id: string;
    description: string;
    amount: number;
    participants: string[]; // Names of participants
    participantEmails?: string[]; // List of emails for sync
    paidBy: string; // Name of person or "multiple"
    splitMethod: "equally" | "percentage";
    splitDetails?: Record<string, string>;
    payerDetails?: Record<string, string>;
    date: Date;
    groupId?: string | null; // Optional group ID
    createdBy: string;
    billImageUrl?: string; // Optional bill image URL
    category?: string;
    notes?: string;
}

export interface GroupMember {
    name: string;
    email?: string;
}

export interface Group {
    id: string;
    name: string;
    type: "Home" | "Trip" | "Couple" | "Other";
    members: GroupMember[];
    groupIcon?: string;
    createdBy: string;
}

interface ExpenseContextType {
    expenses: Expense[];
    groups: Group[];
    friends: Friend[];
    addExpense: (expense: Omit<Expense, "id" | "createdBy">) => Promise<string | void>;
    addGroup: (group: Omit<Group, "id" | "createdBy">) => Promise<string | void>;
    getFriendBalance: (friendName: string) => number;
    getGroupExpenses: (groupId: string) => Expense[];
    loading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                setUserEmail(user.email);
                setUserName(user.displayName);
            } else {
                setUserId(null);
                setUserEmail(null);
                setUserName(null);
                setExpenses([]);
                setGroups([]);
                setFriends([]);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // 1. Listen for dynamic expenses
        const qExpenses = query(
            collection(db, "expenses"),
            // I created it
            or(
                // I created it
                where("createdBy", "==", userId),
                // I am a participant (by name)
                where("participants", "array-contains", userName || "You"),

                // Let's also check strict email matching if available
                ...(userEmail ? [where("participantEmails", "array-contains", userEmail)] : [])
            )
        );
        const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
            const expenseData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
                } as Expense;
            });
            // Manual sort since we removed index-based sort
            const sortedExpenses = expenseData.sort((a, b) => b.date.getTime() - a.date.getTime());
            setExpenses(sortedExpenses);
            setLoading(false);
        }, (error) => {
            console.error("Error in expenses snapshot:", error);
            setLoading(false);
        });

        // 2. Listen for dynamic groups
        const qGroups = userEmail
            ? query(
                collection(db, "groups"),
                or(
                    where("createdBy", "==", userId),
                    where("memberEmails", "array-contains", userEmail)
                )
            )
            : query(collection(db, "groups"), where("createdBy", "==", userId));

        const unsubGroups = onSnapshot(qGroups, (snapshot) => {
            const groupData = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            } as Group));
            setGroups(groupData);
        }, (error) => {
            console.error("Error in groups snapshot:", error);
        });

        // 3. Fetch friends (not real-time for now, but could be)
        getFriends(userId).then(setFriends);

        return () => {
            unsubExpenses();
            unsubGroups();
        };
    }, [userId, userEmail, userName]);

    const addExpense = async (expenseData: Omit<Expense, "id" | "createdBy">) => {
        if (!userId) return;
        try {
            return await createExpense({
                ...expenseData,
                createdBy: userId,
            });
        } catch (error) {
            console.error("Error adding expense:", error);
            throw error;
        }
    };

    const addGroup = async (groupData: Omit<Group, "id" | "createdBy">) => {
        if (!userId) return;
        try {
            return await createGroup({
                ...groupData,
                createdBy: userId,
                simplifyDebts: true
            });
        } catch (error) {
            console.error("Error adding group:", error);
            throw error;
        }
    };

    const getGroupExpenses = (groupId: string) => {
        return expenses.filter(e => e.groupId === groupId);
    };

    const getFriendBalance = (friendName: string) => {
        let netBalance = 0;

        expenses.forEach((expense) => {
            const allParticipants = ["You", ...expense.participants];
            if (!allParticipants.includes(friendName)) return;

            // 1. Calculate Everyone's Share
            const shares: Record<string, number> = {};
            allParticipants.forEach(name => {
                if (expense.splitMethod === "equally") {
                    shares[name] = expense.amount / allParticipants.length;
                } else {
                    const percent = Number(expense.splitDetails?.[name] || 0);
                    shares[name] = (expense.amount * percent) / 100;
                }
            });

            // 2. Calculate Everyone's Payment
            const payments: Record<string, number> = {};
            if (expense.paidBy === "multiple") {
                allParticipants.forEach(name => {
                    payments[name] = Number(expense.payerDetails?.[name] || 0);
                });
            } else {
                allParticipants.forEach(name => {
                    payments[name] = (expense.paidBy === name || (expense.paidBy === "You" && name === "You")) ? expense.amount : 0;
                });
            }

            // 3. Pairwise Debt Logic
            // What I owe the friend: my share of their overpayment
            // What they owe me: their share of my overpayment

            const myShare = shares["You"] || 0;
            const myPayment = payments["You"] || 0;
            const friendShare = shares[friendName] || 0;
            const friendPayment = payments[friendName] || 0;

            const myOverpayment = Math.max(0, myPayment - myShare);
            const myUnderpayment = Math.max(0, myShare - myPayment);
            const friendOverpayment = Math.max(0, friendPayment - friendShare);
            const friendUnderpayment = Math.max(0, friendShare - friendPayment);

            const totalUnderpayment = allParticipants.reduce((sum, name) => sum + Math.max(0, shares[name] - payments[name]), 0);
            const totalOverpayment = allParticipants.reduce((sum, name) => sum + Math.max(0, payments[name] - shares[name]), 0);

            // If I overpaid and they underpaid
            if (myOverpayment > 0 && friendUnderpayment > 0 && totalOverpayment > 0) {
                // They owe me a fraction of my overpayment
                netBalance += myOverpayment * (friendUnderpayment / totalUnderpayment);
            }

            // If they overpaid and I underpaid
            if (friendOverpayment > 0 && myUnderpayment > 0 && totalOverpayment > 0) {
                // I owe them a fraction of their overpayment
                netBalance -= friendOverpayment * (myUnderpayment / totalUnderpayment);
            }
        });

        return netBalance;
    };

    return (
        <ExpenseContext.Provider value={{ expenses, groups, friends, addExpense, addGroup, getFriendBalance, getGroupExpenses, loading }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (!context) {
        throw new Error("useExpenses must be used within an ExpenseProvider");
    }
    return context;
};
