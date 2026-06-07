/** Story viewer reference frame (9:16) */
export const STORY_FRAME_WIDTH = 1080;
export const STORY_FRAME_HEIGHT = 1920;

export const STORY_MEDIA_CLASS =
  "max-h-full max-w-full object-contain";

export function isLandscapeMedia(width: number, height: number): boolean {
  return width > height;
}

export async function readVideoDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Video metadata failed"));
    });
    return {
      width: video.videoWidth || STORY_FRAME_WIDTH,
      height: video.videoHeight || STORY_FRAME_HEIGHT,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Resize image to fit story frame without cropping. */
export async function prepareStoryImageFile(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    STORY_FRAME_WIDTH / bitmap.width,
    STORY_FRAME_HEIGHT / bitmap.height,
  );
  if (scale >= 1) {
    bitmap.close();
    return file;
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Image export failed"));
      },
      "image/jpeg",
      0.92,
    );
  });

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

/** Keeps original aspect ratio; display layer uses object-contain. */
export async function prepareStoryVideoFile(file: File): Promise<File> {
  return file;
}
