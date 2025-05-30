"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit, FiArchive, FiEye, FiRefreshCw } from 'react-icons/fi';
import { useSoftDelete } from '@/hooks/useSoftDelete';
import ActionButton from '@/components/ActionButton';

interface ProjectActionsProps {
  projectId: string;
  projectName: string;
  isArchived?: boolean;
  onArchiveSuccess?: () => void;
  onRestoreSuccess?: () => void;
}

/**
 * Component for project actions (view, edit, archive/restore)
 * Implements the soft delete pattern for archiving projects
 */
export default function ProjectActions({
  projectId,
  projectName,
  isArchived = false,
  onArchiveSuccess,
  onRestoreSuccess
}: ProjectActionsProps) {
  const router = useRouter();
  const [confirmingAction, setConfirmingAction] = useState(false);
  const { archive, unarchive, loading, error } = useSoftDelete();

  // Handle archiving a project
  const handleArchive = async () => {
    if (!confirmingAction) {
      setConfirmingAction(true);
      return;
    }

    const result = await archive('projects', projectId, {
      details: { projectName },
      invalidateQueries: ['projects']
    });

    if (result.success) {
      setConfirmingAction(false);
      if (onArchiveSuccess) {
        onArchiveSuccess();
      }
    }
  };

  // Handle restoring an archived project
  const handleRestore = async () => {
    if (!confirmingAction) {
      setConfirmingAction(true);
      return;
    }

    const result = await unarchive('projects', projectId, {
      details: { projectName },
      invalidateQueries: ['projects']
    });

    if (result.success) {
      setConfirmingAction(false);
      if (onRestoreSuccess) {
        onRestoreSuccess();
      }
    }
  };

  // Cancel confirmation
  const cancelAction = () => {
    setConfirmingAction(false);
  };

  return (
    <div className="flex items-center space-x-2">
      {error && (
        <span className="text-red-600 text-xs mr-2">{error.message}</span>
      )}
      
      {/* View project button */}
      <ActionButton
        icon={<FiEye />}
        variant="secondary"
        size="sm"
        onClick={() => router.push(`/projects/${projectId}`)}
        disabled={loading}
      >
        View
      </ActionButton>
      
      {/* Edit project button - only for non-archived projects */}
      {!isArchived && (
        <ActionButton
          icon={<FiEdit />}
          variant="secondary"
          size="sm"
          onClick={() => router.push(`/projects/${projectId}/edit`)}
          disabled={loading}
        >
          Edit
        </ActionButton>
      )}
      
      {/* Archive/Restore button */}
      {!isArchived ? (
        confirmingAction ? (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Confirm archive?</span>
            <ActionButton
              variant="danger"
              size="sm"
              onClick={handleArchive}
              disabled={loading}
            >
              Yes
            </ActionButton>
            <ActionButton
              variant="secondary"
              size="sm"
              onClick={cancelAction}
              disabled={loading}
            >
              No
            </ActionButton>
          </div>
        ) : (
          <ActionButton
            icon={<FiArchive />}
            variant="danger"
            size="sm"
            onClick={handleArchive}
            disabled={loading}
          >
            Archive
          </ActionButton>
        )
      ) : (
        confirmingAction ? (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Confirm restore?</span>
            <ActionButton
              variant="success"
              size="sm"
              onClick={handleRestore}
              disabled={loading}
            >
              Yes
            </ActionButton>
            <ActionButton
              variant="secondary"
              size="sm"
              onClick={cancelAction}
              disabled={loading}
            >
              No
            </ActionButton>
          </div>
        ) : (
          <ActionButton
            icon={<FiRefreshCw />}
            variant="success"
            size="sm"
            onClick={handleRestore}
            disabled={loading}
          >
            Restore
          </ActionButton>
        )
      )}
    </div>
  );
}
