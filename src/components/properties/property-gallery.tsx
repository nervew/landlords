"use client";

import { useState } from "react";
import Image from "next/image";

interface PropertyGalleryProps {
  images: string[];
  alt: string;
}

export function PropertyGallery({ images, alt }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];

  if (!selectedImage) {
    return (
      <div className="grid aspect-[16/9] place-items-center rounded-2xl bg-[#e5e9e6] text-sm text-[var(--muted)]">
        Imagen no disponible
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-[1.6rem] bg-[#e5e9e6]">
        <Image
          src={selectedImage}
          alt={`${alt}. Vista ${selectedIndex + 1} de ${images.length}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 72vw"
          className="object-cover"
        />
        <span className="absolute bottom-4 right-4 rounded-md bg-black/70 px-3 py-1.5 text-xs font-bold text-white">
          {selectedIndex + 1} / {images.length}
        </span>
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3" aria-label="Galería de la propiedad">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Mostrar vista ${index + 1}`}
              aria-pressed={selectedIndex === index}
              className={`relative aspect-[16/9] overflow-hidden rounded-xl border-2 ${
                selectedIndex === index
                  ? "border-[var(--earth)]"
                  : "border-transparent opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 1024px) 33vw, 24vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
