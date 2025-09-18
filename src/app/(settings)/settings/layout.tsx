interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-28 mt-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
