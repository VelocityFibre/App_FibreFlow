'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TaskAssigneeDropdownProps {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
  label?: string;
}

export default function TaskAssigneeDropdown({ value, onChange, className = '', label = 'Select Task Assignee' }: TaskAssigneeDropdownProps) {
  // Define a proper type for staff members
  interface StaffMember {
    id: number;
    name: string;
    [key: string]: unknown; // For any other properties
  }
  
  const [staff, setStaff] = useState<StaffMember[]>([]);

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

  // Handle selection change with proper logging
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let selectedValue: number | null = null;
    
    if (e.target.value) {
      // Make sure we have a valid number
      const parsedValue = parseInt(e.target.value, 10);
      if (!isNaN(parsedValue)) {
        selectedValue = parsedValue;
      }
    }
    
    console.log('TaskAssigneeDropdown selection changed:', { 
      rawValue: e.target.value,
      parsedValue: selectedValue 
    });
    
    onChange(selectedValue);
  };

  // Convert value to string to avoid NaN errors
  const stringValue = value === null ? '' : String(value);
  
  return (
    <select
      value={stringValue}
      onChange={handleChange}
      className={`${className} border border-gray-300 dark:border-gray-600 rounded px-3 py-2 max-w-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
    >
      <option value="">{label}</option>
      {staff.map((member) => (
        <option key={member.id} value={String(member.id)} className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">
          {member.name}
        </option>
      ))}
    </select>
  );
}
