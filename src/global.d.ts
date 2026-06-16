// CSS module declarations for TypeScript
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Allow side-effect imports of CSS files from packages
declare module '@puckeditor/core/puck.css';
