import { getTMDBImageURL } from "../images";

describe("getTMDBImageURL", () => {
    it("returns no-image-poster.png when no file name is provided for poster type", () => {
        const result = getTMDBImageURL("poster", "original");
        expect(result).toBe(require("@/assets/images/no-image-poster.png"));
    });

    it("returns no-image-backdrop.png when no file name is provided for backdrop type", () => {
        const result = getTMDBImageURL("backdrop", "original");
        expect(result).toBe(require("@/assets/images/no-image-backdrop.png"));
    });

    it("returns TMDB image URL with file name for poster type", () => {
        const fileName = "example.jpg";
        const result = getTMDBImageURL("poster", "w500", fileName);
        expect(result).toBe(`https://image.tmdb.org/t/p/w500/${fileName}`);
    });

    it("returns TMDB image URL with file name for backdrop type", () => {
        const fileName = "example.jpg";
        const result = getTMDBImageURL("backdrop", "w300", fileName);
        expect(result).toBe(`https://image.tmdb.org/t/p/w300/${fileName}`);
    });
});
