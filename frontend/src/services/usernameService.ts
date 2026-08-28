/**
 * usernameService.ts
 * Client-side wrappers for the username Cloud Functions.
 * All critical operations (availability check, claim, change) go through
 * Firebase Cloud Functions — never trusted from the client alone.
 */

import { getFunctions, httpsCallable } from "firebase/functions";
import { doc, getDoc } from "firebase/firestore";
import app from "../firebase";
import { db } from "../firebase";

const functions = getFunctions(app);

// ─── Types ────────────────────────────────────────────────────────────────────

export type UsernameAvailabilityResult = {
  available: boolean;
  reason?: string;
  isCurrent?: boolean;
};

export type ClaimUsernameResult = {
  success: boolean;
};

export type ChangeUsernameResult = {
  success: boolean;
  noop?: boolean;
};

// ─── Callable references ──────────────────────────────────────────────────────

const _checkUsernameAvailability = httpsCallable<
  { username: string },
  UsernameAvailabilityResult
>(functions, "checkUsernameAvailability");

const _claimUsername = httpsCallable<
  { username: string },
  ClaimUsernameResult
>(functions, "claimUsername");

const _changeUsername = httpsCallable<
  { newUsername: string },
  ChangeUsernameResult
>(functions, "changeUsername");

// ─── Client helpers ───────────────────────────────────────────────────────────

/**
 * Check if a username is available.
 * Debounce calls from the UI — this hits Firestore on every call.
 */
export const checkUsernameAvailability = async (
  username: string
): Promise<UsernameAvailabilityResult> => {
  try {
    const result = await _checkUsernameAvailability({ username });
    return result.data;
  } catch (e: any) {
    return { available: false, reason: e?.message ?? "Could not check availability." };
  }
};

/**
 * Claim a username during the registration / create-profile flow.
 * Safe to call multiple times — idempotent if same user, same username.
 */
export const claimUsername = async (username: string): Promise<ClaimUsernameResult> => {
  const result = await _claimUsername({ username });
  return result.data;
};

/**
 * Change an existing username.
 * Throws with a friendly message if the 60-day cooldown is active.
 */
export const changeUsername = async (newUsername: string): Promise<ChangeUsernameResult> => {
  const result = await _changeUsername({ newUsername });
  return result.data;
};

/**
 * Look up a user's uid by their username (case-insensitive).
 * Used to resolve profile URLs like /@username → uid.
 */
export const getUidByUsername = async (username: string): Promise<string | null> => {
  const lower = username.toLowerCase().trim().replace(/^@/, "");
  const snap = await getDoc(doc(db, "usernames", lower));
  if (!snap.exists()) return null;
  return snap.data()?.uid ?? null;
};

/**
 * Calculate how many days until the user can change their username again.
 * Returns 0 if they are eligible right now.
 */
export const getDaysUntilUsernameChange = (nextUsernameChangeAt: any): number => {
  if (!nextUsernameChangeAt) return 0;
  const nextDate = nextUsernameChangeAt?.toDate?.() ?? new Date(nextUsernameChangeAt);
  const msRemaining = nextDate.getTime() - Date.now();
  if (msRemaining <= 0) return 0;
  return Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
};
