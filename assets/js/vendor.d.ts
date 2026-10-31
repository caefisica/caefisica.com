// Declarations for libraries loaded as global script tags (not ES module imports)

declare module "instant.page";

declare module "@params" {
  // Each script.html call passes its own keys; a script reads only the ones its call sets.
  const params: Record<string, string>;
  export default params;
}

declare const renderMathInElement: typeof import("katex/contrib/auto-render").default;
