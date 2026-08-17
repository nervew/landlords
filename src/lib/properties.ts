import type { Property } from "@/types";

export function getRelatedProperties(
  current: Property,
  source: Property[],
  limit = 3,
) {
  return source
    .filter((property) => property.id !== current.id)
    .sort((a, b) => {
      const aScore =
        Number(a.department === current.department) * 2 +
        Number(a.propertyType === current.propertyType);
      const bScore =
        Number(b.department === current.department) * 2 +
        Number(b.propertyType === current.propertyType);
      return bScore - aScore;
    })
    .slice(0, limit);
}
