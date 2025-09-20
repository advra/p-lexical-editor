// import { notFound } from 'next/navigation';
// import { PuckPreview } from '../ui/components/puck-preview';
// import { getPage } from '@/lib/get-page';
// import AutoPrint from './ui/AutoPrint';

// export default async function PrintPage({
//   params,
// }: {
//   params: Promise<{ puckPath: string[] }>;
// }) {
//   const { puckPath = [] } = await params;
//   const slug = puckPath[puckPath.length - 1];

//   const data = await getPage(slug);
//   if (!data) return notFound();

//   return (
//     <>
//       {/* Optional: a close/back button that won't print */}
//       <div className="no-print p-3">
//         <button onClick={() => history.back()}>Close</button>
//       </div>

//       {/* Auto-open print dialog */}
//       <AutoPrint />

//       {/* Printable content */}
//       <div id="printable" className="bg-white">
//         <PuckPreview data={data} />
//       </div>
//     </>
//   );
// }

// app/procs/[...puckPath]/page.tsx
import { notFound } from 'next/navigation';
import { PuckPreview } from '../app/procs/[puckPath]/print/ui/components/puck-preview';
import { getPage } from '@/lib/get-page';
import AutoPrint from '../app/procs/[puckPath]/print/ui/components/AutoPrint';
import { BackToDashboardButton } from '../app/procs/[puckPath]/print/ui/components/BackToDashboardButton';
import { EditButton } from '../app/procs/[puckPath]/print/ui/components/EditButton';
import { ExportPDFButton } from '../app/procs/[puckPath]/print/ui/components/ExportPDFButton';
import { PaperPage } from '../app/procs/[puckPath]/print/ui/components/PaperPage';

export default async function Page({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath = [] } = await params;

  const isPrint = puckPath[puckPath.length - 1] === 'print';
  const slug = isPrint
    ? puckPath[puckPath.length - 2]
    : puckPath[puckPath.length - 1];
  if (!slug) return notFound();

  const data = await getPage(slug);
  if (!data) return notFound();

  if (isPrint) {
    // PRINT VIEW
    return (
      <>
        <AutoPrint />
        <div id="printable" className="bg-white">
          <PuckPreview data={data} />
        </div>
      </>
    );
  }

  // NORMAL VIEW
  const path = `/procs/${puckPath.join('/')}`;
  const href = `/procs/${puckPath.join('/')}/print`;

  return (
    <>
      <div className="no-print">
        <PaperPage>
          <div className="px-4 mx-auto max-w-screen">
            <div className="flex items-center h-12">
              <BackToDashboardButton />
              <div className="ml-auto flex">
                <ExportPDFButton href={href} />
                <EditButton path={path} />
              </div>
            </div>
          </div>
        </PaperPage>
      </div>

      <div className="mt-4 px-4 bg-white mx-auto max-w-screen">
        <PuckPreview data={data} />
      </div>
    </>
  );
}
