// app/dashboard/page.tsx
import DashboardView from './components/view/dashboard-view';
import { getAllProcs } from '@/lib/get-page';

export default async function Page() {
  try {
    const { procs, total } = getAllProcs();
    return <DashboardView procs={procs} total={total} nextCursor={undefined} />;
  } catch (err) {
    console.error('Error loading procs:', err);
    return <DashboardView procs={[]} total={0} nextCursor={undefined} />;
  }
}
