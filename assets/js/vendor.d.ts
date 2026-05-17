// Declarations for libraries loaded as global script tags (not ES module imports)

declare module "instant.page";

declare function renderMathInElement(
  element: Element,
  options?: {
    delimiters?: Array<{ left: string; right: string; display: boolean }>;
    trust?: boolean | ((context: { command: string }) => boolean);
    macros?: Record<string, string>;
  },
): void;
