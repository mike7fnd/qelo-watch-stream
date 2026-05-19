export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-950 overflow-auto">
      {children}
    </div>
  );
}
