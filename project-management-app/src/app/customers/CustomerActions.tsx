"use client";

import { useState } from 'react';
import { FiEdit, FiArchive, FiEye, FiRefreshCw, FiUsers } from 'react-icons/fi';
import { useSoftDelete } from '@/hooks/useSoftDelete';
import ActionButton from '@/components/ActionButton';

interface CustomerActionsProps {
  customerId: string;
  customerName: string;
  isArchived?: boolean;
  onArchiveSuccess?: () => void;
  onRestoreSuccess?: () => void;
  onEditClick?: () => void;
}

/**
 * Component for customer actions (view, edit, archive/restore)
 * Implements the soft delete pattern for archiving customers
 */
export default function CustomerActions({
  customerId,
  customerName,
  isArchived = false,
  onArchiveSuccess,
  onRestoreSuccess,
  onEditClick
}: CustomerActionsProps) {
  const [confirmingAction, setConfirmingAction] = useState(false);
  const { archive, unarchive, loading, error } = useSoftDelete();

  // Handle archiving a customer
  const handleArchive = async () => {
    if (!confirmingAction) {
      setConfirmingAction(true);
      return;
    }

    const result = await archive('new_customers', customerId, {
      details: { customerName },
      invalidateQueries: ['customers']
    });

    if (result.success) {
      setConfirmingAction(false);
      if (onArchiveSuccess) {
        onArchiveSuccess();
      }
    }
  };

  // Handle restoring an archived customer
  const handleRestore = async () => {
    if (!confirmingAction) {
      setConfirmingAction(true);
      return;
    }

    const result = await unarchive('new_customers', customerId, {
      details: { customerName },
      invalidateQueries: ['customers']
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
      
      {/* View customer projects button */}
      <ActionButton
        icon={<FiUsers />}
        variant="secondary"
        size="sm"
        onClick={() => window.open(`/projects?customer=${customerId}`, '_blank')}
        disabled={loading}
        title="View customer projects"
      >
        Projects
      </ActionButton>
      
      {/* Edit customer button - only for non-archived customers */}
      {!isArchived && onEditClick && (
        <ActionButton
          icon={<FiEdit />}
          variant="secondary"
          size="sm"
          onClick={onEditClick}
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