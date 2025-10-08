import ErrorIcon from '@mui/icons-material/Error';

type Props = {
  errorMessage: String;
}

export const ErrorMessage = ({ errorMessage }: Props) => {
  return (
    <div className="w-full bg-red-200 my-2 rounded-sm">
      <div className="p-2 text-sm text-red-500">
        <ErrorIcon /> {errorMessage}
      </div>
    </div>
  )
}
