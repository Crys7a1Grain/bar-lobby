import { BattleTypes } from "@/model/battle";

export const defaultBoxes: Record<string, BattleTypes.StartBox[]> = {
    "red_comet_remake_1.8.sd7": [
        { xPercent: 0, yPercent: 0, widthPercent: 0.25, heightPercent: 1 },
        { xPercent: 0.75, yPercent: 0, widthPercent: 0.25, heightPercent: 1 },
    ],
    "quicksilver_remake_1.24.sd7": [
        { xPercent: 0, yPercent: 0, widthPercent: 1, heightPercent: 0.25 },
        { xPercent: 0, yPercent: 0.75, widthPercent: 1, heightPercent: 0.25 },
    ],
};