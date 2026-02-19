import HeaderFooterWrapper from '@/components/common/header-footer-wrapper';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <HeaderFooterWrapper>
        {children}
      </HeaderFooterWrapper>
    </div>
  );
}
