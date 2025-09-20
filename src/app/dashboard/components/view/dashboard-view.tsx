import ClientDashboardSidebar, {
  ProcMetadata,
} from '../ui/ClientDashboardSidebar';
import ProcsTabbedTable, { Proc } from '../ui/ProcsTabbedTable';
// import { getSessionFromCookie } from '@/lib/utils/auth';
import { User } from '@/modules/auth/types';
import ProfileAvatarMenu, {
  ProfileAvatar,
} from '@/components/common/profile/profile-avatar';
import { ClientDashboard } from '../ui/ClientDashboard';
import { PuckPageData } from '@/app/puck/types';

type ProcDoc = {
  _id: string;
  title: string;
  slug: string;
  owner: string;
  sharedWith?: string[];
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
      label: p?.root?.props?.title ?? proc.title ?? 'Untitled',
    };
  });

  return (
    <>
      <div className="h-screen flex flex-col">
        <div className="flex flex-1">
          <ClientDashboardSidebar links={links} />
          <ClientDashboard procs={procs} />
        </div>
      </div>
    </>
  );
}
