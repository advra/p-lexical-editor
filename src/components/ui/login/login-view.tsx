import { FormEvent } from "react";

interface Props {
  username: string;
  password: string;
  error: null;
  event: Event | undefined;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (event: React.FormEvent) => void;
}

export const LoginView = ({ username, password, error, event, setUsername, setPassword, handleSubmit }: Props) => {
  const target = event?.target as HTMLInputElement
  return (
    <>
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition duration-150 font-semibold"
          >
            Login
          </button>
        </form>
      </div>
    </>
  )
}
