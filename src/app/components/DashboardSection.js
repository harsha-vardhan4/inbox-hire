export default function DashboardSection({ title, children, className = '', variant }) {
  const baseClasses = "rounded-lg shadow p-6";

  const variantClasses = {
    default:
      "bg-white/30 dark:bg-[#001A3A]/30 backdrop-blur-md border border-[#CBD5E1]/30 dark:border-[#CBD5E1]/15",
    applications:
      "bg-white/30 dark:bg-[#001A3A]/30 backdrop-blur-md border border-[#CBD5E1]/30 dark:border-[#CBD5E1]/15",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      <h2 className="text-xl font-semibold text-[#002153] dark:text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}
