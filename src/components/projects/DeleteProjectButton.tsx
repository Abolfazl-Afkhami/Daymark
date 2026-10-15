// src/components/projects/DeleteProjectButton.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { deleteProjectAction } from '@/application/actions/delete-actions';
import { DeleteConfirmButton } from '@/components/ui/DeleteConfirmButton';

export function DeleteProjectButton({ projectId, title }: { projectId: string; title: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    await deleteProjectAction(projectId);
    router.push('/projects');
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle bg-elevated text-xs">
      <span className="text-text-muted font-medium">حذف پروژه:</span>
      <DeleteConfirmButton
        onDelete={handleDelete}
        itemLabel={`پروژه ${title}`}
        confirmText="حذف قطعی"
        size="sm"
      />
    </div>
  );
}
