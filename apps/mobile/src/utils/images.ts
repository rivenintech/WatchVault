type ImageType = "backdrop" | "logo" | "poster";
type ImageSize = {
  [key in ImageType]:
    | "original"
    | (key extends "backdrop"
        ? "w300" | "w780" | "w1280"
        : key extends "logo"
          ? "w45" | "w92" | "w154" | "w185" | "w300" | "w500"
          : "w92" | "w154" | "w185" | "w342" | "w500" | "w780");
};

export function getTMDBImageURL<T extends ImageType>(type: T, size: ImageSize[T], fileName?: string | null) {
  if (!fileName) {
    if (type === "poster") return require("@/assets/images/no-image-poster.png");
    if (type === "backdrop") return require("@/assets/images/no-image-backdrop.png");
  }

  return `https://image.tmdb.org/t/p/${size}/${fileName}`;
}
