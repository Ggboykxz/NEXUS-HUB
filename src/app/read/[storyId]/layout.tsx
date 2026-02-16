export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark bg-black min-h-screen">
      {children}
    </div>
  );
}
