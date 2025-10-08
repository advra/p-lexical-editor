import { Data } from "@measured/puck";

export type RecordData = {
  recordData: Partial<Data> & {
    redline_content: any;
  }
}
