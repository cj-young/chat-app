"use client";
import { useEffect, useState } from "react";

export default function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState(defaultValue);
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  useEffect(() => {
    const fromLocal = () => {
      try {
        const item = localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : defaultValue;
      } catch (error) {
        return defaultValue;
      }
    };
    setValue(fromLocal);
    setFirstLoadDone(true);
  }, [defaultValue, key]);

  useEffect(() => {
    if (!firstLoadDone) {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, [value, firstLoadDone]);

  return [value, setValue] as const;
}
