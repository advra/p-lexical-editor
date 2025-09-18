import Navbar from '@/components/common/navbar/Navbar';
import ClientDashboardSidebar, {
  ProcMetadata,
} from '../ui/ClientDashboardSidebar';
import ProcsTabbedTable, { Proc } from '../ui/ProcsTabbedTable';
import { getUserFromCookie } from '@/lib/utils/auth';
import { User } from '@/modules/auth/types';
import ProfileAvatarMenu, {
  ProfileAvatar,
} from '@/components/common/profile/profile-avatar';
import { ClientDashboard } from '../ui/ClientDashboard';

type Props = {
  links: ProcMetadata[];
};

export const TocView = ({ links }: Props) => {
  // const user = getUserFromCookie();
  // console.log('USER IS ', user);
  return (
    <>
      <div className="h-screen flex flex-col">
        {/* <Navbar /> */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <ClientDashboardSidebar links={links} />
          {/* Main content placeholder */}
          <ClientDashboard />
        </div>
      </div>
    </>
  );
};
