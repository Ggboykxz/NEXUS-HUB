export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="fade-in will-change-transform">{children}</div>;
}
