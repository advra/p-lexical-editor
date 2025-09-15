import Navbar from "@/components/common/navbar/Navbar"
import ClientDashboardSidebar, { ProcMetadata } from "../ui/ClientDashboardSidebar";
import ProcsTabbedTable, { Proc } from "../ui/ProcsTabbedTable";

type Props = {
  links: ProcMetadata[]
}


const sampleProcs: Proc[] = [
  { id: "1", name: "Proc A", owner: "alice", sharedWith: ["bob", "carol"], updatedAt: "2025-01-10" },
  { id: "2", name: "Proc B", owner: "bob", sharedWith: [], updatedAt: "2025-03-02" },
  { id: "3", name: "Proc C", owner: "me", sharedWith: ["alice"], updatedAt: "2025-02-20" },
];

export const TocView = ({ links }: Props) => {
  return (
    <>
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          {/* Sidebar */}
          <ClientDashboardSidebar links={links} />
          {/* Main content placeholder */}
          <main className="flex-1 bg-gray-50">
            <div className="container mx-auto mt-8 gap-4">
              <div className="font-semibold my-4">
                Procedures
              </div>
              <ProcsTabbedTable procs={sampleProcs} currentUser={"alice"} />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
