'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProjectAssigneeDropdownProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  label?: string;
}

export default function ProjectAssigneeDropdown({ value, onChange, className = '', label = 'Select Assignee' }: ProjectAssigneeDropdownProps) {
  // Define a proper type for staff members
  interface StaffMember {
    id: string; // Changed to string to match database
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
    const selectedValue = e.target.value || null;
    
    console.log('ProjectAssigneeDropdown selection changed:', { 
      rawValue: e.target.value,
      selectedValue: selectedValue 
    });
    
    onChange(selectedValue);
  };

  console.log('ProjectAssigneeDropdown rendering with value:', value);
  
  // Convert value to string to avoid NaN errors
  const stringValue = value === null ? '' : String(value);
  console.log('Select value as string:', stringValue);
  
  return (
    <select
      value={stringValue}
      onChange={handleChange}
      className={`${className} border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 focus:outline-none focus:ring-primary focus:border-primary`}
    >
      <option value="">{label}</option>
      {staff.map((member) => (
        <option key={member.id} value={String(member.id)} className="text-gray-900 bg-white">
          {member.name}
        </option>
      ))}
    </select>
  );
}