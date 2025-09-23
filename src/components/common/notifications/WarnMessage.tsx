import WarningIcon from '@mui/icons-material/Warning';

type Props = {
  message: String;
}

export const WarnMessage = ({ message }: Props) => {
  return (
    <div className="w-full bg-yellow-100 my-2 rounded-sm">
      <div className="p-2 text-sm text-yellow-600">
        <WarningIcon /> {message}
      </div>
    </div>
  )
}
