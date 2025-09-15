// components/TocClient.tsx
"use client";

import { useRouter } from "next/navigation";

export interface Link {
  href: string;
  label: string;
}

interface Props {
  links: Link[];
}

export default function TocClient({ links }: Props) {
  const router = useRouter();

  // group into rows of two
  const rows: Link[][] = [];
  for (let i = 0; i < links.length; i += 2) {
    rows.push(links.slice(i, i + 2));
  }

  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <>
      Hellow
    </>
    // <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
    //   <h1 className="text-3xl font-bold mb-8 text-gray-800">Quick Links</h1>
    //   <table className="table-auto bg-white shadow-md rounded-xl overflow-hidden">
    //     <tbody>
    //       {rows.map((row, rowIndex) => (
    //         <tr key={`row-${rowIndex}`} className="border-b last:border-none">
    //           {row.map((link, colIndex) => (
    //             <td
    //               key={`cell-${colIndex}`}
    //               className="px-6 py-4 text-center cursor-pointer text-blue-600 hover:text-blue-800 transition-colors font-medium"
    //               onClick={() => handleClick(link.href)}
    //               role="link"
    //               tabIndex={0}
    //               onKeyDown={(e) => {
    //                 if (e.key === "Enter" || e.key === " ") {
    //                   handleClick(link.href);
    //                 }
    //               }}
    //             >
    //               {link.label}
    //             </td>
    //           ))}
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </main>
  );
}
