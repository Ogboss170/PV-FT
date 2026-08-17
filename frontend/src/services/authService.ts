import { auth, db } from "../firebase";
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  username: string;
  avatarIcon: string;
  avatarGradient: [string, string];
  themeColor: string;
  bio?: string;
  reputationScore: number;
  anonymityLevel: number;
  joinedAt?: any;
};

export const ensureAnonymousAuth = async (): Promise<User> => {
  if (auth.currentUser) return auth.currentUser;
  
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
};

export const createUserProfile = async (
  uid: string,
  profileData: Omit<UserProfile, "uid" | "reputationScore" | "anonymityLevel">
): Promise<UserProfile> => {
  const fullProfile: UserProfile = {
    uid,
    ...profileData,
    reputationScore: 100,
    anonymityLevel: 100,
    joinedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", uid), fullProfile, { merge: true });
  return fullProfile;
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, updates);
};
