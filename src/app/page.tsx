'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Section from '@/components/Section';
import { PrototypeMetadata } from '@/types';
import prototypesData from '@/data/prototypes.json';

export default function HomePage() {
  const router = useRouter();

  // Load prototype data (currently empty, will be populated when prototypes are added)
  const finalPrototypes: PrototypeMetadata[] = prototypesData.final as PrototypeMetadata[];
  const draftPrototypes: PrototypeMetadata[] = prototypesData.draft as PrototypeMetadata[];

  const handlePrototypeClick = (prototype: PrototypeMetadata) => {
    router.push(`/prototypes/${prototype.slug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Flow Wireframes
          </h1>
          <p className="text-lg text-muted-foreground">
            Interactive feature wireframes for Flow healthcare system
          </p>
        </div>

        {/* Final Wireframes Section */}
        <Section
          title="Final Wireframes"
          prototypes={finalPrototypes}
          onPrototypeClick={handlePrototypeClick}
        />

        {/* Draft Wireframes Section */}
        <Section
          title="Draft Wireframes"
          prototypes={draftPrototypes}
          onPrototypeClick={handlePrototypeClick}
        />

        {/* Footer Note */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Flow Wireframes - For presentation purposes only</p>
        </div>
      </main>
    </div>
  );
}