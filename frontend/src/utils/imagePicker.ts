import { Platform } from "react-native";

export async function pickImagesFromGallery(options?: {
  multiple?: boolean;
  maxImages?: number;
}): Promise<string[]> {
  const max = options?.maxImages ?? 3;

  if (Platform.OS === "web" && typeof document !== "undefined") {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      if (options?.multiple) {
        input.multiple = true;
      }
      input.onchange = (e: any) => {
        const files: File[] = Array.from(e.target.files || []);
        if (files.length === 0) {
          resolve([]);
          return;
        }
        const selectedFiles = files.slice(0, max);
        const urls = selectedFiles.map((file) => URL.createObjectURL(file));
        resolve(urls);
      };
      input.oncancel = () => resolve([]);
      input.click();
    });
  }

  // Native / Expo ImagePicker
  try {
    const ImagePicker = require("expo-image-picker");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access gallery is required!");
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: options?.multiple ?? false,
      selectionLimit: max,
      quality: 0.8,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    return result.assets.map((asset: any) => asset.uri);
  } catch (err) {
    console.warn("Image picker error:", err);
    return [];
  }
}

