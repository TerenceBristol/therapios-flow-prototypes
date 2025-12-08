import { NavigationHeader } from '@/components/vo-creation/NavigationHeader';

export default function VOCreationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <NavigationHeader />
      {children}
    </div>
  );
}
