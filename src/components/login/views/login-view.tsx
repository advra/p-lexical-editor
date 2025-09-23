import { LoginForm } from '../ui/LoginForm';

interface Props {
  username: string;
  password: string;
  error: string | null;
  isLoading: boolean;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (event: React.FormEvent) => void;
}

export const LoginView = ({
  username,
  password,
  error,
  isLoading,
  setUsername,
  setPassword,
  handleSubmit,
}: Props) => {
  return (
    <>
      <div className="flex flex-col items-center justify-center mt-18">
        <div>
          <LoginForm
            username={username}
            password={password}
            error={error}
            isLoading={isLoading}
            setUsername={setUsername}
            setPassword={setPassword}
            handleSubmit={handleSubmit}
          />
        </div>
        <div className="mt-4 text-gray-300">
          Created by Bixby Dev Team © {new Date().getFullYear()}
        </div>
      </div>
    </>
  );
};
