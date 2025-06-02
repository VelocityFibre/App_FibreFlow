'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PhaseAssigneeDropdownProps {
  value: string | number | null;
  onChange: (value: string | null) => void;
  className?: string;
  disabled?: boolean;
}

export default function PhaseAssigneeDropdown({ value, onChange, className = '', disabled = false }: PhaseAssigneeDropdownProps) {
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching staff:', error);
    } else {
      setStaff(data || []);
    }
  };

  // Convert value to string to handle both string and number types
  const stringValue = value === null || value === undefined ? '' : String(value);
  
  return (
    <select
      value={stringValue}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled}
      className={`${className} border border-gray-300 dark:border-gray-600 rounded px-3 py-2 max-w-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <option value="">Select Assignee</option>
      {staff.map((member) => (
        <option key={member.id} value={String(member.id)} className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">
          {member.name}
        </option>
      ))}
    </select>
  );
}