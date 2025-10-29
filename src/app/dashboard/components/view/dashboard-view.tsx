import ClientDashboardSidebar from '../ui/ClientDashboardSidebar';
import ProfileAvatarMenu from '@/components/common/profile/profile-avatar';
import { ClientDashboard } from '../ui/ClientDashboard';
import { PuckPageData } from '@/app/puck/types';

type ProcDoc = {
  _id: string;
  title: string;
  slug: string;
  owner: string;
  sharedWith?: Array<{
    userId: string;
    permissions: { read?: boolean; edit?: boolean; execute?: boolean };
  }>;
  updatedAt?: string | Date;
  data: unknown; // will cast to PuckPageData when needed
};

type Props = {
  procs: ProcDoc[];
  total: number;
  nextCursor?: string;
};

export default function DashboardView({ procs, total }: Props) {
  // Build links for the sidebar from the actual procs data
  const links = procs.map((proc) => {
    const p = proc.data as PuckPageData;
    return {
      href: `/procs/${proc.slug}`,
      label: p?.root?.props?.title ?? proc.title,
    };
  });

  // Convert ProcDoc[] to Proc[] for ClientDashboard
  const convertedProcs = procs.map((proc) => ({
    ...proc,
    name: proc.title, // Map title to name
    data: proc.data as PuckPageData,
    // Transform sharedWith from objects to string array (userIds)
    sharedWith: proc.sharedWith?.map((shared) => shared.userId) || [],
  }));

  return (
    <>
      <div className="h-screen flex flex-col">
        <div className="flex flex-1 min-h-0">
          <ClientDashboardSidebar links={links} />
          <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
            {/* <div className="h-[90dvh]"> */}
            <ClientDashboard procs={convertedProcs} />
            {/* </div> */}
          </div>
        </div>
      </div>
    </>
  );
}
