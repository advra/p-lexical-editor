'use client';

import SaveIcon from '@mui/icons-material/Save';

interface Props {
  onPublish?: (data: G['UserData']) => void;
}

export const PublishChangesButton = ({ onPublish }: Props) => {
  return (
    <>
      <button
        type="button"
        className="text-blue-500 hover:text-blue-600 bg-transparent hover:bg-blue-300 
          hover:cursor-pointer  border border-blue-500 focus:outline-none 
          focus:ring-transparent font-medium rounded-md text-sm p-1
          text-center inline-flex items-center me-2
           h-full aspect-square"
        onClick={onPublish}
        aria-label="Save changes"
      >
        <SaveIcon fontSize="medium" />
      </button>
    </>
  );
};
