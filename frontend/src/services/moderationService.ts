import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  arrayUnion
} from "firebase/firestore";

export type ModerationReport = {
  id: string;
  reporterId: string;
  targetType: "post" | "user" | "comment";
  targetId: string;
  targetContent?: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: any;
};

export const reportItemInFirestore = async (reportData: {
  reporterId: string;
  targetType: "post" | "user" | "comment";
  targetId: string;
  targetContent?: string;
  reason: string;
}) => {
  const reportsRef = collection(db, "moderation_reports");
  return await addDoc(reportsRef, {
    ...reportData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

export const blockUserInFirestore = async (currentUserId: string, blockedUserId: string) => {
  const userRef = doc(db, "users", currentUserId);
  await updateDoc(userRef, {
    blockedUsers: arrayUnion(blockedUserId),
  });
};

export const subscribeToPendingReports = (callback: (reports: ModerationReport[]) => void) => {
  const reportsRef = collection(db, "moderation_reports");
  const q = query(reportsRef, where("status", "==", "pending"), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const list: ModerationReport[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        reporterId: data.reporterId || "anon",
        targetType: data.targetType || "post",
        targetId: data.targetId || "",
        targetContent: data.targetContent || "No preview content",
        reason: data.reason || "Inappropriate content",
        status: data.status || "pending",
        createdAt: data.createdAt,
      };
    });
    callback(list);
  });
};

export const resolveReportInFirestore = async (reportId: string, action: "resolved" | "dismissed") => {
  const reportRef = doc(db, "moderation_reports", reportId);
  await updateDoc(reportRef, {
    status: action,
    resolvedAt: serverTimestamp(),
  });
};

export const deleteReportedPostInFirestore = async (postId: string, reportId: string) => {
  const postRef = doc(db, "posts", postId);
  await deleteDoc(postRef);
  await resolveReportInFirestore(reportId, "resolved");
};
