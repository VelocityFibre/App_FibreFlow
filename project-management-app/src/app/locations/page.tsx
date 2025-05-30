"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSoftDelete } from "@/hooks/useSoftDelete";
import { withoutArchived, onlyArchived } from "@/lib/queryHelpers";
import ArchivedItemsManager from "@/components/ArchivedItemsManager";
import { FiArchive, FiTrash2, FiRefreshCw } from 'react-icons/fi';

interface Location {
  id: string;
  created_time: string;
  location_name: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [archivedLocations, setArchivedLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<string|null>(null);
  const { archive, unarchive, loading: archiveLoading, error: archiveError } = useSoftDelete();
  const [newLocation, setNewLocation] = useState<Omit<Location, 'id' | 'created_at' | 'updated_at' | 'created_time'>>({
    location_name: "",
    project_id: "",
  });

  useEffect(() => {
    fetchLocations();
  }, [showArchived]);

  async function fetchLocations() {
    setLoading(true);
    try {
      // Fetch active locations
      const { data: activeData, error: activeError } = await withoutArchived(
        supabase.from("locations").select("*")
      ).order("location_name");
      
      if (activeError) {
        console.error("Error fetching active locations:", activeError);
      } else {
        setLocations(activeData || []);
      }

      // Fetch archived locations if needed
      if (showArchived) {
        const { data: archivedData, error: archivedError } = await onlyArchived(
          supabase.from("locations").select("*")
        ).order("location_name");
        
        if (archivedError) {
          console.error("Error fetching archived locations:", archivedError);
        } else {
          setArchivedLocations(archivedData || []);
        }
      }
    } catch (error) {
      console.error("Unexpected error in fetchLocations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(id: string) {
    const location = locations.find((l) => l.id === id);
    if (!location) return;
    
    try {
      const { error } = await supabase.from("locations").update(location).eq("id", id);
      if (error) {
        console.error("Error updating location:", error);
      } else {
        setEditing(null);
        fetchLocations();
      }
    } catch (error) {
      console.error("Unexpected error in handleSave:", error);
    }
  }

  async function handleAdd() {
    if (!newLocation.location_name) return;
    
    try {
      const { error } = await supabase.from("locations").insert([newLocation]);
      if (error) {
        console.error("Error adding location:", error);
      } else {
        setNewLocation({
          location_name: "",
          project_id: ""
        });
        fetchLocations();
      }
    } catch (error) {
      console.error("Unexpected error in handleAdd:", error);
    }
  }

  function handleEditField(id: string, field: keyof Location, value: string) {
    setLocations((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));
  }

  async function handleArchive(id: string, name: string) {
    if (confirm(`Are you sure you want to archive location "${name}"? This will hide it from the main view but can be restored later.`)) {
      try {
        const result = await archive('locations', id, {
          details: { locationName: name },
          invalidateQueries: ['locations']
        });
        
        if (result.success) {
          fetchLocations();
        } else if (result.error) {
          alert(`Failed to archive location: ${result.error.message}`);
        }
      } catch (error) {
        console.error("Unexpected error in handleArchive:", error);
        alert(`An unexpected error occurred: ${error}`);
      }
    }
  }

  async function handleRestore(id: string, name: string) {
    if (confirm(`Are you sure you want to restore location "${name}"?`)) {
      try {
        const result = await unarchive('locations', id, {
          details: { locationName: name },
          invalidateQueries: ['locations']
        });
        
        if (result.success) {
          fetchLocations();
        } else if (result.error) {
          alert(`Failed to restore location: ${result.error.message}`);
        }
      } catch (error) {
        console.error("Unexpected error in handleRestore:", error);
        alert(`An unexpected error occurred: ${error}`);
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Locations</h2>
        <button 
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700"
        >
          <FiArchive className="mr-1" />
          {showArchived ? "Hide Archived" : "Show Archived"}
        </button>
      </div>
      
      {/* Add new location form */}
      <div className="mt-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Add New Location</h3>
          <div className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="location_name" className="sr-only">Location Name</label>
              <input
                type="text"
                name="location_name"
                id="location_name"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Location Name"
                value={newLocation.location_name}
                onChange={(e) => setNewLocation({ ...newLocation, location_name: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Add Location
            </button>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {archiveError && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
          <p className="text-sm">{archiveError.message}</p>
        </div>
      )}
      
      {/* Active Locations */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {showArchived ? "Active Locations" : "Locations"} ({locations.length})
        </h3>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading locations...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No active locations found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                          className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          onClick={() => setEditing(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="bg-black dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                        onClick={() => setEditing(location.id)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
