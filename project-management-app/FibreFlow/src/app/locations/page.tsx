"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Location {
  id: string;
  created_time: string;
  location_name: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string|null>(null);
  const [newLocation, setNewLocation] = useState<Omit<Location, 'id' | 'created_at' | 'updated_at' | 'created_time'>>({
    location_name: "",
    project_id: "",
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("locations").select("*").order("location_name");
      
      if (error) {
        console.error("Error fetching locations:", error);
      } else {
        setLocations(data || []);
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Locations</h2>
      
      {/* Add new location form */}
      <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Add New Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Location Name *"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newLocation.location_name}
              onChange={e => setNewLocation({ ...newLocation, location_name: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Project ID"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newLocation.project_id}
              onChange={e => setNewLocation({ ...newLocation, project_id: e.target.value })}
            />
          </div>
        </div>
        <div className="md:col-span-3">
          <button
            className="bg-black dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            onClick={handleAdd}
          >
            Add Location
          </button>
        </div>
      </div>

    {/* Locations list */}
    {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Loading locations...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-300 mb-4">No locations found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add your first location using the form above</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow mt-6">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Location Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Project ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Created Time</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Created At</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Updated At</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === location.id ? (
                      <input
                        type="text"
                        value={location.location_name}
                        onChange={e => handleEditField(location.id, "location_name", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      location.location_name
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === location.id ? (
                      <input
                        type="text"
                        value={location.project_id}
                        onChange={e => handleEditField(location.id, "project_id", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      location.project_id
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {location.created_time ? location.created_time : ""}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {location.created_at ? location.created_at : ""}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {location.updated_at ? location.updated_at : ""}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {editing === location.id ? (
                      <div className="flex space-x-2">
                        <button 
                          className="bg-black dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                          onClick={() => handleSave(location.id)}
                        >
                          Save
                        </button>
                        <button 
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
