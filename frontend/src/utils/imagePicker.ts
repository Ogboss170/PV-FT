import { Platform } from "react-native";

export async function pickImagesFromGallery(options?: {
  multiple?: boolean;
  maxImages?: number;
}): Promise<string[]> {
  const max = Math.min(options?.maxImages ?? 4, 4);

  if (Platform.OS === "web" && typeof document !== "undefined") {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp,image/gif";
      if (options?.multiple) {
        input.multiple = true;
      }
      input.onchange = async (e: any) => {
        const files: File[] = Array.from(e.target.files || []);
        if (files.length === 0) {
          resolve([]);
          return;
        }

        // Validate max 4 files
        const selectedFiles = files.slice(0, max);
        const processedUrls: string[] = [];

        for (const file of selectedFiles) {
          // Client-side file size (<= 10MB) & type validation
          if (!file.type.startsWith("image/")) {
            alert(`File "${file.name}" is not a valid image format.`);
            continue;
          }
          if (file.size > 10 * 1024 * 1024) {
            alert(`File "${file.name}" exceeds the 10MB size limit.`);
            continue;
          }

          // Strip EXIF metadata & compress via HTML5 Canvas
          try {
            const dataUrl = await stripExifAndCompressWeb(file);
            processedUrls.push(dataUrl);
          } catch (err) {
            console.warn("Failed to process image, using fallback:", err);
            processedUrls.push(URL.createObjectURL(file));
          }
        }

        resolve(processedUrls);
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
      quality: 0.8, // 80% JPEG compression (strips EXIF in Expo ImagePicker)
      exif: false,   // Explicitly strip EXIF metadata
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    // Limit to max 4 images
    const assets = result.assets.slice(0, max);
    return assets.map((asset: any) => asset.uri);
  } catch (err) {
    console.warn("Image picker error:", err);
    return [];
  }
}

/**
 * Reads a web File, draws it into an HTML5 Canvas to strip all EXIF / GPS metadata,
 * compresses it to 85% JPEG quality, and returns a sanitized Data URL.
 */
function stripExifAndCompressWeb(file: File, quality = 0.85, maxDimension = 2048): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image element"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale oversized images preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }

        // Draw image onto clean canvas - strips all embedded EXIF headers
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to sanitized compressed JPEG
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

