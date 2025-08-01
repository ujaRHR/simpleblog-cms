import { marked } from "marked";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

export const mdToHtml = async (markdown: string): Promise<string> => {
  const rawHtml = await marked(markdown);
  const cleanHtml = DOMPurify.sanitize(rawHtml);

  return cleanHtml;
};
