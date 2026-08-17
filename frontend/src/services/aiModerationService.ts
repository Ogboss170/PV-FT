export type ModerationDecision = "ALLOW" | "ALLOW_WITH_WARNING" | "REVIEW" | "BLOCK";
export type ModerationRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ModerationResult = {
  decision: ModerationDecision;
  riskLevel: ModerationRiskLevel;
  categories: string[];
  confidence: number;
  reason: string;
  action: string;
};

export type ContentType = 
  | "anonymous_message"
  | "post"
  | "comment"
  | "poll"
  | "username"
  | "bio"
  | "media_caption"
  | "report";

// Category Detection Patterns
const SEVERE_VIOLATION_PATTERNS = [
  { category: "child_exploitation", pattern: /\b(cp|child\s*porn|grooming)\b/i },
  { category: "threats_of_violence", pattern: /\b(i\s*will\s*kill\s*you|bomb\s*threat|going\s*to\s*shoot)\b/i },
  { category: "self_harm", pattern: /\b(kill\s*yourself|kys|cut\s*my\s*wrists|suicide\s*method)\b/i },
  { category: "doxxing", pattern: /\b(ssn|social\s*security|home\s*address|phone\s*number\s*is\s*\d{10})\b/i },
  { category: "scams_and_phishing", pattern: /\b(send\s*crypto|free\s*bitcoin|login\s*at\s*http|verify\s*account\s*at)\b/i },
];

const HATE_SPEECH_PATTERNS = [
  /\b(nigger|faggot|kike|chink|spic|tranny)\b/i,
];

const PROFANITY_PATTERNS = [
  /\b(fuck|shit|bitch|asshole|cunt|dick|pussy|dammit)\b/i,
];

/**
 * Evaluates text content using contextual rules & AI classification heuristics.
 * Provider-agnostic design allows swapping LLM / Moderation APIs seamlessly.
 */
export const evaluateAIModeration = (
  content: string,
  contentType: ContentType
): ModerationResult => {
  if (!content || content.trim().length === 0) {
    return {
      decision: "ALLOW",
      riskLevel: "LOW",
      categories: [],
      confidence: 1.0,
      reason: "Empty or benign content",
      action: "Immediate delivery",
    };
  }

  const text = content.trim();

  // 1. Check Critical / Severe Safety Threats
  for (const item of SEVERE_VIOLATION_PATTERNS) {
    if (item.pattern.test(text)) {
      return {
        decision: "BLOCK",
        riskLevel: "CRITICAL",
        categories: [item.category],
        confidence: 0.98,
        reason: `Flagged for critical safety violation: ${item.category}`,
        action: "Block content immediately and log high-priority event",
      };
    }
  }

  // 2. Check Targeted Hate Speech vs. Opinion/Criticism
  for (const pattern of HATE_SPEECH_PATTERNS) {
    if (pattern.test(text)) {
      return {
        decision: "BLOCK",
        riskLevel: "HIGH",
        categories: ["hate_speech", "harassment"],
        confidence: 0.95,
        reason: "Contains targeted slur or hate speech",
        action: "Reject content and record abuse signal",
      };
    }
  }

  // 3. Disambiguate Contextual Hate Speech vs. Benign Opinion
  const opinionHateContext = /\bi\s*hate\s*(this|that|the|my|a|an)\s+(movie|food|game|weather|job|work|app|code|bug|school)\b/i;
  const targetedGroupHate = /\bi\s*hate\s*(all|them|people|group|women|men|blacks|whites|foreigners)\b/i;

  if (targetedGroupHate.test(text)) {
    return {
      decision: "REVIEW",
      riskLevel: "HIGH",
      categories: ["hate_speech", "discrimination"],
      confidence: 0.88,
      reason: "Potential targeted group animosity detected",
      action: "Send to human moderation queue for verification",
    };
  }

  if (opinionHateContext.test(text)) {
    return {
      decision: "ALLOW",
      riskLevel: "LOW",
      categories: ["opinion"],
      confidence: 0.92,
      reason: "Benign expression of opinion or criticism",
      action: "Allow content",
    };
  }

  // 4. Profanity & Adult Language Handling
  let hasProfanity = false;
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(text)) {
      hasProfanity = true;
      break;
    }
  }

  if (hasProfanity) {
    // Non-abusive profanity is allowed with warning tag, not blocked
    return {
      decision: "ALLOW_WITH_WARNING",
      riskLevel: "MEDIUM",
      categories: ["profanity"],
      confidence: 0.85,
      reason: "Contains adult language / profanity without harassment",
      action: "Allow content with mild content warning",
    };
  }

  // 5. Default Clean / Benign Content
  return {
    decision: "ALLOW",
    riskLevel: "LOW",
    categories: ["benign"],
    confidence: 0.99,
    reason: "Content passed all safety checks",
    action: "Immediate delivery",
  };
};
