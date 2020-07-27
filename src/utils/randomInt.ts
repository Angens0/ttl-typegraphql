export const randomInt = (min: number, max: number, isInclusive = true) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + +isInclusive)) + min;
};
