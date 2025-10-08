import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type Props = {
  message: String;
}

export const SuccessMessage = ({ message }: Props) => {
  return (
    <div className="w-full bg-red-200 my-2 rounded-sm">
      <div className="p-2 text-sm text-red-500">
        <CheckCircleIcon /> {message}
      </div>
    </div>
  )
}
