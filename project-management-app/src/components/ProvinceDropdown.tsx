import React from 'react';

interface ProvinceDropdownProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  required?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
}

const ProvinceDropdown: React.FC<ProvinceDropdownProps> = ({
  value,
  onChange,
  className = '',
  required = false,
  id,
  name,
  placeholder = 'Select Province'
}) => {
  // South African provinces in alphabetical order
  const provinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
    'Western Cape'
  ];

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full p-2 border rounded ${className}`}
      required={required}
    >
      <option value="">{placeholder}</option>
      {provinces.map((province) => (
        <option key={province} value={province}>
          {province}
        </option>
      ))}
    </select>
  );
};

export default ProvinceDropdown;
