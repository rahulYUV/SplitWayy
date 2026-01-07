import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    query,
    orderBy,
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
    };
    createdBy: string; // userId
    createdAt: Date;
    relatedGroupId?: string;
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

export const subscribeToActivities = (callback: (activities: Activity[]) => void) => {
    // Basic query for now
    const q = query(
        collection(db, ACTIVITY_COLLECTION),
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
                // Clone to avoid mutation issues if firestore returns frozen object? usually fine
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
