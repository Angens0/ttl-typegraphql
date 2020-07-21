export const seasonScorePerPlace = (place: number): number => {
    switch (place) {
        case 1:
            return 10;
        case 2:
            return 5;
        case 3:
            return 3;
        case 4:
            return 2;
        case 5:
            return 1;
        default:
            return 0;
    }
};
