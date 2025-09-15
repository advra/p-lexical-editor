import Navbar from "@/components/common/navbar/Navbar";

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  return (
    // Lock page scroll to this viewport and disable body scrolling
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />

      {/* Scrollable center only */}
      <div className="flex-1 overflow-y-auto">
        {/* Your main content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-28 mt-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
