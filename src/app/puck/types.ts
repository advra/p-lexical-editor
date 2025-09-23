import { Data, DefaultComponents, DefaultRootFieldProps } from '@measured/puck';

export type PuckPageData = Data<
  DefaultComponents,
  DefaultRootFieldProps & {
    tags: string[];
    description: string;
    padding: string;
  }
> & {
  metadata: Metadata;
};

export type Metadata = {
  title: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  version: number;
};

export type RecordData = {
  metadata: Metadata;
};
