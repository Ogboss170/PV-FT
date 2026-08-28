/**
 * analyticsService.ts
 * Firebase/Google Analytics integration for Private Voices.
 * Tracks all key social events without exposing PII.
 */

import { Platform } from "react-native";

let _analytics: any = null;
let _logEvent: any = null;

async function getAnalytics() {
  if (_analytics) return { analytics: _analytics, logEvent: _logEvent };
  try {
    if (Platform.OS === "web") {
      const { getAnalytics: _ga, logEvent: _le, isSupported } = await import("firebase/analytics");
      const supported = await isSupported();
      if (supported) {
        const { default: app } = await import("../firebase");
        _analytics = _ga(app);
        _logEvent = _le;
      }
    }
  } catch (_) {}
  return { analytics: _analytics, logEvent: _logEvent };
}

export async function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    const { analytics, logEvent } = await getAnalytics();
    if (analytics && logEvent) {
      logEvent(analytics, eventName, params);
    }
  } catch (_) {}
}

export const trackAccountCreated = (method: "email" | "google" | "anonymous") =>
  trackEvent("account_created", { method });

export const trackLogin = (method: "email" | "google" | "anonymous") =>
  trackEvent("login", { method });

export const trackProfileViewed = (isOwnProfile: boolean) =>
  trackEvent("profile_viewed", { own: isOwnProfile });

export const trackFollowUser = () => trackEvent("follow_user");
export const trackUnfollowUser = () => trackEvent("unfollow_user");

export const trackWhisperSent = () => trackEvent("whisper_sent");
export const trackWhisperReceived = () => trackEvent("whisper_received");

export const trackPostCreated = (hasImages: boolean, hasPoll: boolean) =>
  trackEvent("post_created", { has_images: hasImages, has_poll: hasPoll });

export const trackPostViewed = () => trackEvent("post_viewed");
export const trackPostLiked = () => trackEvent("post_liked");
export const trackCommentPosted = () => trackEvent("comment_posted");
export const trackPostShared = () => trackEvent("post_shared");
export const trackPostReported = () => trackEvent("post_reported");
export const trackUserBlocked = () => trackEvent("user_blocked");
export const trackUsernameChanged = () => trackEvent("username_changed");

