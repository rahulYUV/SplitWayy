import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    currency: string;
    timezone?: string;
    language?: string;
    allowRecommendations?: boolean;
    phoneNumber?: string;
    createdAt?: any;
    lastLogin?: any;
    recentVisits?: Array<{
        timestamp: any;
        userAgent: string;
        ip?: string; // Optional, might be hard to get client-side accurately
    }>;
    sessionRevokedAt?: any;
    isDeactivated?: boolean;
    deactivatedAt?: any;
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
};

export const syncUserProfile = async (user: any, additionalData?: Partial<UserProfile>) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const currentVisit = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
    };

    let existingVisits = userSnap.data()?.recentVisits || [];
    // Keep only last 5 visits
    existingVisits = [currentVisit, ...existingVisits].slice(0, 5);

    const userData: Partial<UserProfile> = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || userSnap.data()?.displayName || "New User",
        // Prioritize existing Firestore photoURL (e.g. custom avatar) over Auth photoURL
        photoURL: userSnap.data()?.photoURL || user.photoURL || "",
        currency: additionalData?.currency || userSnap.data()?.currency || "INR",
        timezone: userSnap.data()?.timezone || "GMT+05:30",
        language: userSnap.data()?.language || "English",
        allowRecommendations: userSnap.data()?.allowRecommendations ?? false,
        phoneNumber: userSnap.data()?.phoneNumber || "",
        recentVisits: existingVisits,
    };

    if (!userSnap.exists()) {
        // New User
        try {
            await setDoc(userRef, {
                ...userData,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error creating user profile:", error);
        }
    } else {
        // Existing User - Update last login
        try {
            await updateDoc(userRef, {
                lastLogin: serverTimestamp(),
                displayName: user.displayName || userSnap.data().displayName,
                // Avoid overwriting custom avatar with Auth photo
                photoURL: userSnap.data().photoURL || user.photoURL,
                recentVisits: existingVisits,
            });
        } catch (error) {
            console.error("Error updating user profile:", error);
        }
    }

    return userData as UserProfile;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, "users", uid);
    try {
        await updateDoc(userRef, data);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

export const revokeAllSessions = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    try {
        await updateDoc(userRef, {
            sessionRevokedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error revoking sessions:", error);
        throw error;
    }
};

export const updateUserCurrency = async (uid: string, currency: string) => {
    const userRef = doc(db, "users", uid);
    try {
        await updateDoc(userRef, { currency });
    } catch (error) {
        console.error("Error updating currency:", error);
        throw error;
    }
};

export const deactivateUser = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    try {
        await updateDoc(userRef, {
            isDeactivated: true,
            deactivatedAt: serverTimestamp(),
            sessionRevokedAt: serverTimestamp() // Also log out of all devices
        });
    } catch (error) {
        console.error("Error deactivating user:", error);
        throw error;
    }
};
