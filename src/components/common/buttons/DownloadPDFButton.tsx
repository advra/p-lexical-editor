// src/components/ui/buttons/DownloadPDFButton.tsx
'use client';

export default function DownloadPDFButton() {
  const handleClick = () => {
    const currentPath = window.location.pathname;
    const url = `/api/generate-pdf?path=${encodeURIComponent(currentPath)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
    >
      Download PDF
    </button>
  );
}
