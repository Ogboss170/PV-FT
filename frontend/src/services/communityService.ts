import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { Community } from "../mockData";

export const subscribeToCommunities = (callback: (communities: Community[]) => void) => {
  const commRef = collection(db, "communities");
  return onSnapshot(commRef, (snapshot) => {
    const list: Community[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        emoji: data.emoji,
        description: data.description,
        members: `${data.memberCount || 0} members`,
        cover: data.cover,
        gradient: data.gradient || ["#06B6D4", "#0284C7"],
        joined: false,
      };
    });
    callback(list);
  });
};

export const toggleJoinCommunityInFirestore = async (
  communityId: string,
  userId: string,
  currentlyJoined: boolean
) => {
  const userRef = doc(db, "users", userId);
  const commRef = doc(db, "communities", communityId);

  if (currentlyJoined) {
    await updateDoc(userRef, {
      joinedCommunities: arrayRemove(communityId),
    });
    await updateDoc(commRef, {
      memberCount: increment(-1),
    });
  } else {
    await updateDoc(userRef, {
      joinedCommunities: arrayUnion(communityId),
    });
    await updateDoc(commRef, {
      memberCount: increment(1),
    });
  }
};
