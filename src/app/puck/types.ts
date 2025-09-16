export type Payload = {
  data: RecordData & {
    metadata: Metadata
  }
}

export type Metadata = {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
}

export type RecordData = {
  metadata: Metadata;
}
