// app/dashboard/page.tsx
import DashboardView from './components/view/dashboard-view';

export default async function Page() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/procs`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch procs');
    }

    const data = await response.json();
    return (
      <DashboardView
        procs={data.procs}
        total={data.total}
        nextCursor={undefined}
      />
    );
  } catch (err) {
    console.error('Error loading procs:', err);
    return <DashboardView procs={[]} total={0} nextCursor={undefined} />;
  }
}
