export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ce layout est maintenant un simple pass-through. 
  // La gestion du Header/Footer a été centralisée dans le RootLayout pour éviter les conflits de routes.
  return <>{children}</>;
}
