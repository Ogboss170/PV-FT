import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

import { auth, db } from "../firebase";

export { auth, db };

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserProfile = {
  uid: string;
  username: string;
  email?: string;
  avatarIcon: string;
  avatarGradient: [string, string];
  themeColor: string;
  bio?: string;
  reputationScore: number;
  anonymityLevel: number;
  joinedAt?: any;
  isAnonymous?: boolean;
};

export type AuthError = {
  code: string;
  message: string;
};

// ─── Auth State Hook ──────────────────────────────────────────────────────────

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
};

// ─── Friendly Error Messages ──────────────────────────────────────────────────

export const getFriendlyError = (code: string): string => {
  const map: Record<string, string> = {
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/user-not-found": "No account found with that email or username.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/popup-closed-by-user": "Sign-in popup was closed before completing.",
    "auth/cancelled-popup-request": "Another sign-in popup is already open.",
    "auth/invalid-credential": "Incorrect email or password. Please try again.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
};

// ─── Email / Password Register ────────────────────────────────────────────────

export const registerWithEmail = async (
  email: string,
  password: string,
  username: string
): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  // Set display name on the Firebase Auth profile
  try {
    await updateProfile(user, { displayName: username });
  } catch (e) {
    console.warn("Could not update profile displayName:", e);
  }

  // Create Firestore user document safely
  try {
    const profile: UserProfile = {
      uid: user.uid,
      username,
      email,
      avatarIcon: "person",
      avatarGradient: ["#8B5CF6", "#06B6D4"],
      themeColor: "#8B5CF6",
      bio: "",
      reputationScore: 100,
      anonymityLevel: 100,
      isAnonymous: false,
      joinedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", user.uid), profile, { merge: true });
  } catch (e) {
    console.warn("Could not write Firestore user document:", e);
  }

  return user;
};

// ─── Email / Password Login ───────────────────────────────────────────────────

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

// ─── Google Sign-In (Web popup) ───────────────────────────────────────────────

export const loginWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;

  // Create Firestore profile if it doesn't already exist
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const profile: UserProfile = {
        uid: user.uid,
        username: user.displayName ?? `User_${user.uid.slice(0, 6)}`,
        email: user.email ?? undefined,
        avatarIcon: "person",
        avatarGradient: ["#8B5CF6", "#06B6D4"],
        themeColor: "#8B5CF6",
        bio: "",
        reputationScore: 100,
        anonymityLevel: 100,
        isAnonymous: false,
        joinedAt: serverTimestamp(),
      };
      await setDoc(userRef, profile, { merge: true });
    }
  } catch (e) {
    console.warn("Could not check/create Firestore Google user document:", e);
  }

  return user;
};

// ─── Anonymous Sign-In ────────────────────────────────────────────────────────

export const ensureAnonymousAuth = async (): Promise<User> => {
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
};

// ─── Password Reset ───────────────────────────────────────────────────────────

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// ─── Profile Helpers ──────────────────────────────────────────────────────────

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
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
  await updateDoc(doc(db, "users", uid), updates as any);
};
