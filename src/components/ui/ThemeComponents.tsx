// FibreFlow Theme Components
// Reusable components that use the centralized theme system

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="ff-page-header">
      <h1 className="ff-page-title">{title}</h1>
      {subtitle && <p className="ff-page-subtitle">{subtitle}</p>}
      {children}
    </div>
  );
}

interface CardProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'stats';
  className?: string;
}

export function Card({ title, children, variant = 'default', className = '' }: CardProps) {
  const baseClass = variant === 'stats' ? 'ff-card-stats' : 'ff-card';
  
  return (
    <div className={`${baseClass} ${className}`}>
      {title && <h3 className="ff-card-title">{title}</h3>}
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <div className="ff-card-stats">
      <h3 className="ff-stat-label">{label}</h3>
      <div className="ff-stat-value">{value}</div>
      {subtitle && <p className="ff-muted-text mt-1">{subtitle}</p>}
    </div>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  onClick?: () => void;
  className?: string;
}

export function Button({ children, variant = 'primary', onClick, className = '' }: ButtonProps) {
  const baseClass = variant === 'ghost' ? 'ff-button-ghost' : 'ff-button-primary';
  
  return (
    <button className={`${baseClass} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

interface StatusBadgeProps {
  status: 'active' | 'planning' | 'pending' | 'completed';
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const statusClass = `ff-status-${status}`;
  
  return (
    <span className={statusClass}>
      {children}
    </span>
  );
}

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className = '' }: SectionProps) {
  return (
    <section className={`ff-section ${className}`}>
      {title && <h2 className="ff-section-title">{title}</h2>}
      {children}
    </section>
  );
}

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="ff-table-container">
      <table className="w-full">
        <thead className="ff-table-header">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="ff-table-header-cell">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="ff-table-row">{children}</tr>;
}

export function TableCell({ children, secondary = false }: { children: React.ReactNode; secondary?: boolean }) {
  const cellClass = secondary ? 'ff-table-cell-secondary' : 'ff-table-cell';
  return <td className={cellClass}>{children}</td>;
}

interface GridProps {
  children: React.ReactNode;
  variant?: 'cards' | 'stats';
  className?: string;
}

export function Grid({ children, variant = 'cards', className = '' }: GridProps) {
  const gridClass = variant === 'stats' ? 'ff-grid-stats' : 'ff-grid-cards';
  
  return (
    <div className={`${gridClass} ${className}`}>
      {children}
    </div>
  );
}