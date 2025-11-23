export const COUNTRIES = {
    RUSSIA:"RUSSIA",
    USA: "USA",
    CHINA: "CHINA",
    ITALY: "ITALY"
}

export type Country = typeof COUNTRIES[keyof typeof COUNTRIES];