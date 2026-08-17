import { colors, gradients } from "./theme";

export type Post = {
  id: string;
  username: string;
  avatarColor: readonly [string, string];
  avatarIcon: string;
  community: string;
  communityEmoji: string;
  time: string;
  text: string;
  image?: string;
  poll?: { question: string; options: { label: string; votes: number }[]; total: number };
  likes: number;
  comments: number;
  reposts: number;
  liked?: boolean;
  saved?: boolean;
};

export type Community = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  members: string;
  cover: string;
  gradient: readonly [string, string];
  joined?: boolean;
};

export type ChatThread = {
  id: string;
  nickname: string;
  avatarColor: readonly [string, string];
  avatarIcon: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
};

export type Notification = {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "community";
  actor: string;
  actorGradient: readonly [string, string];
  text: string;
  time: string;
  unread: boolean;
};

export const AVATAR_GRADIENTS: readonly (readonly [string, string])[] = [
  ["#06B6D4", "#0284C7"],
  ["#8B5CF6", "#EC4899"],
  ["#10B981", "#06B6D4"],
  ["#F59E0B", "#EF4444"],
  ["#EC4899", "#8B5CF6"],
  ["#22D3EE", "#3B82F6"],
];

export const AVATAR_ICONS = [
  "planet",
  "flash",
  "flame",
  "diamond",
  "sparkles",
  "moon",
  "leaf",
  "paw",
  "rocket",
  "cube",
  "hexagon",
  "aperture",
];

export const THEME_COLORS = [
  "#06B6D4",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#EF4444",
];

export const posts: Post[] = [
  {
    id: "0",
    username: "WisdomEcho",
    avatarColor: AVATAR_GRADIENTS[1],
    avatarIcon: "sparkles",
    community: "Life",
    communityEmoji: "✨",
    time: "2m",
    text: "What's something you wish you could tell your younger self?",
    likes: 1890,
    comments: 342,
    reposts: 120,
    liked: true,
  },
  {
    id: "1",
    username: "ShadowFox_42",
    avatarColor: AVATAR_GRADIENTS[0],
    avatarIcon: "flash",
    community: "Technology",
    communityEmoji: "💻",
    time: "12m",
    text: "Just discovered that a well-designed anonymous space feels more honest than any social profile I've ever had. Something about not performing changes everything.",
    likes: 1284,
    comments: 96,
    reposts: 42,
  },
  {
    id: "2",
    username: "MidnightEcho",
    avatarColor: AVATAR_GRADIENTS[1],
    avatarIcon: "moon",
    community: "Mental Health",
    communityEmoji: "🧠",
    time: "34m",
    text: "Slow week. Reminding myself that resting is productive too. Anyone else been giving themselves permission to just… pause?",
    likes: 892,
    comments: 214,
    reposts: 18,
    liked: true,
  },
  {
    id: "3",
    username: "NeonWolf",
    avatarColor: AVATAR_GRADIENTS[2],
    avatarIcon: "flame",
    community: "Gaming",
    communityEmoji: "🎮",
    time: "1h",
    text: "Which sci-fi world would you actually want to live in?",
    poll: {
      question: "Pick your dimension",
      options: [
        { label: "Cyberpunk 2077", votes: 412 },
        { label: "Star Wars", votes: 623 },
        { label: "Blade Runner", votes: 289 },
        { label: "The Matrix", votes: 176 },
      ],
      total: 1500,
    },
    likes: 462,
    comments: 88,
    reposts: 12,
  },
  {
    id: "4",
    username: "QuietStar",
    avatarColor: AVATAR_GRADIENTS[3],
    avatarIcon: "sparkles",
    community: "Relationships",
    communityEmoji: "❤️",
    time: "2h",
    text: "Told my partner today that anonymity here helped me practice honesty out loud. Small wins.",
    image: "https://images.unsplash.com/photo-1541702467897-41915a07d3a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwyfHxjeWJlcnB1bmslMjBuZW9uJTIwY2l0eSUyMG5pZ2h0JTIwcGhvdG9ncmFwaHl8ZW58MHx8fHwxNzg1ODc0NTA3fDA&ixlib=rb-4.1.0&q=85",
    likes: 3420,
    comments: 512,
    reposts: 210,
    saved: true,
  },
  {
    id: "5",
    username: "GhostByte",
    avatarColor: AVATAR_GRADIENTS[4],
    avatarIcon: "planet",
    community: "Business",
    communityEmoji: "💼",
    time: "3h",
    text: "Startup lesson of the week: the customer you don't want to lose is the one who complains the loudest. They're doing your product work for free.",
    likes: 2140,
    comments: 143,
    reposts: 89,
  },
];

export const communities: Community[] = [
  {
    id: "c1",
    name: "Relationships",
    emoji: "❤️",
    description: "Real talk on love, dating & connection",
    members: "482K",
    cover: "https://images.unsplash.com/photo-1649303526325-4aa3ffbd7643?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxyZWxhdGlvbnNoaXBzJTIwbG92ZSUyMGFic3RyYWN0JTIwZ2xvd2luZyUyMGhlYXJ0JTIwbmVvbnxlbnwwfHx8fDE3ODU4NzQ1MTZ8MA&ixlib=rb-4.1.0&q=85",
    gradient: gradients.pinkSoft,
    joined: true,
  },
  {
    id: "c2",
    name: "Business",
    emoji: "💼",
    description: "Founders, ideas & the honest grind",
    members: "312K",
    cover: "https://images.unsplash.com/photo-1666048181106-e3ec64e75c70?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBuZW9uJTIwY29udHJvbGxlciUyMGVzcG9ydHMlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3ODU4NzQ1MTV8MA&ixlib=rb-4.1.0&q=85",
    gradient: gradients.amberSoft,
  },
  {
    id: "c3",
    name: "Technology",
    emoji: "💻",
    description: "The future, unfiltered",
    members: "1.2M",
    cover: "https://images.unsplash.com/photo-1532883031962-d3574f99541b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwZnV0dXJpc3RpYyUyMGNpcmN1aXQlMjBib2FyZCUyMG5lb24lMjBtYWNyb3xlbnwwfHx8fDE3ODU4NzQ1MTV8MA&ixlib=rb-4.1.0&q=85",
    gradient: gradients.brandSoft,
    joined: true,
  },
  {
    id: "c4",
    name: "Students",
    emoji: "🎓",
    description: "Study, stress & everything in between",
    members: "224K",
    cover: "https://images.unsplash.com/photo-1576344581549-060a332463d2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHw0fHxjeWJlcnB1bmslMjBuZW9uJTIwY2l0eSUyMG5pZ2h0JTIwcGhvdG9ncmFwaHl8ZW58MHx8fHwxNzg1ODc0NTA3fDA&ixlib=rb-4.1.0&q=85",
    gradient: gradients.violetSoft,
  },
  {
    id: "c5",
    name: "Gaming",
    emoji: "🎮",
    description: "Games, guilds & great debates",
    members: "876K",
    cover: "https://images.unsplash.com/photo-1666048181106-e3ec64e75c70?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBuZW9uJTIwY29udHJvbGxlciUyMGVzcG9ydHMlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3ODU4NzQ1MTV8MA&ixlib=rb-4.1.0&q=85",
    gradient: gradients.violetSoft,
  },
  {
    id: "c6",
    name: "Football",
    emoji: "⚽",
    description: "Match talk, hot takes & rivalries",
    members: "654K",
    cover: "https://images.unsplash.com/photo-1541702467897-41915a07d3a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwyfHxjeWJlcnB1bmslMjBuZW9uJTIwY2l0eSUyMG5pZ2h0JTIwcGhvdG9ncmFwaHl8ZW58MHx8fHwxNzg1ODc0NTA3fDA&ixlib=rb-4.1.0&q=85",
    gradient: gradients.emeraldSoft,
  },
  {
    id: "c7",
    name: "Nigeria",
    emoji: "🇳🇬",
    description: "Voices from home & diaspora",
    members: "198K",
    cover: "https://images.unsplash.com/photo-1677080865283-26f94ed332f1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzZ8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdsb3dpbmclMjBlbGVjdHJpYyUyMGN5YW4lMjBnZW9tZXRyaWMlMjAzRCUyMHNoYXBlfGVufDB8fHx8MTc4NTg3NDUwOHww&ixlib=rb-4.1.0&q=85",
    gradient: gradients.emeraldSoft,
  },
  {
    id: "c8",
    name: "Mental Health",
    emoji: "🧠",
    description: "A safe place to be heard",
    members: "421K",
    cover: "https://images.unsplash.com/photo-1642879320437-15658d5668f1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBjYWxtJTIwZ2xvd2luZyUyMGFic3RyYWN0JTIwbWVkaXRhdGlvbnxlbnwwfHx8fDE3ODU4NzQ1MTV8MA&ixlib=rb-4.1.0&q=85",
    gradient: gradients.violetSoft,
    joined: true,
  },
];

export const trendingTags = [
  { tag: "#Relationships", posts: "48.2K", category: "Trending" },
  { tag: "#School", posts: "32.1K", category: "Trending" },
  { tag: "#Work", posts: "29.4K", category: "Trending" },
  { tag: "#Life", posts: "54.8K", category: "Trending" },
  { tag: "#Nigeria", posts: "19.8K", category: "Regional" },
  { tag: "#USA", posts: "41.0K", category: "Regional" },
  { tag: "#Anonymous", posts: "62.3K", category: "Core" },
];

export const suggestedCreators = [
  { name: "SilentDrift", followers: "12.4K", icon: "planet", gradient: AVATAR_GRADIENTS[0] },
  { name: "VelvetGhost", followers: "8.2K", icon: "moon", gradient: AVATAR_GRADIENTS[1] },
  { name: "CipherRose", followers: "6.7K", icon: "flame", gradient: AVATAR_GRADIENTS[4] },
  { name: "NovaWhisper", followers: "5.3K", icon: "sparkles", gradient: AVATAR_GRADIENTS[2] },
];

export const chats: ChatThread[] = [
  {
    id: "ch1",
    nickname: "ShadowFox_42",
    avatarColor: AVATAR_GRADIENTS[0],
    avatarIcon: "flash",
    lastMessage: "That's honestly the best take I've heard all week 🔥",
    time: "2m",
    unread: 3,
    online: true,
  },
  {
    id: "ch2",
    nickname: "MidnightEcho",
    avatarColor: AVATAR_GRADIENTS[1],
    avatarIcon: "moon",
    lastMessage: "Thank you for saying that. I really needed to hear it.",
    time: "18m",
    unread: 1,
    online: true,
  },
  {
    id: "ch3",
    nickname: "NeonWolf",
    avatarColor: AVATAR_GRADIENTS[2],
    avatarIcon: "flame",
    lastMessage: "Voice message · 0:24",
    time: "1h",
    unread: 0,
  },
  {
    id: "ch4",
    nickname: "QuietStar",
    avatarColor: AVATAR_GRADIENTS[3],
    avatarIcon: "sparkles",
    lastMessage: "Okay let's chat again tomorrow ✨",
    time: "3h",
    unread: 0,
  },
  {
    id: "ch5",
    nickname: "GhostByte",
    avatarColor: AVATAR_GRADIENTS[4],
    avatarIcon: "planet",
    lastMessage: "The founder path is lonely but you're not alone here.",
    time: "1d",
    unread: 0,
  },
];

export const conversation = [
  { id: "m1", fromMe: false, text: "Hey — that post you made on quiet wins really landed with me.", time: "10:04" },
  { id: "m2", fromMe: true, text: "Thanks for saying that. It's why this place feels different — no faces, just words.", time: "10:06" },
  { id: "m3", fromMe: false, text: "Exactly. Freedom to be honest without any of the noise.", time: "10:07" },
  { id: "m4", fromMe: true, text: "Been thinking about how anonymity + kindness scales when you get the design right.", time: "10:09" },
  { id: "m5", fromMe: false, text: "That's honestly the best take I've heard all week 🔥", time: "10:11" },
];

export const notifications: Notification[] = [
  { id: "n1", type: "like", actor: "MidnightEcho", actorGradient: AVATAR_GRADIENTS[1], text: "liked your post in Mental Health", time: "2m", unread: true },
  { id: "n2", type: "comment", actor: "ShadowFox_42", actorGradient: AVATAR_GRADIENTS[0], text: "commented: \"This is exactly it.\"", time: "12m", unread: true },
  { id: "n3", type: "follow", actor: "CipherRose", actorGradient: AVATAR_GRADIENTS[4], text: "started following you anonymously", time: "34m", unread: true },
  { id: "n4", type: "mention", actor: "NovaWhisper", actorGradient: AVATAR_GRADIENTS[2], text: "mentioned you in a Business thread", time: "1h", unread: false },
  { id: "n5", type: "community", actor: "Technology", actorGradient: AVATAR_GRADIENTS[5], text: "new post from a community you joined", time: "2h", unread: false },
  { id: "n6", type: "like", actor: "QuietStar", actorGradient: AVATAR_GRADIENTS[3], text: "and 42 others liked your poll", time: "5h", unread: false },
];

export const achievements = [
  { id: "a1", name: "First Echo", icon: "sparkles", color: colors.brand, unlocked: true },
  { id: "a2", name: "Kind Voice", icon: "heart", color: "#EC4899", unlocked: true },
  { id: "a3", name: "Deep Thread", icon: "chatbubbles", color: colors.success, unlocked: true },
  { id: "a4", name: "Community Builder", icon: "people", color: colors.warning, unlocked: false },
  { id: "a5", name: "Trusted Anon", icon: "shield-checkmark", color: "#8B5CF6", unlocked: false },
];

export type Whisper = {
  id: string;
  message: string;
  time: string;
  unread: boolean;
  mood?: "kind" | "curious" | "confession" | "question";
  reactions?: number;
};

export const whispers: Whisper[] = [
  {
    id: "w1",
    message: "Your post on quiet wins genuinely changed how I show up on Monday mornings. Thank you for putting words to it.",
    time: "3m",
    unread: true,
    mood: "kind",
    reactions: 0,
  },
  {
    id: "w2",
    message: "How do you stay this honest online without spiraling? Asking for a friend who is very much me.",
    time: "18m",
    unread: true,
    mood: "question",
  },
  {
    id: "w3",
    message: "I've been reading your echoes silently for weeks. Today I finally posted my first one. Wanted you to know.",
    time: "1h",
    unread: true,
    mood: "confession",
    reactions: 12,
  },
  {
    id: "w4",
    message: "Do you actually believe anonymity brings out kindness? I want to, but the internet keeps proving me wrong.",
    time: "4h",
    unread: false,
    mood: "curious",
    reactions: 3,
  },
  {
    id: "w5",
    message: "You dropped this 👑 — keep being the softest voice in the room.",
    time: "1d",
    unread: false,
    mood: "kind",
    reactions: 24,
  },
];


export type Comment = {
  id: string;
  username: string;
  avatarColor: readonly [string, string];
  avatarIcon: string;
  time: string;
  text: string;
  likes: number;
  liked?: boolean;
  op?: boolean; // Original poster label
  replies?: Comment[];
};

export const comments: Comment[] = [
  {
    id: "cm1",
    username: "MidnightEcho",
    avatarColor: AVATAR_GRADIENTS[1],
    avatarIcon: "moon",
    time: "8m",
    text: "This landed hard. There's something about writing without a face that forces you to actually mean what you say.",
    likes: 84,
    liked: true,
    replies: [
      {
        id: "cm1r1",
        username: "ShadowFox_42",
        avatarColor: AVATAR_GRADIENTS[0],
        avatarIcon: "flash",
        time: "6m",
        text: "Exactly this. It's the honesty of an unsigned letter.",
        likes: 32,
        op: true,
      },
      {
        id: "cm1r2",
        username: "GhostByte",
        avatarColor: AVATAR_GRADIENTS[4],
        avatarIcon: "planet",
        time: "4m",
        text: "Made me rethink how much of my main-account posts are performance.",
        likes: 12,
      },
    ],
  },
  {
    id: "cm2",
    username: "NeonWolf",
    avatarColor: AVATAR_GRADIENTS[2],
    avatarIcon: "flame",
    time: "22m",
    text: "The wildest part is how quickly the tone here calmed once masks went on. Feels like the anti-Twitter.",
    likes: 46,
  },
  {
    id: "cm3",
    username: "QuietStar",
    avatarColor: AVATAR_GRADIENTS[3],
    avatarIcon: "sparkles",
    time: "1h",
    text: "Been lurking a month. First reply. Thanks for saying it plainly.",
    likes: 28,
  },
  {
    id: "cm4",
    username: "VelvetGhost",
    avatarColor: AVATAR_GRADIENTS[5],
    avatarIcon: "leaf",
    time: "2h",
    text: "Not saying identity is bad — just that most platforms punish you for outgrowing yours. Here you can just… become.",
    likes: 74,
    replies: [
      {
        id: "cm4r1",
        username: "SilentDrift",
        avatarColor: AVATAR_GRADIENTS[0],
        avatarIcon: "planet",
        time: "1h",
        text: "Well put. \"Punish you for outgrowing yourself\" is going in my notes.",
        likes: 19,
      },
    ],
  },
];

