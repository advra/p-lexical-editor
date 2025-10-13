import { Data, DefaultComponents, DefaultRootFieldProps } from '@measured/puck';

export type PuckPageData = Data<
  DefaultComponents,
  DefaultRootFieldProps & {
    tags: string[];
    description: string;
    padding: string;
  }
>;
