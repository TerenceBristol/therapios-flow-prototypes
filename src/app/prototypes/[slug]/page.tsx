import React from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import CRMDashboard from '@/components/crm/CRMDashboard';
import Validation from '@/components/Validation';
import UserManagementTable from '@/components/UserManagementTable';
import TherapistDashboard from '@/components/TherapistDashboard';
import FVOCRMDashboard from '@/components/fvo-crm/FVOCRMDashboard';

interface PrototypePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PrototypePage({ params }: PrototypePageProps) {
  const { slug } = await params;

  // FVO CRM is a full-screen component without navigation
  if (slug === 'fvo-crm') {
    return <FVOCRMDashboard />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="py-8">
        {/* Back Link */}
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            ← Back to Wireframes
          </Link>
        </div>

        {/* Prototype Content */}
        {(slug === 'fvo-ordering-dashboard' || slug === 'fvo-ordering-dashboard-v2' || slug === 'fvo-ordering-dashboard-v3' || slug === 'fertig-vo-breakdown') ? (
          <CRMDashboard initialTab={slug === 'fertig-vo-breakdown' ? 'Fertig-VO-Breakdown' : 'F.VO'} />
        ) : slug === 'validation' || slug === 'validation-billing' ? (
          <Validation slug={slug} />
        ) : slug === 'therapist-fvo-ordering-admin' ? (
          <UserManagementTable />
        ) : slug === 'therapist-fvo-ordering-therapist' || slug === 'therapist-fvo-ordering-therapist-v2' ? (
          <TherapistDashboard />
        ) : (
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Prototype: {slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
              
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Prototype Under Development
                </h2>
                <p className="text-muted-foreground">
                  This prototype page is ready to be built. The routing system is in place and you can now ask Claude to create specific prototype content for this page.
                </p>
              </div>
              
              {/* Development Info */}
              <div className="mt-8 bg-muted rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">Development Notes</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Prototype slug: <code className="bg-background px-1 rounded">{slug}</code></li>
                  <li>• Route: <code className="bg-background px-1 rounded">/prototypes/{slug}</code></li>
                  <li>• This page is ready for custom prototype implementation</li>
                  <li>• Access to VO mock data available via <code className="bg-background px-1 rounded">@/data/mockVOData.json</code></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
