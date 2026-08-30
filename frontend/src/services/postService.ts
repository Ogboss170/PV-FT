import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy, 
  limit, 
  onSnapshot, 
  doc,
  getDoc,
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

  return onSnapshot(
    q,
    (snapshot) => {
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
    },
    (err) => {
      console.warn("Firestore posts listener subscription warning:", err);
      callback([]);
    }
  );
};

export const createPostInFirestore = async (postData: {
  username: string;
  avatarColor: [string, string];
  avatarIcon: string;
  community: string;
  communityEmoji: string;
  text: string;
  image?: string;
  images?: string[];
  poll?: { question: string; options: { label: string; votes: number }[]; total: number };
  userId: string;
}) => {
  const postsRef = collection(db, "posts");
  
  // Strip any keys with `undefined` values because Firestore throws an error on `undefined`
  const cleanData: Record<string, any> = {};
  Object.entries(postData).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  });

  return await addDoc(postsRef, {
    ...cleanData,
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

export const voteOnPollInFirestore = async (postId: string, optionIndex: number, currentPoll: any) => {
  const postRef = doc(db, "posts", postId);
  const updatedOptions = [...currentPoll.options];
  updatedOptions[optionIndex] = {
    ...updatedOptions[optionIndex],
    votes: updatedOptions[optionIndex].votes + 1,
  };

  await updateDoc(postRef, {
    "poll.options": updatedOptions,
    "poll.total": increment(1),
  });
};

export const subscribeToComments = (postId: string, callback: (comments: any[]) => void) => {
  const commentsRef = collection(db, "posts", postId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        username: data.username || "Anonymous",
        avatarColor: data.avatarColor || ["#06B6D4", "#0284C7"],
        avatarIcon: data.avatarIcon || "flash",
        time: data.createdAt ? "Just now" : "1m",
        text: data.text || "",
        likes: data.likes || 0,
        liked: false,
        op: data.isOp || false,
      };
    });
    callback(list);
  });
};

export const addCommentToFirestore = async (
  postId: string,
  commentData: {
    username: string;
    avatarColor: [string, string];
    avatarIcon: string;
    text: string;
    isOp?: boolean;
  }
) => {
  const commentsRef = collection(db, "posts", postId, "comments");
  const postRef = doc(db, "posts", postId);

  await addDoc(commentsRef, {
    ...commentData,
    likes: 0,
    createdAt: serverTimestamp(),
  });

  await updateDoc(postRef, {
    commentsCount: increment(1),
  });
};

export const toggleSavePost = async (postId: string, userId: string, isSaved: boolean) => {
  const postRef = doc(db, "posts", postId);
  if (isSaved) {
    await updateDoc(postRef, {
      savedBy: arrayRemove(userId),
    });
  } else {
    await updateDoc(postRef, {
      savedBy: arrayUnion(userId),
    });
  }
};

export const repostPostInFirestore = async (postId: string) => {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    reposts: increment(1),
  });
};

export const reportPostInFirestore = async (postId: string, userId: string, reason: string) => {
  const reportsRef = collection(db, "reports");
  await addDoc(reportsRef, {
    postId,
    userId,
    reason,
    createdAt: serverTimestamp(),
  });
};

/** Fetch a single post by its Firestore document ID. Returns null if not found. */
export const getPostById = async (postId: string): Promise<Post | null> => {
  const postRef = doc(db, "posts", postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
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
};

/** Live-subscribe to all posts authored by a given user. */
export const subscribeToPostsByUser = (userId: string, callback: (posts: Post[]) => void) => {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, where("userId", "==", userId), orderBy("createdAt", "desc"), limit(30));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Post[] = snapshot.docs.map((docSnap) => {
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
      callback(list);
    },
    () => callback([])
  );
};

/** Live-subscribe to all posts belonging to a specific community (by community name slug). */
export const subscribeToPostsByCommunity = (communityName: string, callback: (posts: Post[]) => void) => {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, where("community", "==", communityName), orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Post[] = snapshot.docs.map((docSnap) => {
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
      callback(list);
    },
    () => callback([])
  );
};

/** Live-subscribe to posts saved by a user (where savedBy array contains userId). */
export const subscribeToSavedPosts = (userId: string, callback: (posts: Post[]) => void) => {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, where("savedBy", "array-contains", userId), orderBy("createdAt", "desc"), limit(30));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Post[] = snapshot.docs.map((docSnap) => {
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
          saved: true,
        };
      });
      callback(list);
    },
    () => callback([])
  );
};
