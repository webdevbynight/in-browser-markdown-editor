const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type Digit = typeof digits[number];
export type Year = number;
export type Month = `0${Exclude<Digit, 0>}` | `1${0 | 1 | 2}`;
export type Day = `0${Exclude<Digit, 0>}` | `1${Digit}` | `2${Digit}` | `3${0 | 1}`;
export type ElementOrNull<T = Element> = T | null;
export type ColourMode = "dark" | "light";
export type DocumentName = `${string}.md`;
export type DateFormat = `${Year}-${Month}-${Day}`;
export interface InitialData {
    createdAt: DateFormat;
    name: DocumentName;
    content: string;
}
export interface MarkdownDocument {
    id: number;
    name: DocumentName;
    content: string;
    createdAt: DateFormat;
    updatedAt?: DateFormat;
}
const lineTypes = ["blockquote", "heading", "ol", "paragraph", "pre", "ul"] as const;
export type LineType = typeof lineTypes[number] | null;
const headingLevels = [1, 2, 3, 4, 5, 6] as const;
export type HeadingLevel = typeof headingLevels[number] | null;
type BlockElementsKeys = Exclude<LineType, "paragraph" | null>;
export type BlockElements = Record<BlockElementsKeys, string>;
