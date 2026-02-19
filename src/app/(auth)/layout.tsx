export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-950 selection:bg-primary/20">
      {children}
    </div>
  );
}
