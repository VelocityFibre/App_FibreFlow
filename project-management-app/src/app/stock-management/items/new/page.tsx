"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

export default function NewStockItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    unit: "piece",
    category_id: "",
    current_quantity: 0,
    min_stock_level: 0,
    max_stock_level: 0,
    reorder_point: 0,
    cost_per_unit: 0,
    status: "Active",
    lead_time_days: 0,
    image_url: ""
  });
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    async function fetchCategories() {
      try {
        // For now, we'll use mock data since the database tables don't exist yet
        setTimeout(() => {
          const mockCategories = [
            { id: "1", name: "Cables" },
            { id: "2", name: "Connectors" },
            { id: "3", name: "Equipment" },
            { id: "4", name: "Tools" },
          ];
          
          setCategories(mockCategories);
        }, 500);
        
        // The following code is commented out until the database tables are created
        /*
        const { data, error } = await supabase
          .from("stock_categories")
          .select("id, name")
          .order("name");
        
        if (error) {
          console.error("Error fetching categories:", error);
        } else {
          setCategories(data || []);
        }
        */
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    
    fetchCategories();
  }, []);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Item name is required";
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = "Unit is required";
    }
    
    if (formData.current_quantity < 0) {
      newErrors.current_quantity = "Quantity cannot be negative";
    }
    
    if (formData.min_stock_level < 0) {
      newErrors.min_stock_level = "Minimum stock level cannot be negative";
    }
    
    if (formData.max_stock_level < formData.min_stock_level) {
      newErrors.max_stock_level = "Maximum stock level must be greater than minimum stock level";
    }
    
    if (formData.reorder_point < 0) {
      newErrors.reorder_point = "Reorder point cannot be negative";
    }
    
    if (formData.reorder_point < formData.min_stock_level) {
      newErrors.reorder_point = "Reorder point should be at least the minimum stock level";
    }
    
    if (formData.cost_per_unit < 0) {
      newErrors.cost_per_unit = "Cost per unit cannot be negative";
    }
    
    if (formData.lead_time_days < 0) {
      newErrors.lead_time_days = "Lead time cannot be negative";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // For now, we'll just simulate a successful submission
      // since the database tables don't exist yet
      setTimeout(() => {
        setLoading(false);
        setFormSubmitted(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/stock-management/items");
        }, 2000);
      }, 1500);
      
      // The following code is commented out until the database tables are created
      /*
      const { data, error } = await supabase
        .from("stock_items")
        .insert([formData])
        .select();
      
      if (error) {
        console.error("Error creating stock item:", error);
        setErrors({ submit: error.message });
        setLoading(false);
      } else {
        setFormSubmitted(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/stock-management/items");
        }, 2000);
      }
      */
    } catch (error) {
      console.error("Error creating stock item:", error);
      setErrors({ submit: "An unexpected error occurred" });
      setLoading(false);
    }
  };
  
  if (formSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <svg className="h-6 w-6 text-green-600 dark:text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Stock item created successfully!</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your new stock item has been added to the inventory.
          </p>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to stock items list...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Stock Item</h1>
        <Link
          href="/stock-management/items"
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {errors.submit}
                  </h3>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Item Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholder="e.g., Fiber Optic Cable - Single Mode"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  SKU *
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.sku ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholder="e.g., FOC-SM-001"
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sku}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder="Detailed description of the item"
                />
              </div>
              
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit of Measure *
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.unit ? 'border-red-500 dark:border-red-500' : ''}`}
                >
                  <option value="piece">Piece</option>
                  <option value="meter">Meter</option>
                  <option value="roll">Roll</option>
                  <option value="box">Box</option>
                  <option value="kg">Kilogram</option>
                  <option value="set">Set</option>
                </select>
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unit}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Discontinued">Discontinued</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>
            
            {/* Inventory Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Inventory Information</h3>
              
              <div>
                <label htmlFor="current_quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Quantity
                </label>
                <input
                  type="number"
                  id="current_quantity"
                  name="current_quantity"
                  min="0"
                  step="1"
                  value={formData.current_quantity}
                  onChange={handleChange}
                  className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.current_quantity ? 'border-red-500 dark:border-red-500' : ''}`}
                />
                {errors.current_quantity && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.current_quantity}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="min_stock_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  id="min_stock_level"
                  name="min_stock_level"
                  min="0"
                  step="1"
                  value={formData.min_stock_level}
                  onChange={handleChange}
                  className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.min_stock_level ? 'border-red-500 dark:border-red-500' : ''}`}
                />
                {errors.min_stock_level && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.min_stock_level}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="max_stock_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maximum Stock Level
                </label>
                <input
                  type="number"
                  id="max_stock_level"
                  name="max_stock_level"
                  min="0"
                  step="1"
                  value={formData.max_stock_level}
                  onChange={handleChange}
                  className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.max_stock_level ? 'border-red-500 dark:border-red-500' : ''}`}
                />
                {errors.max_stock_level && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.max_stock_level}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="reorder_point" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reorder Point
                </label>
                <input
                  type="number"
                  id="reorder_point"
                  name="reorder_point"
                  min="0"
                  step="1"
                  value={formData.reorder_point}
                  onChange={handleChange}
                  className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.reorder_point ? 'border-red-500 dark:border-red-500' : ''}`}
                />
                {errors.reorder_point && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reorder_point}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="cost_per_unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cost per Unit
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="cost_per_unit"
                    name="cost_per_unit"
                    min="0"
                    step="0.01"
                    value={formData.cost_per_unit}
                    onChange={handleChange}
                    className={`pl-7 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.cost_per_unit ? 'border-red-500 dark:border-red-500' : ''}`}
                  />
                </div>
                {errors.cost_per_unit && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cost_per_unit}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lead_time_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lead Time (Days)
                </label>
                <input
                  type="number"
                  id="lead_time_days"
                  name="lead_time_days"
                  min="0"
                  step="1"
                  value={formData.lead_time_days}
                  onChange={handleChange}
                  className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.lead_time_days ? 'border-red-500 dark:border-red-500' : ''}`}
                />
                {errors.lead_time_days && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lead_time_days}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Image URL
                </label>
                <input
                  type="text"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Item"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
