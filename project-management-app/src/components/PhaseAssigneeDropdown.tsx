'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PhaseAssigneeDropdownProps {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}

export default function PhaseAssigneeDropdown({ value, onChange, className = '' }: PhaseAssigneeDropdownProps) {
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

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
      className={`${className} border border-gray-300 dark:border-gray-600 rounded px-3 py-2 max-w-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
    >
      <option value="">Select Assignee</option>
      {staff.map((member) => (
        <option key={member.id} value={member.id} className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">
          {member.name}
        </option>
      ))}
    </select>
  );
}