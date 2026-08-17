import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGES_PER_REQUEST = 5;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface SerializedImageVariant {
  id: string;
  variant: "display" | "thumbnail";
  position: number;
  mimeType: "image/webp";
  width: number;
  height: number;
  byteSize: number;
  sha256: string;
  content: Buffer;
}

export class InvalidImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidImageError";
  }
}

export async function serializeImage(
  file: File,
  position: number,
): Promise<SerializedImageVariant[]> {
  if (!allowedTypes.has(file.type)) {
    throw new InvalidImageError("Solo se admiten imágenes JPEG, PNG o WebP.");
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw new InvalidImageError("Cada imagen debe pesar entre 1 byte y 10 MB.");
  }

  const source = Buffer.from(await file.arrayBuffer());

  try {
    const sourceMetadata = await sharp(source).metadata();
    if (!sourceMetadata.width || !sourceMetadata.height) {
      throw new InvalidImageError("La imagen no contiene dimensiones válidas.");
    }

    const outputs = await Promise.all([
      sharp(source)
        .rotate()
        .resize({ width: 1600, height: 1200, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer(),
      sharp(source)
        .rotate()
        .resize({ width: 640, height: 480, fit: "cover" })
        .webp({ quality: 76 })
        .toBuffer(),
    ]);

    return Promise.all(
      outputs.map(async (content, index) => {
        const metadata = await sharp(content).metadata();
        return {
          id: randomUUID(),
          variant: index === 0 ? "display" : "thumbnail",
          position,
          mimeType: "image/webp",
          width: metadata.width!,
          height: metadata.height!,
          byteSize: content.byteLength,
          sha256: createHash("sha256").update(content).digest("hex"),
          content,
        };
      }),
    );
  } catch (error) {
    if (error instanceof InvalidImageError) throw error;
    throw new InvalidImageError("El archivo no contiene una imagen válida.");
  }
}

export async function serializeImages(
  files: File[],
  startPosition = 0,
): Promise<SerializedImageVariant[]> {
  if (files.length > MAX_IMAGES_PER_REQUEST) {
    throw new InvalidImageError("Puedes cargar máximo 5 imágenes por operación.");
  }

  const variants = await Promise.all(
    files.map((file, index) => serializeImage(file, startPosition + index)),
  );
  return variants.flat();
}
