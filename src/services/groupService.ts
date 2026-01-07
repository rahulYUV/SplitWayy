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
    or,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface GroupMember {
    id?: string;
    name: string;
    email?: string;
}

export interface Group {
    id: string;
    name: string;
    type: "Home" | "Trip" | "Couple" | "Other";
    members: GroupMember[];
    createdBy: string;
    createdAt: any;
    updatedAt: any;
    simplifyDebts: boolean;
    inviteLink?: string;
    memberEmails?: string[];
    groupIcon?: string;
}

const COLLECTION_NAME = "groups";

export const createGroup = async (groupData: Omit<Group, "id" | "createdAt" | "updatedAt">, userId?: string) => {
    const groupRef = doc(collection(db, COLLECTION_NAME));

    // Ensure memberEmails is populated for searching
    const memberEmails = groupData.members
        .map(m => m.email)
        .filter((email): email is string => !!email);

    const newGroup: any = {
        ...groupData,
        id: groupRef.id,
        memberEmails,
        createdBy: userId || groupData.createdBy, // Ensure createdBy is set
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    // Remove undefined fields (Firebase doesn't accept undefined)
    Object.keys(newGroup).forEach(key => {
        if (newGroup[key] === undefined) {
            delete newGroup[key];
        }
    });

    await setDoc(groupRef, newGroup);
    return groupRef.id;
};

export const getGroups = async (userId: string, userEmail?: string | null) => {
    let q;
    if (userEmail) {
        q = query(
            collection(db, COLLECTION_NAME),
            or(
                where("createdBy", "==", userId),
                where("memberEmails", "array-contains", userEmail)
            )
        );
    } else {
        q = query(collection(db, COLLECTION_NAME), where("createdBy", "==", userId));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    } as Group));
};

export const getGroup = async (groupId: string) => {
    const groupRef = doc(db, COLLECTION_NAME, groupId);
    const groupSnap = await getDoc(groupRef);
    if (groupSnap.exists()) {
        return {
            ...groupSnap.data(),
            id: groupSnap.id
        } as Group;
    }
    return null;
};

export const updateGroup = async (groupId: string, data: Partial<Group>) => {
    const groupRef = doc(db, COLLECTION_NAME, groupId);
    await updateDoc(groupRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
};

export const deleteGroup = async (groupId: string) => {
    const groupRef = doc(db, COLLECTION_NAME, groupId);
    await deleteDoc(groupRef);
};

export const addUserToGroup = async (groupId: string, member: GroupMember) => {
    const groupRef = doc(db, COLLECTION_NAME, groupId);
    const updateData: any = {
        members: arrayUnion(member),
        updatedAt: serverTimestamp()
    };
    if (member.email) {
        updateData.memberEmails = arrayUnion(member.email);
    }
    await updateDoc(groupRef, updateData);
};

export const removeUserFromGroup = async (groupId: string, member: GroupMember) => {
    const groupRef = doc(db, COLLECTION_NAME, groupId);
    const updateData: any = {
        members: arrayRemove(member),
        updatedAt: serverTimestamp()
    };
    if (member.email) {
        updateData.memberEmails = arrayRemove(member.email);
    }
    await updateDoc(groupRef, updateData);
};

export const subscribeToUserGroups = (userId: string, userEmail: string | null | undefined, callback: (groups: Group[]) => void) => {
    let q;
    if (userEmail) {
        q = query(
            collection(db, COLLECTION_NAME),
            or(
                where("createdBy", "==", userId),
                where("memberEmails", "array-contains", userEmail)
            )
        );
    } else {
        q = query(collection(db, COLLECTION_NAME), where("createdBy", "==", userId));
    }

    return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Group));
        callback(groups);
    });
};
