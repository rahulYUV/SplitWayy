import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    Timestamp,
    addDoc
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface Expense {
    id: string;
    description: string;
    amount: number;
    participants: string[];
    participantEmails?: string[];
    paidBy: string;
    splitMethod: "equally" | "percentage";
    splitDetails?: Record<string, string>;
    payerDetails?: Record<string, string>;
    date: any;
    groupId?: string | null;
    createdBy: string;
    createdAt: any;
    updatedAt: any;
    currency?: string;
    category?: string;
    notes?: string;
    billImageUrl?: string;
}

const COLLECTION_NAME = "expenses";

// Helper to log activity
const logActivity = async (action: 'create' | 'update' | 'delete', details: any, userId: string) => {
    try {
        await addDoc(collection(db, "activity_logs"), {
            action,
            details,
            userId,
            timestamp: new Date()
        });
    } catch (e) {
        console.error("Failed to log activity:", e);
    }
};

export const createExpense = async (expenseData: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
    const expenseRef = doc(collection(db, COLLECTION_NAME));

    // Build the new expense object, excluding undefined fields
    const newExpense: any = {
        ...expenseData,
        id: expenseRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        date: expenseData.date instanceof Date ? Timestamp.fromDate(expenseData.date) : expenseData.date
    };

    // Remove undefined fields (Firebase doesn't accept undefined)
    Object.keys(newExpense).forEach(key => {
        if (newExpense[key] === undefined) {
            delete newExpense[key];
        }
    });

    await setDoc(expenseRef, newExpense);
    return expenseRef.id;
};

export const getExpenses = async (userId: string, filters?: { groupId?: string, friendId?: string }) => {
    let q = query(collection(db, COLLECTION_NAME), where("createdBy", "==", userId));

    if (filters?.groupId) {
        q = query(collection(db, COLLECTION_NAME), where("groupId", "==", filters.groupId));
    }

    const querySnapshot = await getDocs(q);
    const expenses = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate() : data.date
        } as Expense;
    });

    // Manual sort by date desc
    return expenses.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date.getTime() : 0;
        const dateB = b.date instanceof Date ? b.date.getTime() : 0;
        return dateB - dateA;
    });
};

export const getExpense = async (expenseId: string) => {
    const expenseRef = doc(db, COLLECTION_NAME, expenseId);
    const expenseSnap = await getDoc(expenseRef);
    if (expenseSnap.exists()) {
        const data = expenseSnap.data();
        return {
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate() : data.date
        } as Expense;
    }
    return null;
};

export const updateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Must be logged in");

    const expenseRef = doc(db, "expenses", expenseId);
    await updateDoc(expenseRef, updates);
    await logActivity('update', { ...updates, id: expenseId }, user.uid);
};

export const deleteExpense = async (expenseId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Must be logged in");

    // Fetch first to log details
    const expenseRef = doc(db, "expenses", expenseId);
    const snap = await getDoc(expenseRef);
    if (snap.exists()) {
        const data = snap.data();
        await deleteDoc(expenseRef);
        await logActivity('delete', { ...data, id: expenseId }, user.uid);
    }
};
