export function PaperPage({ children }: any) {
  return (
    <div
      className="sticky top-0 z-40 py-1 bg-white/80 backdrop-blur 
        supports-[backdrop-filter]:bg-white/60 shadow-sm"
    >
      {children}
    </div>
  );
}
