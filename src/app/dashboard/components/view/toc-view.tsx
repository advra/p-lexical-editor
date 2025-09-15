import Navbar from "@/components/common/navbar/Navbar"
import ClientDashboardSidebar, { Link } from "../ClientDashboardSidebar";

type Props = {
  links: Link[]
}

export const TocView = ({ links }: Props) => {
  return (
    <>
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          {/* Sidebar */}
          <ClientDashboardSidebar links={links} />
          {/* Main content placeholder */}
          <main className="flex-1 bg-gray-50"> {/* page content goes here */} </main>
        </div>
      </div>
    </>
  )
}
