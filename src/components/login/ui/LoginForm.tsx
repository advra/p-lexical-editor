'use client';

import React from "react";
import Image from 'next/image'

import { default as CustomTextField } from "@/components/common/TextField";
import ErrorIcon from '@mui/icons-material/Error';
import Button from "@/components/common/buttons/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface Props {
  username: string;
  password: string;
  error: string | null;
  isLoading: boolean;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (event: React.FormEvent) => void;
}

export const LoginForm = ({ username, password, error, isLoading, setUsername, setPassword, handleSubmit }: Props) => {
  const { setTheme, resolvedTheme } = useTheme();

  const isDisabled = !username.trim() || !password.trim();
  console.log("Theme is", resolvedTheme)
  return (
    <>
      <div className="max-w-md w-full bg-gray p-8 rounded-2xl shadow-xs border border-gray-100">
        <div className="flex items-center justify-center align-middle mb-8">
          <div className="relative w-24 h-24">
            <Image
              src="/EprocLogoWhite.png"
              alt="Eproc Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <h4 className="text-center font-extralight">Welcome to Eproc! The procedure tasking suite.</h4>

        <p className="text-center text-gray-600">Enter your login credentials below to use the app</p>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <CustomTextField
            className="w-full text-black "
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <CustomTextField className="w-full text-black"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isLoading ? <>
            <Button
              disabled
              className="w-full h-8 py-5 my-2 text-blue-300 font-semibold bg-blue-700 hover:bg-blue-600">
              <div className="flex gap-2">
                <CircularProgress size="1.5rem" color="inherit" />
              </div>
            </Button>
          </> : <>
            <Button
              disabled={isDisabled}
              type="submit"
              className="w-full h-8 py-5 my-2 text-white font-semibold bg-blue-700 hover:bg-blue-600">
              Login
            </Button>
          </>}
          <div className="text-gray-600 text-right">
            <span
              className="hover:underline hover:cursor-pointer"
              onClick={() => {
                toast("Please contact an Administrator for a password reset")
              }}
            >
              Forgot Password?
            </span>
          </div>

          {error && (
            <div className="w-full bg-red-200 my-2 rounded-sm">
              <div className="p-2 text-sm text-red-500">
                <ErrorIcon /> {error}
              </div>
            </div>
          )}
        </form>
      </div>

    </>
  )
}
