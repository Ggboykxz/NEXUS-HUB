export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <article className="prose dark:prose-invert max-w-none">
        {children}
      </article>
    </div>
  );
}
