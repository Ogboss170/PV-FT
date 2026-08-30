import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { PostImage } from "./postService";

export const uploadMediaToFirebase = async (
  uri: string,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, blob);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      reject,
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
};

/**
 * Upload multiple post images to Firebase Storage.
 * Returns structured PostImage objects with url + storagePath.
 * Calls onProgress with overall progress 0-100.
 */
export const uploadPostImages = async (
  uris: string[],
  userId: string,
  onProgress?: (progress: number) => void
): Promise<PostImage[]> => {
  const results: PostImage[] = [];
  const total = uris.length;

  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i];

    // Skip already-uploaded URLs (https://...)
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      results.push({ url: uri, storagePath: "" });
      if (onProgress) onProgress(Math.round(((i + 1) / total) * 100));
      continue;
    }

    const filename = `${Date.now()}_${i}_${Math.random().toString(36).slice(2)}.jpg`;
    const storagePath = `uploads/${userId}/posts/${filename}`;

    const url = await uploadMediaToFirebase(uri, storagePath, (pct) => {
      // Weight each image equally for overall progress
      const overall = Math.round(((i + pct / 100) / total) * 100);
      if (onProgress) onProgress(overall);
    });

    results.push({ url, storagePath });
  }

  if (onProgress) onProgress(100);
  return results;
};
