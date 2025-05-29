"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Initial categories from the material list
  const initialCategories = [
    "Drop Cable",
    "Tangent",
    "Hook",
    "Suspension",
    "Tension",
    "Splice Closure",
    "Splice Tray",
    "Patch Panel",
    "ODF",
    "Pigtail",
    "Patch Cord",
    "Connector",
    "Adapter",
    "Splice Protector",
    "Distribution Box",
    "Cabinet",
    "Pole",
    "Duct",
    "Cable Tie",
    "Label",
    "Tool",
    "Consumable",
    "Hardware",
    "Accessory"
  ];

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        // For now, we'll use mock data since the database tables don't exist yet
        setTimeout(() => {
          const mockCategories = initialCategories.map((cat, index) => ({
            id: (index + 1).toString(),
            name: cat,
            description: `Category for ${cat} items`,
            created_at: new Date().toISOString()
          }));
          
          setCategories(mockCategories);
          setLoading(false);
        }, 500);
        
        // The following code is commented out until the database tables are created
        /*
        const { data, error } = await supabase
          .from("stock_categories")
          .select("*")
          .order("name");
        
        if (error) {
          throw new Error(error.message);
        }
        
        setCategories(data || []);
        */
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    }
    
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setError("Category name is required");
      return;
    }
    
    if (categories.some(cat => cat.name.toLowerCase() === newCategory.name.toLowerCase())) {
      setError("A category with this name already exists");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll just add to the local state since the database tables don't exist yet
      const newCat: Category = {
        id: (categories.length + 1).toString(),
        name: newCategory.name,
        description: newCategory.description,
        created_at: new Date().toISOString()
      };
      
      setCategories([...categories, newCat]);
      setNewCategory({ name: "", description: "" });
      setSuccessMessage("Category added successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // The following code is commented out until the database tables are created
      /*
      const { data, error } = await supabase
        .from("stock_categories")
        .insert([{ 
          name: newCategory.name, 
          description: newCategory.description 
        }])
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      setCategories([...categories, data[0]]);
      setNewCategory({ name: "", description: "" });
      setSuccessMessage("Category added successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      */
    } catch (error) {
      console.error("Error adding category:", error);
      setError("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    if (!editingCategory.name.trim()) {
      setError("Category name is required");
      return;
    }
    
    if (categories.some(cat => 
      cat.id !== editingCategory.id && 
      cat.name.toLowerCase() === editingCategory.name.toLowerCase()
    )) {
      setError("A category with this name already exists");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll just update the local state since the database tables don't exist yet
      const updatedCategories = categories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      );
      
      setCategories(updatedCategories);
      setEditingCategory(null);
      setSuccessMessage("Category updated successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // The following code is commented out until the database tables are created
      /*
      const { error } = await supabase
        .from("stock_categories")
        .update({ 
          name: editingCategory.name, 
          description: editingCategory.description 
        })
        .eq("id", editingCategory.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      const updatedCategories = categories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      );
      
      setCategories(updatedCategories);
      setEditingCategory(null);
      setSuccessMessage("Category updated successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      */
    } catch (error) {
      console.error("Error updating category:", error);
      setError("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll just update the local state since the database tables don't exist yet
      const updatedCategories = categories.filter(cat => cat.id !== id);
      setCategories(updatedCategories);
      setDeleteConfirm(null);
      setSuccessMessage("Category deleted successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // The following code is commented out until the database tables are created
      /*
      // First check if there are any stock items using this category
      const { data: stockItems, error: checkError } = await supabase
        .from("stock_items")
        .select("id")
        .eq("category_id", id)
        .limit(1);
      
      if (checkError) {
        throw new Error(checkError.message);
      }
      
      if (stockItems && stockItems.length > 0) {
        setError("Cannot delete category: it is being used by one or more stock items");
        setLoading(false);
        return;
      }
      
      const { error } = await supabase
        .from("stock_categories")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      const updatedCategories = categories.filter(cat => cat.id !== id);
      setCategories(updatedCategories);
      setDeleteConfirm(null);
      setSuccessMessage("Category deleted successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      */
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Categories</h1>
        <Link
          href="/stock-management"
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Stock Management
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400 dark:text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-200">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Category</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Name *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder="e.g., Cables"
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="description"
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder="e.g., All types of cables and wires"
                />
              </div>
            </div>
            <div className="sm:col-span-6">
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Categories List
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Manage your stock categories
          </p>
        </div>
        
        {loading && !editingCategory ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {editingCategory && editingCategory.id === category.id ? (
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {editingCategory && editingCategory.id === category.id ? (
                        <input
                          type="text"
                          value={editingCategory.description || ""}
                          onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        />
                      ) : (
                        category.description || "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {category.created_at ? new Date(category.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingCategory && editingCategory.id === category.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleUpdateCategory}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : deleteConfirm === category.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(category.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
