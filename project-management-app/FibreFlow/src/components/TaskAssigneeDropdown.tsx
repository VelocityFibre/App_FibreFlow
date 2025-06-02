'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TaskAssigneeDropdownProps {
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export default function TaskAssigneeDropdown({ value, onChange, className = '', label = 'Select Task Assignee', disabled = false }: TaskAssigneeDropdownProps) {
  // Define a proper type for staff members
  interface StaffMember {
    id: string; // Changed from number to string to match database
    name: string;
    [key: string]: unknown; // For any other properties
  }
  
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching staff:', error);
        alert('Failed to load staff members: ' + error.message);
      } else {
        console.log('Staff members loaded:', data?.length || 0, data);
        setStaff(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle selection change with proper logging
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value || null;
    
    console.log('TaskAssigneeDropdown selection changed:', { 
      selectedValue,
      currentStaff: staff.length
    });
    
    onChange(selectedValue);
  };

  // Convert value to string to avoid NaN errors
  const stringValue = value === null ? '' : String(value);
  
  if (loading) {
    return (
      <div className={`${className} border border-gray-300 dark:border-gray-600 rounded px-3 py-2 max-w-xs bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400`}>
        Loading staff...
      </div>
    );
  }

  return (
    <select
      value={stringValue}
      onChange={handleChange}
      disabled={disabled || staff.length === 0}
      className={`${className} border border-gray-300 dark:border-gray-600 rounded px-3 py-2 max-w-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${disabled || staff.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <option value="">{staff.length === 0 ? 'No staff members available' : label}</option>
      {staff.map((member) => (
        <option key={member.id} value={String(member.id)} className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">
          {member.name || `Staff ${member.id}`}
        </option>
      ))}
    </select>
  );
}
