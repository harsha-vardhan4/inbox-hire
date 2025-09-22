export default function ApplicantsTable() {
  // Placeholder data - replace with actual data fetching later
  const applicants = [
    { id: 1, photo: '/placeholder-avatar.png', name: 'William Olguin', role: 'UI Designer', status: 'Full Time', date: '06.05.2024' },
    { id: 2, photo: '/placeholder-avatar.png', name: 'Nicolas Williamson', role: 'Mobile Dev', status: 'Part Time', date: '07.05.2024' },
    { id: 3, photo: '/placeholder-avatar.png', name: 'Sara Cunningham', role: 'HTML Dev', status: 'Part Time', date: '08.05.2024' },
    { id: 4, photo: '/placeholder-avatar.png', name: 'Laurel Lawson', role: 'UX Designer', status: 'Full Time', date: '09.05.2024' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            {['No.', 'Photo', 'Name', 'Role', 'Status', 'Date'].map((header) => (
              <th
                key={header}
                className="px-5 py-3 border-b-2 border-[#CBD5E1] bg-[#E6F0FA] text-left text-xs font-semibold text-[#002153] uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant) => (
            <tr key={applicant.id} className="bg-white border-b border-[#CBD5E1] hover:bg-[#E6F0FA]">
              <td className="px-5 py-5 text-sm text-[#002153] whitespace-no-wrap">
                {applicant.id.toString().padStart(2, '0')}
              </td>
              <td className="px-5 py-5 text-sm text-[#002153] whitespace-no-wrap">
                <div className="flex-shrink-0 w-10 h-10">
                  <img
                    className="w-full h-full rounded-full"
                    src={applicant.photo}
                    alt={`Photo of ${applicant.name}`}
                  />
                </div>
              </td>
              <td className="px-5 py-5 text-sm text-[#002153] whitespace-no-wrap">{applicant.name}</td>
              <td className="px-5 py-5 text-sm text-[#002153] whitespace-no-wrap">{applicant.role}</td>
              <td className="px-5 py-5 text-sm whitespace-no-wrap">
                <span className="relative inline-block px-3 py-1 font-semibold leading-tight text-[#002153]">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: '#CBD5E1', opacity: 0.5 }}
                  ></span>
                  <span className="relative">{applicant.status}</span>
                </span>
              </td>
              <td className="px-5 py-5 text-sm text-[#002153] whitespace-no-wrap">{applicant.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
