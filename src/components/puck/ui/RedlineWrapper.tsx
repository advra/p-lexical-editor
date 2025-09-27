type Props = { children: React.ReactNode };

export function RedlineWrapper({ children }: Props) {
  return (
    <div className="min-h-4 min-w-4 cursor-pointer outline outline-1 outline-transparent hover:outline-red-500 hover:[outline-style:dashed] outline-offset-2 transition-shadow">
      {children}
    </div>
  );
}
