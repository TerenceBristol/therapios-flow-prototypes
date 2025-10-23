import React from 'react';
import Navigation from '@/components/Navigation';
import UserEditForm from '@/components/UserEditForm';
import usersData from '@/data/userManagementData.json';

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  
  // Find the user by ID
  const user = usersData.find(u => u.id === parseInt(id));

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground">User not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <UserEditForm user={user} />
    </div>
  );
}
