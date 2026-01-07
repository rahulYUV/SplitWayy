import { db, storage } from "@/lib/firebase";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    deleteDoc,
    getDocs,
    query,
    where,
    onSnapshot,
    orderBy,
    Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface Expense {
    id: string;
    description: string;
    amount: number;
    paidBy: string;
    participants: string[];
    participantEmails?: string[]; // Added for filtering
    splitMethod: "equally" | "exact" | "percentage";
    splitDetails?: Record<string, number | string>;
    payerDetails?: Record<string, number | string>;
    date: Date | string;
    category?: string;
    billImageUrl?: string | null;
    groupId: string | null;
    createdBy: string;
    recurring?: {
        isRecurring: boolean;
        interval: "weekly" | "monthly";
        active: boolean;
        nextDue: Date | string;
    } | null;
}

const EXPENSES_COLLECTION = "expenses";

export const createExpense = async (expenseData: Omit<Expense, "id">) => {
    // Remove undefined fields to avoid Firestore errors
    const data = Object.fromEntries(
        Object.entries(expenseData).filter(([_, v]) => v !== undefined)
    );

    // Ensure recurring is null if not present

    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
        ...data,
        createdAt: Timestamp.now()
    });
    return { id: docRef.id, ...data };
};

export const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const data = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    const docRef = doc(db, EXPENSES_COLLECTION, id);
    await updateDoc(docRef, data);
};

export const deleteExpense = async (id: string) => {
    const docRef = doc(db, EXPENSES_COLLECTION, id);
    await deleteDoc(docRef);
};

export const getExpenses = async () => {
    // Ideally filter by user participation
    const q = query(collection(db, EXPENSES_COLLECTION), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
};

export const subscribeToExpenses = (callback: (expenses: Expense[]) => void) => {
    const q = query(collection(db, EXPENSES_COLLECTION));
    return onSnapshot(q, (snapshot) => {
        const expenses = snapshot.docs.map(doc => {
            const data = doc.data();
            let date = data.date;
            if (date instanceof Timestamp) {
                date = date.toDate();
            }
            return { id: doc.id, ...data, date } as Expense;
        });
        callback(expenses);
    });
};

export const subscribeToUserExpenses = (userId: string, userEmail: string | null | undefined, callback: (expenses: Expense[]) => void) => {
    let q;
    if (userEmail) {
        // Filter by participantEmails OR createdBy
        // We use participantEmails as primary filter for shared expenses
        // Also include createdBy to ensure user sees what they created even if not in participants (edge case)
        // Firestore restriction: Logical OR with different fields requires composite index.
        // Simpler: Just participantEmails. AddExpenseModal adds creator to participants usually.

        q = query(
            collection(db, EXPENSES_COLLECTION),
            where("participantEmails", "array-contains", userEmail)
        );
    } else {
        // Fallback to createdBy if no email
        q = query(collection(db, EXPENSES_COLLECTION), where("createdBy", "==", userId));
    }

    return onSnapshot(q, (snapshot) => {
        const expenses = snapshot.docs.map(doc => {
            const data = doc.data();
            let date = data.date;
            if (date instanceof Timestamp) {
                date = date.toDate();
            }
            return { id: doc.id, ...data, date } as Expense;
        });
        callback(expenses);
    });
};

export const uploadBillImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `bills/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
};
