// Allow side-effect CSS imports in TypeScript source files.
declare module '*.css' {
  const styles: Record<string, string>;
  export default styles;
}
