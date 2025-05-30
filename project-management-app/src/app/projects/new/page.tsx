"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createAuditLog, AuditAction, AuditResourceType } from "@/lib/auditLogger";
import { FiArrowLeft, FiSave, FiLoader, FiCalendar, FiMapPin, FiUser, FiFileText } from 'react-icons/fi';

interface Customer {
  id: string;
  name: string;
  email?: string;
}

interface Location {
  id: string;
  location_name: string;
}

interface Staff {
  id: string;
  name: string;
  role?: string;
}

// Helper function to generate UUID v4
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customer_id: '',
    location_id: '',
    province: '',
    region: '',
    start_date: '',
    end_date: '',
    budget: '',
    project_manager_id: '',
    status: 'planning' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load form data
  useEffect(() => {
    loadFormData();
  }, []);

  async function loadFormData() {
    try {
      // Load customers
      const { data: customersData, error: customersError } = await supabase
        .from("new_customers")
        .select("id, name, email")
        .is('archived_at', null)
        .order("name");
      
      if (customersError) {
        console.error("Error loading customers:", customersError);
      } else {
        setCustomers(customersData || []);
      }

      // Load locations
      const { data: locationsData, error: locationsError } = await supabase
        .from("locations")
        .select("id, location_name")
        .is('archived_at', null)
        .order("location_name");
      
      if (locationsError) {
        console.error("Error loading locations:", locationsError);
      } else {
        setLocations(locationsData || []);
      }

      // Load staff members
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("id, name, role")
        .is('archived_at', null)
        .order("name");
      
      if (staffError) {
        console.error("Error loading staff:", staffError);
      } else {
        setStaffMembers(staffData || []);
      }
    } catch (error) {
      console.error("Error loading form data:", error);
    }
  }

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (formData.end_date && formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = "End date must be after start date";
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = "Budget must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Generate project ID
      const projectId = uuidv4();

      // Prepare project data
      const projectData = {
        id: projectId,
        project_name: formData.name.trim(),
        description: formData.description.trim() || null,
        customer_id: formData.customer_id || null,
        location_id: formData.location_id || null,
        province: formData.province.trim() || null,
        region: formData.region.trim() || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        budget: formData.budget ? Number(formData.budget) : null,
        project_manager_id: formData.project_manager_id || null,
        status: formData.status,
        progress_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert project
      const { data, error } = await supabase
        .from("projects")
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error("Error creating project:", error);
        alert(`Failed to create project: ${error.message}`);
        return;
      }

      // Create audit log
      await createAuditLog(
        AuditAction.CREATE,
        AuditResourceType.PROJECT,
        projectId,
        {
          projectName: formData.name,
          customerId: formData.customer_id,
          startDate: formData.start_date,
          projectManagerId: formData.project_manager_id
        }
      );

      // Success feedback
      alert("Project created successfully!");

      // Redirect to the new project page
      router.push(`/projects/${projectId}`);

    } catch (error) {
      console.error("Unexpected error creating project:", error);
      alert(`An unexpected error occurred: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link 
            href="/projects?view=management"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
          >
            <FiArrowLeft className="mr-1 h-4 w-4" />
            Back to Projects
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Project
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add a new fiber optic installation project to the system
            </p>
          </div>
        </div>
      </div>

      {/* Project Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <FiFileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., Fiber Installation - Main Street"
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Brief description of the project..."
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Initial Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="planning">Planning</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignment & Location */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <FiUser className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Assignment & Location
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer */}
            <div>
              <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Customer
              </label>
              <select
                id="customer_id"
                value={formData.customer_id}
                onChange={(e) => handleInputChange('customer_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Manager */}
            <div>
              <label htmlFor="project_manager_id" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Project Manager
              </label>
              <select
                id="project_manager_id"
                value={formData.project_manager_id}
                onChange={(e) => handleInputChange('project_manager_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Project Manager</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} {staff.role && `(${staff.role})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location_id" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Location
              </label>
              <select
                id="location_id"
                value={formData.location_id}
                onChange={(e) => handleInputChange('location_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.location_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Province */}
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Province
              </label>
              <input
                type="text"
                id="province"
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Western Cape"
              />
            </div>

            {/* Region */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Region
              </label>
              <input
                type="text"
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Cape Town Metro"
              />
            </div>
          </div>
        </div>

        {/* Timeline & Budget */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <FiCalendar className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Timeline & Budget
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Start Date */}
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                id="start_date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              />
              {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Budget (ZAR)
              </label>
              <input
                type="number"
                id="budget"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.budget ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/projects?view=management"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FiSave className="mr-2 h-4 w-4" />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}