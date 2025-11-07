'use client';

interface SectionHeaderRowProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function SectionHeaderRow({ title, isExpanded, onToggle }: SectionHeaderRowProps) {
  return (
    <tbody>
      <tr className="bg-gray-200 hover:bg-gray-300 cursor-pointer transition-colors" onClick={onToggle}>
        <td colSpan={18} className="px-4 py-3">
          <button
            className="flex items-center gap-2 font-bold text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded w-full"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title}`}
            aria-expanded={isExpanded}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{title}</span>
          </button>
        </td>
      </tr>
    </tbody>
  );
}
