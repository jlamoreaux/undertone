import { Dispatch, SetStateAction, useEffect, useState } from "react";

/**
 * Saves data to local storage
 * @type The type of the value being saved
 * @param defaultValue the initial value to be saved
 * @param key the key of the value to be saved
 * @returns the key value pair of the object in local storage
 */
function useStickyState<Type>(
  defaultValue: Type,
  key: string
): [value: Type, setValue: Dispatch<SetStateAction<Type>>] {
  const [value, setValue] = useState<Type>(() => {
    if (typeof window !== "undefined") {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    }
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);
  return [value, setValue];
}

/**
 * Retrieves an object from local storage
 * @param key the key of the value being retrieved from local storage
 * @returns the key value pair of the object in local storage
 */
export function getStickyValue<Type>(key: string): Type | null {
  const value = window.localStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
  return null;
}

/**
 * Saves an object in local storage
 * @param key the key of the value being saved in local storage
 * @param value the value to be saved
 */
export function setStickyValue<Type>(key: string, value: Type): void {
  return window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Removes a series of values from local storage
 * @param keys an array of the keys to remove from local storage
 * @returns
 */
export const clearStickyValues = (keys: string[]) => {
  keys.forEach(key => {
    window.localStorage.removeItem(key);
  })
  return;
};

export default useStickyState;
