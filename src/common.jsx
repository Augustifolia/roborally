export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
}


export const colors = ["red", "green", "blue"];
