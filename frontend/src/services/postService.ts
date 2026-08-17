import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp 
} from "firebase/firestore";
import { Post } from "../mockData";

export const subscribeToPosts = (callback: (posts: Post[]) => void) => {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, orderBy("createdAt", "desc"), limit(50));

  return onSnapshot(q, (snapshot) => {
    const postsList: Post[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        username: data.username || "Anonymous Voice",
        avatarColor: data.avatarColor || ["#06B6D4", "#0284C7"],
        avatarIcon: data.avatarIcon || "flash",
        community: data.community || "General",
        communityEmoji: data.communityEmoji || "💬",
        time: data.createdAt ? "Just now" : "1m",
        text: data.text || "",
        image: data.image,
        poll: data.poll,
        likes: data.likes || 0,
        comments: data.commentsCount || 0,
        reposts: data.reposts || 0,
        liked: false,
        saved: false,
      };
    });
    callback(postsList);
  });
};

export const createPostInFirestore = async (postData: {
  username: string;
  avatarColor: [string, string];
  avatarIcon: string;
  community: string;
  communityEmoji: string;
  text: string;
  image?: string;
  poll?: { question: string; options: { label: string; votes: number }[]; total: number };
  userId: string;
}) => {
  const postsRef = collection(db, "posts");
  return await addDoc(postsRef, {
    ...postData,
    likes: 0,
    commentsCount: 0,
    reposts: 0,
    likedBy: [],
    savedBy: [],
    createdAt: serverTimestamp(),
  });
};

export const toggleLikePost = async (postId: string, userId: string, isLiked: boolean) => {
  const postRef = doc(db, "posts", postId);
  if (isLiked) {
    await updateDoc(postRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId),
    });
  } else {
    await updateDoc(postRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId),
    });
  }
};
