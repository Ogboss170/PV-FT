import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

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
      (error) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
};
