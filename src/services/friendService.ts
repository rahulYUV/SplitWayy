import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Friend {
    id: string;
    email?: string;
    firstName: string;
    lastName?: string;
    displayName: string;
    addedBy: string;
    createdAt: any;
    status: "confirmed" | "pending";
}

const COLLECTION_NAME = "friends";

export const addFriend = async (userId: string, friendData: Omit<Friend, "id" | "addedBy" | "createdAt" | "status">) => {
    const friendRef = doc(collection(db, COLLECTION_NAME));
    const newFriend = {
        ...friendData,
        id: friendRef.id,
        addedBy: userId,
        status: "confirmed",
        createdAt: serverTimestamp(),
    };
    await setDoc(friendRef, newFriend);
    return friendRef.id;
};

export const getFriends = async (userId: string) => {
    const q = query(collection(db, COLLECTION_NAME), where("addedBy", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Friend);
};

export const deleteFriend = async (friendId: string) => {
    const friendRef = doc(db, COLLECTION_NAME, friendId);
    await deleteDoc(friendRef);
};
