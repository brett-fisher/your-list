import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function useCustomHook(initialValue) {
    const getter = () => {
        return initialValue;
    };

    const setter = (value) => {
        initialValue = value;
    };

    return [getter, setter];
}
