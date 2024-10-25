import type { BlockElements, HeadingLevel, LineType } from "./types.ts";

/**
 * The Markdown class.
 */
export default class Markdown {
    markdown: string;
    #entities: [string, string][] = [
        ["&", "&amp;"],
        ["<", "&lt;"],
        [">", "&gt;"],
    ];
    #blockElements: BlockElements = {
        blockquote: "^>\\s",
        heading: "^#{1,6}\\s",
        ol: "^\\d+\\.\\s",
        pre: "^`{3}",
        ul: "^-\\s"
    };
    #inlineElements: [string, string | [string, string]][] = [
        ["\\*{3}", ["strong", "em"]],
        ["\\*{2}", "strong"],
        ["\\*", "em"],
        ["`", "code"]
    ];
    lines: string[] = [];
    html = "";

    /**
     * Creates a new instance of the Markdown object.
     * 
     * @param markdown - The string in Markdown.
     */
    constructor(markdown: string) {
        this.markdown = markdown;
    }

    /**
     * Gets the element pattern for a defined type to use it as a regular expression.
     * 
     * @param type - The type concerned.
     * @returns The regular expression for the type.
     */
    #getElementPattern(type: keyof BlockElements): RegExp {
        return new RegExp(this.#blockElements[type]);
    }

    /**
     * Sets lines splitting the Markdown content, using line breaks as a separator.
     * 
     * @returns An array of blocks, each one representing the content between two blank lines.
     */
    setLines(): string[] {
        return this.markdown.split(/\n/);
    }

    /**
     * Gets the type of the current line.
     * 
     * @param line - The current line.
     * @param previousType - The previous type.
     * @returns The type of the line.
     */
    getType(line: string, previousType: LineType): LineType {
        if (line) {
            const typeKeys = Object.keys(this.#blockElements);
            for (const type of typeKeys) {
                const elementPattern = this.#getElementPattern(type as keyof BlockElements);
                if (elementPattern.test(line)) return type as LineType;
            }
            return (previousType === "pre") ? "pre" : "paragraph";
        }
        return null;
    }

    /**
     * Gets the heading level of the current line.
     * 
     * @param line - The current line.
     * @param type - The line type.
     * @returns The heading level if the line is of type `heading`, otherwise null
     */
    getHeadingLevel(line: string, type: LineType): HeadingLevel {
        if (type === "heading") {
            const occurrences = line.match(new RegExp(this.#blockElements.heading));
            if (occurrences) {
                const [match] = occurrences;
                return (match.trimEnd().length || null) as HeadingLevel;
            }
            return null;
        }
        return null;
    }

    /**
     * Opens the line if necessary.
     * 
     * @param type  - The current line type.
     * @param previousType  - The previous type.
     * @param headingLevel  - The current heading level.
     * @returns The opening tag(s) if necessary, otherwise an empty string.
     */
    openLine(type: LineType, previousType: LineType, headingLevel: HeadingLevel): string {
        const opensLine = (type !== previousType);
        if (opensLine) {
            switch (type) {
                case "heading":
                    return `<h${headingLevel}>`;
                case "blockquote":
                    return "<blockquote>\n<p>";
                case "ol":
                    return "<ol>\n";
                case "ul":
                    return "<ul>\n";
                case "pre":
                    return "<pre>\n";
                case "paragraph":
                    return "<p>";
                default:
                    return "";
            }
        }
        return "";
    }

    /**
     * Closes the line if necessary.
     * 
     * @param type - The current line type.
     * @param previousType - The previous type.
     * @param previousHeadingLevel - The previous heading level.
     * @returns The closing tag(s) if necessary, otherwise a single line break.
     */
    closeLine(type: LineType, previousType: LineType, previousHeadingLevel: HeadingLevel): string {
        const closesLine = (type !== previousType);
        if (closesLine) {
            switch (previousType) {
                case "heading":
                    return `</h${previousHeadingLevel}>\n`;
                case "blockquote":
                    return "</p>\n</blockquote>\n";
                case "ol":
                    return "\n</ol>\n";
                case "ul":
                    return "\n</ul>\n";
                case "pre":
                    return "</pre>\n";
                case "paragraph":
                    return "</p>\n";
                default:
                    return "\n";
            }
        }
        return "\n";
    }

    /**
     * Parses the current line.
     * 
     * @param line - The current line.
     * @param type - The current line type.
     * @returns The line without block tags, sanitised and having inline elements converted.
     */
    parseLine(line: string, type: LineType): string {
        let parsedLine = line;
        const typeKeys = Object.keys(this.#blockElements);
        for (const type of typeKeys) {
            const elementPattern = this.#getElementPattern(type as keyof BlockElements);
            if (elementPattern.test(line)) {
                parsedLine = parsedLine.replace(elementPattern, "");
                break;
            }
        }
        parsedLine = this.sanitise(parsedLine);
        if (type === "ol" || type === "ul") parsedLine = `<li>${parsedLine}</li>`;
        parsedLine = this.convertInlineElements(parsedLine);
        return parsedLine;
    }

    /**
     * Sanitises text context, converting sensitive characters (such as `<` or `>`) to the equivalent HTML entities.
     * 
     * @param line - The line to sanitise.
     * @returns The line sanitised with HTML entities.
     */
    sanitise(line: string) {
        let escapedLine = line;
        for (const [character, entity] of this.#entities) {
            escapedLine = escapedLine.replaceAll(character, entity);
        }
        return escapedLine;
    }

    /**
     * Converts Markdown inline elements.
     * 
     * @param line - The line currently parsed.
     * @returns The line with inline elements converted to HTML.
     */
    convertInlineElements(line: string): string {
        let convertedLine = line;
        for (const [inlineElement, outputHTMLElement] of this.#inlineElements) {
            const inlineElementWithNegativeLookbehind = `(?<!\\\\)${inlineElement}`;
            if (Array.isArray(outputHTMLElement)) {
                const [containingElement, nestedElement] = outputHTMLElement;
                convertedLine = convertedLine.replaceAll(new RegExp(`${inlineElementWithNegativeLookbehind}([^${inlineElement}]*)${inlineElementWithNegativeLookbehind}`, "g"), `<${containingElement}><${nestedElement}>$1</${nestedElement}></${containingElement}>`);
            } else convertedLine = convertedLine.replaceAll(new RegExp(`${inlineElementWithNegativeLookbehind}([^${inlineElement}]*)${inlineElementWithNegativeLookbehind}`, "g"), `<${outputHTMLElement}>$1</${outputHTMLElement}>`);
        }
        convertedLine = this.convertLinks(convertedLine);
        return convertedLine;
    }

    /**
     * Converts Markdown links.
     * 
     * @param line - The line currently parsed.
     * @returns The line with Markdown links converted to HTML.
     */
    convertLinks(line: string): string {
        let convertedLine = line;
        const matches = [...convertedLine.matchAll(/(?<!\\)\[(.*)(?<!\\)\](?<!\\)\((.*)(?<!\\)\)/g)];
        for (const match of matches) {
            const [input, text, href] = match;
            if (input && text && href) {
                const url = new URL(".", import.meta.url);
                const { protocol, hostname } = url;
                const currentHostname = `${protocol}://${hostname}`;
                if (href.startsWith("http") && !href.startsWith(currentHostname)) convertedLine = convertedLine.replace(input, `<a href="${href}" title="${text} (new window)" target="_blank">${text}</a>`);
                else convertedLine = convertedLine.replace(input, `<a href="${href}">${text}</a>`);
            }
        }
        return convertedLine;
    }

    /**
     * Parses content.
     * 
     * @returns The content in HTML.
     */
    parse(): string {
        let html = "";
        let type: LineType = null;
        let headingLevel: HeadingLevel = null;
        for (const line of this.lines) {
            const previousType = type;
            const previousHeadingLevel = headingLevel;
            type = this.getType(line, previousType);
            headingLevel = this.getHeadingLevel(line, type);
            html += this.closeLine(type, previousType, previousHeadingLevel);
            html += this.openLine(type, previousType, headingLevel);
            html += this.parseLine(line, type);
        }
        return html;
    }

    /**
     * Converts the Markdown document.
     * 
     * @returns The document converted to HTML.
     */
    convert(): string {
        this.lines = this.setLines();
        this.html = this.parse().replaceAll(/\n{2,}/g, "\n");
        return this.html;
    }
}
