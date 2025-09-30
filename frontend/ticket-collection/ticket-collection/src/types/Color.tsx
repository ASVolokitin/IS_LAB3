export const COLORS = {
    GREEN: "GREEN",
    BLUE: "BLUE",
    YELLOW: "YELLOW",
    WHITE: "WHITE"
}

export type Color = typeof COLORS[keyof typeof COLORS];