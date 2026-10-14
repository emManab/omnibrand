import { requireSupabase } from "@/lib/supabase";
import { splitStoragePath } from "@/lib/media";
import { validateImageFile } from "@/lib/rules";

export type Bucket = "product-images" | "category-images" | "banners" | "avatars";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export class UploadError extends Error {}

/**
 * Uploads an image to Supabase Storage with real progress events and returns the stored
 * reference "bucket/object/path.ext" (what we persist in the database).
 * Uses XHR because fetch / supabase-js expose no upload progress.
 */
export async function uploadImage(args: {
  bucket: Bucket;
  folder: string;
  file: File;
  maxMb?: number;
  onProgress?: (fraction: number) => void;
}): Promise<string> {
  const invalid = validateImageFile(args.file, args.maxMb ?? (args.bucket === "banners" ? 8 : 5));
  if (invalid) throw new UploadError(invalid);

  const sb = requireSupabase();
  const { data: sess } = await sb.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new UploadError("Your session expired. Please sign in again.");

  const object = `${args.folder.replace(/^\/+|\/+$/g, "")}/${crypto.randomUUID()}.${EXT[args.file.type] ?? "bin"}`;
  const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${args.bucket}/${object}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_ANON_KEY);
    xhr.setRequestHeader("Content-Type", args.file.type);
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) args.onProgress?.(e.loaded / e.total);
    };
    xhr.onerror = () => reject(new UploadError("Network error while uploading. Please try again."));
    xhr.onabort = () => reject(new UploadError("Upload cancelled."));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        args.onProgress?.(1);
        resolve();
        return;
      }
      let message = `Upload failed (${xhr.status}).`;
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = body.message || body.error || message;
      } catch {
        /* keep default */
      }
      if (xhr.status === 401 || xhr.status === 403) message = "You don't have permission to upload files.";
      reject(new UploadError(message));
    };
    xhr.send(args.file);
  });

  return `${args.bucket}/${object}`;
}

/** Best-effort removal of stored files ("bucket/object" references; external URLs are ignored). */
export async function removeStorageObjects(paths: (string | null | undefined)[]): Promise<void> {
  const sb = requireSupabase();
  const byBucket = new Map<string, string[]>();
  for (const p of paths) {
    const parts = splitStoragePath(p);
    if (!parts) continue;
    byBucket.set(parts.bucket, [...(byBucket.get(parts.bucket) ?? []), parts.object]);
  }
  for (const [bucket, objects] of byBucket) {
    const { error } = await sb.storage.from(bucket).remove(objects);
    if (error) console.warn(`Could not remove ${objects.length} file(s) from ${bucket}:`, error.message);
  }
}
