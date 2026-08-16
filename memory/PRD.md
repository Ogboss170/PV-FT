# Private Voices — Product Requirements (UI-Only MVP)

**Tagline:** Speak Freely. Stay Anonymous.

## Scope
This build is **UI-only** — no backend, auth, AI, or database. All data is mocked in `/app/frontend/src/mockData.ts`. All screens are high-fidelity, interactive, dark-mode-first with premium glassmorphism.

## Design System
- Palette: Deep Navy `#0F172A`, Card `#1E293B`, Accent Electric Cyan `#06B6D4`, Success `#10B981`, Warning `#F59E0B`, Error `#EF4444`
- Radii 8/16/20/24, spacing 4→48, Inter typography
- Glass cards via `expo-blur` + tinted underlay; soft neon glows on FAB/avatar rings
- Icons: `@expo/vector-icons` Ionicons

## Screens Delivered
| Screen | Route | Key Elements |
|---|---|---|
| Splash | `/` | Animated glowing gradient logo → auto-redirects to onboarding |
| Onboarding | `/onboarding` | 3 swipeable pages, Google/Apple/Email buttons, Get Started, Skip |
| Create Profile | `/create-profile` | Username, 12 mask avatars, 6 theme colors, bio, privacy note |
| Home Feed | `/(tabs)` | Sticky header, filter chips, AI picks card, post cards (text/image/poll) with like/comment/repost/share/save, floating cyan FAB |
| Explore | `/(tabs)/explore` | Search, tabs (Trending/New/Popular/Nearby), hero, trending hashtags, creators row, community grid |
| Create Post | `/(tabs)/create` | Community picker, text area, visibility (Public/Followers/Community), poll builder, always-ON anonymous toggle, AI kindness helper |
| Chats | `/(tabs)/chats` | Search, filter tabs with unread badge, chat list with online dots and unread counts |
| Conversation | `/chat/[id]` | Anonymous header with online status, gradient bubbles for own msgs, typing indicator, glass input row |
| Profile | `/(tabs)/profile` | Cover banner, glowing avatar, verified chip, stats, Edit CTA, Reputation card with progress, Achievements strip, Recent/Saved/Communities tabs |
| Communities | `/communities` | Filter chips, cover-based cards with member badge, Join/Joined toggle |
| Notifications | `/notifications` | Category tabs, unread highlight, typed action pills, Follow-back CTA |
| Settings | `/settings` | Sectioned rows: Privacy, Preferences (Dark mode always on, Notifications, Language, Theme), Support, Logout |

## Tech
- Expo Router, React Native 0.81, Reanimated 4, expo-blur, expo-linear-gradient, expo-haptics, expo-image
- Only local state / mock data — no MongoDB, no APIs, no auth

## Notes
- Anonymity toggle in Create Post is permanently ON by design.
- AI features referenced in UI (AI kindness check, Smart Community picks) are **visual placeholders only** — no LLM wired.
- All auth buttons on Onboarding are non-functional (visual only).
- 100% dark-mode; no light theme.

## Next Actions (post-review)
- Wire backend + MongoDB CRUD for posts, communities, chats.
- Add real auth (Emergent Google + custom email).
- Integrate AI kindness check + smart community suggestions.
- Add voice notes & video posts.
