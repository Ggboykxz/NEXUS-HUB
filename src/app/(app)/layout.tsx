/**
 * Layout épuré pour le groupe (app).
 * Le Header et le Footer sont gérés par le Root Layout via HeaderFooterWrapper
 * pour éviter les conflits de priorité et les écrans noirs.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
