import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Comment {
    id: string;
    expenseId: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: any;
}

const COLLECTION_NAME = "comments";

export const createComment = async (commentData: Omit<Comment, "id" | "createdAt">) => {
    const commentRef = doc(collection(db, COLLECTION_NAME));
    const newComment = {
        ...commentData,
        id: commentRef.id,
        createdAt: serverTimestamp(),
    };
    await setDoc(commentRef, newComment);
    return commentRef.id;
};

export const getComments = async (expenseId: string) => {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("expenseId", "==", expenseId),
        orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Comment);
};
