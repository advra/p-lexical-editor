import { User } from '@/modules/auth/types';
import { Data } from '@measured/puck';

export type RecordData = {
  recordData: Partial<Data> & {
    redline_content: any;
  };
};

/*
  Attach this prop to components to inject a user. Use to get current user for specific RBAC functions 
  (ie checking for admin or author to edit, or admin/owner/canexecute if can mark items complete)
*/
export type UseUserProps = {
  user?: User;
};

/*
  Default props of puck blocks
*/
export type DefaultPuckProps = {
  id?: string;
} 

