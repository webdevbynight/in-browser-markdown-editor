import fs from "node:fs";
import url from "node:url";
import { expect, it } from "vitest";
import Markdown from "../markdown.js";

it("splits the single-line content string into an array of blocks based on line breaks", () => {
    const content = "Welcome to Markdow\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.";
    expect(new Markdown(content).setLines()).toStrictEqual(["Welcome to Markdow", "", "Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents."]);
});

it("splits the multiline content string into an array of blocks based on line breaks", () => {
    const content = `Welcome to Markdow

Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.`;
    expect(new Markdown(content).setLines()).toStrictEqual(["Welcome to Markdow", "", "Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents."]);
});

it("returns the type `null`", () => {
    expect(new Markdown("").getType("", null)).toBe(null);
});

it("returns the type `heading`", () => {
    expect(new Markdown("").getType("# Welcome to Markdown", null)).toBe("heading");
});

it("returns the type `blockquote`", () => {
    expect(new Markdown("").getType("> This is a quote.", null)).toBe("blockquote");
});

it("returns the type `ol`", () => {
    expect(new Markdown("").getType("1. This is an ordered list item.", null)).toBe("ol");
});

it("returns the type `ul`", () => {
    expect(new Markdown("").getType("- This is an unordered list item.", null)).toBe("ul");
});

it("returns the type `pre`", () => {
    expect(new Markdown("").getType("```", null)).toBe("pre");
});

it("returns the type `pre` when the line is between two ``` lines", () => {
    expect(new Markdown("").getType("<code>a code extract</code>", "pre")).toBe("pre");
});

it("returns the type `paragraph`", () => {
    expect(new Markdown("").getType("This is a text within a paragraph.", null)).toBe("paragraph");
});

it("returns the type `paragraph` even if it looks like a heading", () => {
    expect(new Markdown("").getType("####### This is a level-7 heading, which does not exist", null)).toBe("paragraph");
});

it("sets the heading level at 1", () => {
    expect(new Markdown("").getHeadingLevel("# This is a level-1 heading", "heading")).toBe(1);
});

it("sets the heading level at 2", () => {
    expect(new Markdown("").getHeadingLevel("## This is a level-2 heading", "heading")).toBe(2);
});

it("sets the heading level at 3", () => {
    expect(new Markdown("").getHeadingLevel("### This is a level-3 heading", "heading")).toBe(3);
});

it("sets the heading level at 4", () => {
    expect(new Markdown("").getHeadingLevel("#### This is a level-@ heading", "heading")).toBe(4);
});

it("sets the heading level at 5", () => {
    expect(new Markdown("").getHeadingLevel("##### This is a level-5 heading", "heading")).toBe(5);
});

it("sets the heading level at 6", () => {
    expect(new Markdown("").getHeadingLevel("###### This is a level-6 heading", "heading")).toBe(6);
});

it("sets the heading level at null", () => {
    expect(new Markdown("").getHeadingLevel("This is not a heading", "paragraph")).toBe(null);
});

it("parses the line without the heading tag", () => {
    expect(new Markdown("").parseLine("###### This is a level-6 heading", "heading")).toBe("This is a level-6 heading");
});

it("parses the line without the blockquote tag", () => {
    expect(new Markdown("").parseLine("> This is a quote", "blockquote")).toBe("This is a quote");
});

it("parses an ordered list-item line", () => {
    expect(new Markdown("").parseLine("This is an ordered list-item", "ol")).toBe("<li>This is an ordered list-item</li>");
});

it("parses an unordered list-item line", () => {
    expect(new Markdown("").parseLine("This is an unordered list-item", "ul")).toBe("<li>This is an unordered list-item</li>");
});

it("escapes sensitive characters as HTML entities", () => {
    expect(new Markdown("").sanitise(`<script>alert("Hello world & co");</script>`)).toBe(`&lt;script&gt;alert("Hello world &amp; co");&lt;/script&gt;`);
});

it("converts *string* into <em>string</em>", () => {
    expect(new Markdown("").convertInlineElements("an *important thing*")).toBe("an <em>important thing</em>");
});

it("converts **string** into <strong>string</strong>", () => {
    expect(new Markdown("").convertInlineElements("a **very important thing**")).toBe("a <strong>very important thing</strong>");
});

it("converts ***string*** into <strong><em>string</em></strong>", () => {
    expect(new Markdown("").convertInlineElements("a ***very, very important thing***")).toBe("a <strong><em>very, very important thing</em></strong>");
});

it("converts `string` into <code>string</code>", () => {
    expect(new Markdown("").convertInlineElements("`alert(window);`")).toBe("<code>alert(window);</code>");
});

it("converts a relative link into a `a` element", () => {
    expect(new Markdown("").convertInlineElements("[home page](/)")).toBe(`<a href="/">home page</a>`);
});

it("converts an absolute link within the same domain into a `a` element", () => {
    const url = new URL(".", import.meta.url);
    const { protocol, hostname } = url;
    const href = `${protocol}://${hostname}/category/post`;
    expect(new Markdown("").convertInlineElements(`[read this post](${href})`)).toBe(`<a href="${href}">read this post</a>`);
});

it("converts an absolute external link into a `a` element with `target` attribute", () => {
    expect(new Markdown("").convertInlineElements("[markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/)")).toBe(`<a href="https://www.markdownguide.org/cheat-sheet/" title="markdown cheatsheet (new window)" target="_blank">markdown cheatsheet</a>`);
});

it("converts Markdown to HTML", () => {
    const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
    const markdownFile = fs.readFileSync(`${__dirname}sample/sample.md`, "utf-8");
    const htmlFile = fs.readFileSync(`${__dirname}sample/sample.html.txt`, "utf-8");
    expect(new Markdown(markdownFile).convert()).toBe(htmlFile);
});
