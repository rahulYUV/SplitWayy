import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    query,
    orderBy,
    where,
    onSnapshot,
    Timestamp
} from "firebase/firestore";

export interface Activity {
    id: string;
    type: "create_group" | "delete_group" | "add_expense" | "settle_up" | "update_expense" | "delete_expense";
    description: string;
    details?: {
        groupName?: string;
        amount?: number;
        paidBy?: string;
        participants?: string[];
        date?: Date;
        deletedAt?: Date;
        createdAt?: Date;
        changes?: { field: string; oldValue: any; newValue: any }[];
    };
    createdBy: string; // Display Name or Email (Legacy)
    userId?: string; // The actual UID of the creator
    createdAt: Date;
    relatedGroupId?: string;
    expenseId?: string;
    visibleToUserEmails?: string[]; // Array of emails who can see this activity
}

const ACTIVITY_COLLECTION = "activities";

export const logActivity = async (activityData: Omit<Activity, "id" | "createdAt">) => {
    try {
        await addDoc(collection(db, ACTIVITY_COLLECTION), {
            ...activityData,
            createdAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error logging activity:", error);
    }
};

export const subscribeToActivities = (userId: string | undefined, userEmail: string | null | undefined, callback: (activities: Activity[]) => void) => {
    let q;

    if (userEmail) {
        // Filter activities where the user is in the visibility list
        q = query(
            collection(db, ACTIVITY_COLLECTION),
            where("visibleToUserEmails", "array-contains", userEmail),
            orderBy("createdAt", "desc")
        );
    } else if (userId) {
        // Fallback: only show activities created by this user if no email (e.g. anonymous or missing email)
        // Note: This misses shared activities from others, but ensures privacy.
        q = query(
            collection(db, ACTIVITY_COLLECTION),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
    } else {
        // No user identified? Return empty to be safe, or public activities if any.
        // Returning empty to prevent leak.
        callback([]);
        return () => { };
    }

    return onSnapshot(q, (snapshot) => {
        const activities = snapshot.docs.map(doc => {
            const data = doc.data();
            let createdAt = data.createdAt;
            if (createdAt instanceof Timestamp) {
                createdAt = createdAt.toDate();
            }

            // Parse nested dates if any
            let details = data.details || {};
            if (details && typeof details === 'object') {
                details = { ...details };
                if (details.deletedAt instanceof Timestamp) details.deletedAt = details.deletedAt.toDate();
                if (details.createdAt instanceof Timestamp) details.createdAt = details.createdAt.toDate();
                if (details.date instanceof Timestamp) details.date = details.date.toDate();
            }

            return { id: doc.id, ...data, createdAt, details } as Activity;
        });
        callback(activities);
    }, (error) => {
        // Handle index errors or permission errors gracefully
        console.warn("Activity subscription error (likely missing index or permission):", error);
        callback([]);
    });
};

export const subscribeToExpenseActivities = (expenseId: string, callback: (activities: Activity[]) => void) => {
    const q = query(
        collection(db, ACTIVITY_COLLECTION),
        where("expenseId", "==", expenseId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const activities = snapshot.docs.map(doc => {
            const data = doc.data();
            let createdAt = data.createdAt;
            if (createdAt instanceof Timestamp) {
                createdAt = createdAt.toDate();
            }

            // Parse nested dates if any
            let details = data.details || {};
            if (details && typeof details === 'object') {
                details = { ...details };
                if (details.deletedAt instanceof Timestamp) details.deletedAt = details.deletedAt.toDate();
                if (details.createdAt instanceof Timestamp) details.createdAt = details.createdAt.toDate();
                if (details.date instanceof Timestamp) details.date = details.date.toDate();
            }

            return { id: doc.id, ...data, createdAt, details } as Activity;
        });
        callback(activities);
    });
};
