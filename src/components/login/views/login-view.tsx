import { FormEvent, SetStateAction } from "react";
import Button from "../../common/buttons/Button";
import { LoginForm } from "../ui/LoginForm";

interface Props {
  username: string;
  password: string;
  error: string | null;
  isLoading: boolean;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (event: React.FormEvent) => void;
}

export const LoginView = ({ username, password, error, isLoading, setUsername, setPassword, handleSubmit }: Props) => {
  return (
    <>
      <div className='min-h-screen flex items-center justify-center'>
        <LoginForm username={username} password={password} error={error} isLoading={isLoading} setUsername={setUsername} setPassword={setPassword} handleSubmit={handleSubmit} />
      </div >
    </>
  )
}
