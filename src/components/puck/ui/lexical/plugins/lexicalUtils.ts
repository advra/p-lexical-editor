
/** Extract the actual HTML content from Puck's richtext field value.
 *  Puck stores richtext values as descriptor objects like:
 *    { key: "text", props: { fallback: { props: { content: "<p>HTML</p>" } } } }
 *  But it can also be a plain HTML string.
 */
export const extractRichTextContent = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const content = value?.props?.fallback?.props?.content;
    if (typeof content === 'string') return content;
    const directContent = value?.props?.content;
    if (typeof directContent === 'string') return directContent;
  }
  return String(value);
};