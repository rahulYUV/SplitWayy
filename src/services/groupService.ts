import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    writeBatch
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

    // Deduplicate members by email (primary) and name (secondary)
    const uniqueMembers: GroupMember[] = [];
    const seenEmails = new Set<string>();
    const seenNames = new Set<string>();

    groupData.members.forEach(member => {
        const normalizedName = member.name.toLowerCase().trim();
        const normalizedEmail = member.email?.toLowerCase().trim();

        // Check if already added by email or name
        if (normalizedEmail) {
            if (!seenEmails.has(normalizedEmail)) {
                seenEmails.add(normalizedEmail);
                uniqueMembers.push(member);
            }
        } else {
            if (!seenNames.has(normalizedName)) {
                seenNames.add(normalizedName);
                uniqueMembers.push(member);
            }
        }
    });

    // Ensure memberEmails is populated for searching
    const memberEmails = uniqueMembers
        .map(m => m.email)
        .filter((email): email is string => !!email);

    const newGroup: any = {
        ...groupData,
        members: uniqueMembers,
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
            where("memberEmails", "array-contains", userEmail)
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
    // 1. Delete the group document
    const groupRef = doc(db, COLLECTION_NAME, groupId);

    // 2. Cascade delete expenses linked to this group
    const expensesQ = query(collection(db, "expenses"), where("groupId", "==", groupId));
    const expenseSnap = await getDocs(expensesQ);

    const batch = writeBatch(db);
    batch.delete(groupRef);

    expenseSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
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
            where("memberEmails", "array-contains", userEmail)
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
