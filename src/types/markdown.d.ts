// Markdown files imported as raw strings (webpack `asset/source`, see
// next.config.js). Used for the Ask Parihara system prompt.
declare module "*.md" {
  const content: string
  export default content
}
