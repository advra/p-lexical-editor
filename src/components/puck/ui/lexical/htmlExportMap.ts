// Source - https://stackoverflow.com/a/79374337
// Posted by Giyu Tomioka, modified by community. See post 'Timeline' for change history
// Retrieved 2026-07-10, License - CC BY-SA 4.0

import { ListNode, ListItemNode } from '@lexical/list';
import { DOMExportOutputMap, isHTMLElement, TextNode } from 'lexical';

export const htmlExportMap: DOMExportOutputMap = new Map();

// // Text Node Export
// htmlExportMap.set(TextNode, (editor, t) => {
//   const target = t as TextNode;
//   const node = target.exportDOM(editor);
//   const { element } = node;

//   if (isHTMLElement(element)) {
//     if (target.hasFormat('bold')) {
//       const el = element.querySelector('strong') ?? element;
//       el.style.fontWeight = 'bold';
//       el.removeAttribute('class');
//     }
//     if (target.hasFormat('italic')) {
//       const el = element.querySelector('i') ?? element;
//       el.style.fontStyle = 'italic';
//       el.removeAttribute('class');
//     }
//     if (target.hasFormat('underline')) {
//       const el = element.querySelector('u') ?? element;
//       el.style.textDecorationLine = 'underline';
//       el.removeAttribute('class');
//     }
//   }

//   return node;
// });

// // List Node Export
// htmlExportMap.set(ListNode, (editor, t) => {
//   const target = t as ListNode;
//   const node = target.exportDOM(editor);
//   const { element } = node;

//   if (isHTMLElement(element)) {
//     const format = target.getListType();
//     switch (format) {
//       case 'bullet':
//         element.style.listStyleType = 'disc';
//         element.removeAttribute('class');
//         break;
//     }
//   }

//   return node;
// });

// // List Item Node Export
// htmlExportMap.set(ListItemNode, (editor, t) => {
//   const target = t as TextNode;
//   const node = target.exportDOM(editor);
//   const { element } = node;

//   if (isHTMLElement(element)) {
//     element.style.marginInline = '2rem';
//     element.removeAttribute('class');
//   }

//   return node;
// });


htmlExportMap.set(TextNode, (editor, t) => {
  const target = t as TextNode;
  const node = target.exportDOM(editor);
  const { element } = node;

  if (isHTMLElement(element)) {
    const styles: string[] = [];

    // Bold
    if (target.hasFormat('bold')) {
      styles.push('font-weight: bold');
    }
    // Italic
    if (target.hasFormat('italic')) {
      styles.push('font-style: italic');
    }
    // Underline
    if (target.hasFormat('underline')) {
      styles.push('text-decoration-line: underline');
    }
    // Strikethrough
    if (target.hasFormat('strikethrough')) {
      styles.push('text-decoration-line: line-through');
    }

    // Font size, font family, color, etc. from $patchStyleText
    const styleAttr = target.getStyle();
    if (styleAttr) {
      styles.push(styleAttr);
    }

    if (styles.length > 0) {
      element.setAttribute('style', styles.join('; '));
    }
  }

  return node;
});