"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Contact {
  id: string;
  contact_name: string;
  contact_type: string;
  phone_number: string;
  email: string;
  title_job_description: string;
  created_time?: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string|null>(null);
  const [newContact, setNewContact] = useState<Omit<Contact, 'id' | 'created_time'>>({
    contact_name: "",
    contact_type: "",
    phone_number: "",
    email: "",
    title_job_description: ""
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("contacts").select("*").order("contact_name");
      if (error || !data) {
        console.error("Error fetching contacts:", error, data);
      } else {
        console.log("Fetched contacts:", data);
        setContacts(data);
      }
    } catch (error) {
      console.error("Unexpected error in fetchContacts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(id: string) {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
    
    try {
      const { error } = await supabase.from("contacts").update(contact).eq("id", id);
      if (error) {
        console.error("Error updating contact:", error);
      } else {
        setEditing(null);
        fetchContacts();
      }
    } catch (error) {
      console.error("Unexpected error in handleSave:", error);
    }
  }

  async function handleAdd() {
    if (!newContact.contact_name) return;
    
    try {
      const { error } = await supabase.from("contacts").insert([newContact]);
      if (error) {
        console.error("Error adding contact:", error);
      } else {
        setNewContact({
          contact_name: "",
          contact_type: "",
          phone_number: "",
          email: "",
          title_job_description: ""
        });
        fetchContacts();
      }
    } catch (error) {
      console.error("Unexpected error in handleAdd:", error);
    }
  }

  function handleEditField(id: string, field: keyof Contact, value: string) {
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  }

  return (
    <div className="ff-page-container">
      <div className="ff-page-header">
        <h2 className="ff-page-title">Contacts</h2>
      </div>
      
      {/* Add new contact form */}
      <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Add New Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Contact Name *"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newContact.contact_name}
              onChange={e => setNewContact({ ...newContact, contact_name: e.target.value })}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newContact.email}
              onChange={e => setNewContact({ ...newContact, email: e.target.value })}
            />
          </div>
          <div>
            <input
              type="tel"
              placeholder="Phone Number"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newContact.phone_number}
              onChange={e => setNewContact({ ...newContact, phone_number: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Contact Type"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newContact.contact_type}
              onChange={e => setNewContact({ ...newContact, contact_type: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Job Title / Description"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newContact.title_job_description}
              onChange={e => setNewContact({ ...newContact, title_job_description: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <button
              className="bg-black dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-md w-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              onClick={handleAdd}
            >
              Add Contact
            </button>
          </div>
        </div>
      </div>
      
      {/* Contacts list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Loading contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-300 mb-4">No contacts found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add your first contact using the form above</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Email</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Phone</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Company</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Position</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === contact.id ? (
                      <input
                        type="text"
                        value={contact.contact_name}
                        onChange={e => handleEditField(contact.id, "contact_name", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      contact.contact_name
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === contact.id ? (
                      <input
                        type="email"
                        value={contact.email}
                        onChange={e => handleEditField(contact.id, "email", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      contact.email
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === contact.id ? (
                      <input
                        type="tel"
                        value={contact.phone_number}
                        onChange={e => handleEditField(contact.id, "phone_number", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      contact.phone_number
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === contact.id ? (
                      <input
                        type="text"
                        value={contact.contact_type}
                        onChange={e => handleEditField(contact.id, "contact_type", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      contact.contact_type
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === contact.id ? (
                      <input
                        type="text"
                        value={contact.title_job_description}
                        onChange={e => handleEditField(contact.id, "title_job_description", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      contact.title_job_description
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {editing === contact.id ? (
                      <div className="flex space-x-2">
                        <button 
                          className="bg-black dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                          onClick={() => handleSave(contact.id)}
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
                        onClick={() => setEditing(contact.id)}
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
