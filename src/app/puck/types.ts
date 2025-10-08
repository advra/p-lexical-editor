import { Data, DefaultComponents, DefaultRootFieldProps } from '@measured/puck';

export type PuckPageData = Data<
  DefaultComponents,
  DefaultRootFieldProps & {
    tags: string[];
    description: string;
    padding: string;
  }
>;

// export type PuckPageData = {
//   [x: string]: unknown;
//   root: {
//     [x: string]: unknown;
//     props: {
//       [x: string]: unknown;
//       title: string;
//       padding: string;
//       tags?: string[];
//       description?: string;
//     };
//   };
//   content?: unknown[];
// };
