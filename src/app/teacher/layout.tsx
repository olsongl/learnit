import { Sidebar } from "@/components/layout/Sidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar variant="teacher" />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
