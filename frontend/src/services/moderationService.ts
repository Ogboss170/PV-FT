import { db, auth } from "../firebase";
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
} from "firebase/firestore";
import { ModerationResult } from "./aiModerationService";

export type ModerationEvent = {
  id: string;
  contentId: string;
  contentType: string;
  decision: string;
  riskLevel: string;
  categories: string[];
  confidence: number;
  reason: string;
  status: "pending" | "approved" | "removed" | "incorrect_ai";
  createdAt: any;
  reviewedAt?: any;
};

export const createModerationEventInFirestore = async (
  contentId: string,
  contentType: string,
  result: ModerationResult
) => {
  const eventsRef = collection(db, "moderationEvents");
  return await addDoc(eventsRef, {
    contentId,
    contentType,
    decision: result.decision,
    riskLevel: result.riskLevel,
    categories: result.categories,
    confidence: result.confidence,
    reason: result.reason,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

export const subscribeToModerationEvents = (
  callback: (events: ModerationEvent[]) => void
) => {
  const eventsRef = collection(db, "moderationEvents");
  const q = query(eventsRef, where("status", "==", "pending"), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const list: ModerationEvent[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        contentId: data.contentId || "",
        contentType: data.contentType || "anonymous_message",
        decision: data.decision || "REVIEW",
        riskLevel: data.riskLevel || "HIGH",
        categories: data.categories || [],
        confidence: data.confidence || 0.9,
        reason: data.reason || "High risk content requiring review",
        status: data.status || "pending",
        createdAt: data.createdAt,
      };
    });
    callback(list);
  });
};

export const updateModerationEventStatus = async (
  eventId: string,
  newStatus: "approved" | "removed" | "incorrect_ai"
) => {
  const eventRef = doc(db, "moderationEvents", eventId);
  await updateDoc(eventRef, {
    status: newStatus,
    reviewedAt: serverTimestamp(),
  });
};
