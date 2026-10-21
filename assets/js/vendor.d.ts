// Declarations for libraries loaded as global script tags (not ES module imports)

declare module "instant.page";

declare module "@params" {
  const params: { bundlePath: string };
  export default params;
}

declare const renderMathInElement: typeof import("katex/contrib/auto-render").default;
