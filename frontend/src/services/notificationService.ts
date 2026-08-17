import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc
} from "firebase/firestore";
import { Notification } from "../mockData";

export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  const notifRef = collection(db, "notifications");
  const q = query(notifRef, where("recipientId", "==", userId), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const list: Notification[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        type: data.type || "like",
        actor: data.actor || "Anonymous Voice",
        actorGradient: data.actorGradient || ["#06B6D4", "#0284C7"],
        text: data.text || "",
        time: data.createdAt ? "Just now" : "1m",
        unread: data.unread ?? true,
      };
    });
    callback(list);
  });
};

export const createNotificationInFirestore = async (notifData: {
  recipientId: string;
  type: "like" | "comment" | "follow" | "mention" | "community";
  actor: string;
  actorGradient: [string, string];
  text: string;
}) => {
  const notifRef = collection(db, "notifications");
  await addDoc(notifRef, {
    ...notifData,
    unread: true,
    createdAt: serverTimestamp(),
  });
};

export const markNotificationsAsRead = async (notificationIds: string[]) => {
  for (const id of notificationIds) {
    const ref = doc(db, "notifications", id);
    await updateDoc(ref, { unread: false });
  }
};
