import type { API } from "../api";

type RecursiveAPIResponse<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => Promise<infer R> // If the property is an async function
        ? Awaited<R> // Apply Awaited to the return type to get the resolved type
        : T[K] extends object // If the property is an object, recurse
          ? RecursiveAPIResponse<T[K]>
          : T[K]; // Otherwise, it's just the value type
};

export type APIResponses = RecursiveAPIResponse<API>;
