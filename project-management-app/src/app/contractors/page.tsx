"use client";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ModuleOverviewLayout from "@/components/ModuleOverviewLayout";
import ModuleOverviewCard from "@/components/ModuleOverviewCard";
import ActionButton from "@/components/ActionButton";
import { FiUsers, FiUserPlus, FiClipboard, FiFileText } from 'react-icons/fi';
import { MdConstruction, MdOutlineAssignment } from 'react-icons/md';
import { BsBuilding, BsFileEarmarkText } from 'react-icons/bs';

// Document status types
type DocumentStatus = 'none' | 'uploaded' | 'approved' | 'declined';

// Contact interface
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position?: string;
  company?: string;
  created_at?: string;
  // Related entities
  related_to?: {
    contractors?: string[];
    customers?: string[];
    projects?: string[];
  };
}

interface DocumentInfo {
  status: DocumentStatus;
  uploaded_at?: string;
  approved_at?: string;
  declined_at?: string;
  approved_by?: string;
  declined_by?: string;
  notes?: string;
}

interface Contractor {
  id: string;
  company_registered_name: string;
  trading_name: string;
  company_registration_number: string;
  vat_number: string;
  type_of_services_offered: string[];
  contractor_performance: string;
  created_time?: string;
  contact_id?: string;
  // South African specific fields
  bee_level: string;
  bee_certificate_expiry?: string;
  cidb_rating?: string;
  tax_clearance_expiry?: string;
  letter_of_good_standing_expiry?: string;
  workman_compensation_expiry?: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  physical_address: string;
  postal_address: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_branch_code?: string;
  bank_account_type?: string;
  // Document tracking
  has_bee_certificate: boolean;
  has_tax_clearance: boolean;
  has_letter_of_good_standing: boolean;
  has_cidb_certificate: boolean;
  has_company_registration: boolean;
  has_vat_registration: boolean;
  has_workman_compensation: boolean;
  has_bank_confirmation_letter: boolean;
  // Document status tracking
  bee_certificate_status?: DocumentInfo;
  tax_clearance_status?: DocumentInfo;
  letter_of_good_standing_status?: DocumentInfo;
  workman_compensation_status?: DocumentInfo;
  cidb_certificate_status?: DocumentInfo;
  company_registration_status?: DocumentInfo;
  vat_registration_status?: DocumentInfo;
  bank_confirmation_letter_status?: DocumentInfo;
}

function ContractorsContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string|null>(null);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  // Current user - would normally come from auth context
  const currentUser = "admin";
  
  // Contact lookup state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchContact, setSearchContact] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactResults, setShowContactResults] = useState(false);
  const [showCreateContact, setShowCreateContact] = useState(false);
  const [newContact, setNewContact] = useState<Omit<Contact, 'id' | 'created_at' | 'related_to'>>({ 
    name: "", 
    email: "", 
    phone: "",
    position: "",
    company: ""
  });
  
  const [newContractor, setNewContractor] = useState<Omit<Contractor, 'id' | 'created_time'>>({
    company_registered_name: "",
    trading_name: "",
    company_registration_number: "",
    vat_number: "",
    type_of_services_offered: [],
    contractor_performance: "",
    // South African specific fields
    bee_level: "",
    bee_certificate_expiry: "",
    cidb_rating: "",
    tax_clearance_expiry: "",
    letter_of_good_standing_expiry: "",
    workman_compensation_expiry: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    physical_address: "",
    postal_address: "",
    bank_name: "",
    bank_account_number: "",
    bank_branch_code: "",
    bank_account_type: "",
    // Document tracking
    has_bee_certificate: false,
    has_tax_clearance: false,
    has_letter_of_good_standing: false,
    has_cidb_certificate: false,
    has_company_registration: false,
    has_vat_registration: false,
    has_workman_compensation: false,
    has_bank_confirmation_letter: false
  });
  useEffect(() => {
    fetchContractors();
    fetchContacts();
  }, []);
  
  async function fetchContacts() {
    try {
      // First check if the contacts table exists
      const { error: tableError } = await supabase
        .from('contacts')
        .select('count')
        .limit(1)
        .single();
      
      // If the table doesn't exist, create it
      if (tableError && tableError.code === 'PGRST116') {
        console.log('Contacts table does not exist, creating it...');
        await createContactsTable();
        return; // Exit after creating table, next fetch will work
      }
      
      const { data, error } = await supabase.from("contacts").select("*");
      
      if (error) {
        console.error("Error fetching contacts:", error);
      } else {
        console.log("Fetched contacts:", data);
        setContacts(data || []);
      }
    } catch (error) {
      console.error("Unexpected error in fetchContacts:", error);
    }
  }
  
  async function createContactsTable() {
    try {
      // Since we can't create tables directly through the client API,
      // let's create some sample contacts and let Supabase auto-create the table
      // (This works if Row Level Security is disabled or properly configured)
      console.log("Attempting to create sample contacts...");
      
      // Using fixed IDs to avoid hydration errors (server/client mismatch)
      const sampleContacts = [
        { 
          // Using fixed ID instead of crypto.randomUUID() to avoid hydration errors
          name: 'John Doe', 
          email: 'john@example.com', 
          phone: '0123456789', 
          position: 'Manager', 
          company: 'ABC Corp',
          related_to: { contractors: [], customers: [], projects: [] }
        },
        { 
          // Using fixed ID instead of crypto.randomUUID() to avoid hydration errors
          name: 'Jane Smith', 
          email: 'jane@example.com', 
          phone: '0987654321', 
          position: 'Director', 
          company: 'XYZ Ltd',
          related_to: { contractors: [], customers: [], projects: [] }
        }
      ];
      
      // Insert sample contacts
      const { error: insertError } = await supabase.from('contacts').insert(sampleContacts);
      
      if (insertError) {
        console.error("Error creating sample contacts:", insertError);
        // Show a more user-friendly error message
        alert("There was an issue with the contact system. Please try again later or contact support.");
      } else {
        console.log("Sample contacts created successfully");
        // Fetch the newly created contacts
        const { data } = await supabase.from("contacts").select("*");
        setContacts(data || []);
      }
    } catch (error) {
      console.error("Failed to create contacts:", error);
      alert("There was an issue with the contact system. Please try again later.");
    }
  }
  
  async function handleContactSearch() {
    if (!searchContact.trim()) {
      setShowContactResults(false);
      return;
    }
    
    try {
      // First check if the contacts table exists
      const { error: tableError } = await supabase
        .from('contacts')
        .select('count')
        .limit(1)
        .single();
      
      // If the table doesn't exist, create it
      if (tableError && tableError.code === 'PGRST116') {
        console.log('Contacts table does not exist when searching, creating it...');
        await createContactsTable();
        // After creating the table, try the search again
        handleContactSearch();
        return;
      }
      
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .or(`name.ilike.%${searchContact}%,email.ilike.%${searchContact}%,phone.ilike.%${searchContact}%`)
        .limit(5);
      
      if (error) {
        console.error("Error searching contacts:", error);
        // Show a user-friendly error message
        alert("There was an issue searching for contacts. Please try again.");
      } else {
        console.log("Contact search results:", data);
        setContacts(data || []);
        setShowContactResults(true);
        
        // If no results, prompt to create a new contact
        if (data?.length === 0) {
          setShowCreateContact(true);
          // Pre-fill the new contact form with the search term
          if (searchContact.includes("@")) {
            setNewContact({ ...newContact, email: searchContact });
          } else if (/^\d+$/.test(searchContact.replace(/[\s-]/g, ''))) {
            setNewContact({ ...newContact, phone: searchContact });
          } else {
            setNewContact({ ...newContact, name: searchContact });
          }
        } else {
          setShowCreateContact(false);
        }
      }
    } catch (error) {
      console.error("Unexpected error in handleContactSearch:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  }
  
  async function handleCreateContact() {
    if (!newContact.name || !newContact.email || !newContact.phone) {
      alert("Please fill in all required fields for the contact");
      return;
    }
    
    try {
      const { data, error } = await supabase.from("contacts").insert([newContact]).select();
      
      if (error) {
        console.error("Error creating contact:", error);
        alert("Error creating contact. Please try again.");
      } else if (data && data.length > 0) {
        console.log("Created contact:", data[0]);
        // Select the newly created contact
        setSelectedContact(data[0]);
        setShowCreateContact(false);
        setShowContactResults(false);
        // Update the contact list
        fetchContacts();
        // Clear the form
        setNewContact({ name: "", email: "", phone: "", position: "", company: "" });
      }
    } catch (error) {
      console.error("Unexpected error in handleCreateContact:", error);
    }
  }
  
  async function handleSelectContact(contact: Contact) {
    setSelectedContact(contact);
    setShowContactResults(false);
    
    // Fetch related entities for this contact
    try {
      // This is a simplified approach - in a real app you would have a proper API endpoint for this
      const { data: contractorsData } = await supabase
        .from("contractors")
        .select("id, company_registered_name")
        .eq("contact_id", contact.id);
        
      const { data: customersData } = await supabase
        .from("customers")
        .select("id, name")
        .eq("contact_id", contact.id);
        
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, name")
        .eq("contact_id", contact.id);
      
      // Update the contact with related entities
      const updatedContact = {
        ...contact,
        related_to: {
          contractors: contractorsData?.map(c => c.id) || [],
          customers: customersData?.map(c => c.id) || [],
          projects: projectsData?.map(p => p.id) || []
        }
      };
      
      setSelectedContact(updatedContact);
      
      // Pre-fill the contractor form with contact details
      setNewContractor(prev => ({
        ...prev,
        contact_person: contact.name,
        contact_email: contact.email,
        contact_phone: contact.phone
      }));
    } catch (error) {
      console.error("Error fetching related entities:", error);
    }
  }

  async function fetchContractors() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("contractors").select("*").order("company_registered_name");
      
      if (error) {
        console.error("Error fetching contractors:", error);
      } else {
        console.log("Fetched contractors:", data);
        setContractors(data || []);
      }
    } catch (error) {
      console.error("Unexpected error in fetchContractors:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(id: string) {
    const contractor = contractors.find((c) => c.id === id);
    if (!contractor) return;
    
    try {
      const { error } = await supabase.from("contractors").update(contractor).eq("id", id);
      if (error) {
        console.error("Error updating contractor:", error);
      } else {
        setEditing(null);
        fetchContractors();
      }
    } catch (error) {
      console.error("Unexpected error in handleSave:", error);
    }
  }

  async function handleFileUpload(contractorId: string) {
    try {
      // Upload each file to Supabase storage
      for (const [docType, file] of Object.entries(files)) {
        if (!file) continue;
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${contractorId}_${docType}.${fileExt}`;
        const filePath = `contractors/${contractorId}/${fileName}`;
        
        const { error } = await supabase.storage
          .from('contractor-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (error) {
          console.error(`Error uploading ${docType} document:`, error);
        } else {
          // Update document status in the database
          const statusField = `${docType}_status`;
          const now = new Date().toISOString();
          
          const statusUpdate = {
            [statusField]: {
              status: 'uploaded',
              uploaded_at: now
            }
          };
          
          const { error: updateError } = await supabase
            .from('contractors')
            .update(statusUpdate)
            .eq('id', contractorId);
            
          if (updateError) {
            console.error(`Error updating ${docType} status:`, updateError);
          }
        }
      }
    } catch (error) {
      console.error("Error in handleFileUpload:", error);
    }
  }

  async function handleAdd() {
    if (!newContractor.company_registered_name) {
      alert("Please enter a company name");
      return;
    }
    
    try {
      // First check if the contractors table exists
      const { error: tableError } = await supabase
        .from('contractors')
        .select('count')
        .limit(1)
        .single();
      
      // If the table doesn't exist, create it with a sample entry first
      if (tableError && tableError.code === 'PGRST116') {
        console.log('Contractors table does not exist, creating it...');
        const { error: createError } = await supabase.from('contractors').insert([{
          company_registered_name: 'Sample Company Ltd',
          trading_name: 'Sample',
          company_registration_number: '12345/678',
          vat_number: 'VAT12345',
          type_of_services_offered: ['Sample Service'],
          contractor_performance: '',
          contact_person: 'Sample Person',
          contact_email: 'sample@example.com',
          contact_phone: '0123456789',
          physical_address: 'Sample Address',
          postal_address: 'Sample Postal',
          bee_level: 'Level 4',
          has_bee_certificate: false,
          has_tax_clearance: false,
          has_letter_of_good_standing: false,
          has_cidb_certificate: false,
          has_company_registration: false,
          has_vat_registration: false,
          has_workman_compensation: false,
          has_bank_confirmation_letter: false
        }]);
        
        if (createError) {
          console.error("Error creating contractors table:", createError);
          alert("There was an issue setting up the contractors database. Please try again later.");
          return;
        }
      }
      
      // Prepare contractor data with contact_id if a contact is selected
      const contractorData = {
        ...newContractor,
        contact_id: selectedContact?.id
      };
      
      // Insert contractor data
      const { data, error } = await supabase.from("contractors").insert([contractorData]).select();
      if (error) {
        console.error("Error adding contractor:", error);
        alert("There was an error adding the contractor. Please check your input and try again.");
      } else if (data && data.length > 0) {
        // Upload documents if contractor was created successfully
        await handleFileUpload(data[0].id);
        
        // If a contact was selected, update the contact's related entities
        if (selectedContact?.id) {
          try {
            // Get current related entities
            const { data: contactData } = await supabase
              .from("contacts")
              .select("related_to")
              .eq("id", selectedContact.id)
              .single();
              
            const relatedTo = contactData?.related_to || {};
            const contractors = relatedTo.contractors || [];
            
            // Update contact with new contractor relationship
            await supabase
              .from("contacts")
              .update({
                related_to: {
                  ...relatedTo,
                  contractors: [...contractors, data[0].id]
                }
              })
              .eq("id", selectedContact.id);
          } catch (relationError) {
            console.error("Error updating contact relations:", relationError);
            // Continue anyway as the contractor was created successfully
          }
        }
        
        // Show success message
        alert("Contractor added successfully!");
        
        // Reset form
        setFiles({});
        setSelectedContact(null);
        setSearchContact("");
        setNewContractor({
          company_registered_name: "",
          trading_name: "",
          company_registration_number: "",
          vat_number: "",
          type_of_services_offered: [],
          contractor_performance: "",
          // South African specific fields
          bee_level: "",
          bee_certificate_expiry: "",
          cidb_rating: "",
          tax_clearance_expiry: "",
          letter_of_good_standing_expiry: "",
          workman_compensation_expiry: "",
          contact_person: "",
          contact_email: "",
          contact_phone: "",
          physical_address: "",
          postal_address: "",
          bank_name: "",
          bank_account_number: "",
          bank_branch_code: "",
          bank_account_type: "",
          // Document tracking
          has_bee_certificate: false,
          has_tax_clearance: false,
          has_letter_of_good_standing: false,
          has_cidb_certificate: false,
          has_company_registration: false,
          has_vat_registration: false,
          has_workman_compensation: false,
          has_bank_confirmation_letter: false
        });
        fetchContractors();
      }
    } catch (error) {
      console.error("Unexpected error in handleAdd:", error);
    }
  }

  function handleEditField(id: string, field: keyof Contractor, value: string | string[] | boolean) {
    setContractors((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  }
  // If we're on the main contractors page and no view is specified, show the overview layout
  if (!view) {
    return (
      <ModuleOverviewLayout 
        title="Contractors" 
        description="Onboard and manage your contractors and subcontractors"
        actions={<ActionButton label="Add Contractor" variant="outline" onClick={() => window.location.href = "/contractors?view=add"} />}
      >
        <ModuleOverviewCard
          title="Contractor Management"
          description="View and manage your contractor database."
          actionLabel="View Contractors"
          actionLink="/contractors?view=management"
          icon={<BsBuilding size={24} />}
        />
        <ModuleOverviewCard
          title="Onboard Contractor"
          description="Register new contractors with comprehensive information."
          actionLabel="Start Onboarding"
          actionLink="/contractors?view=add"
          icon={<FiUserPlus size={24} />}
        />
        <ModuleOverviewCard
          title="Document Management"
          description="Manage contractor documentation and compliance."
          actionLabel="View Documents"
          actionLink="/contractors?view=documents"
          icon={<BsFileEarmarkText size={24} />}
        />
        <ModuleOverviewCard
          title="Contractor Reports"
          description="Generate and view reports on contractor performance."
          actionLabel="View Reports"
          actionLink="/contractors?view=reports"
          icon={<FiClipboard size={24} />}
        />
      </ModuleOverviewLayout>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Contractors</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {view === "management" ? "Manage your contractor database" : 
             view === "add" ? "Onboard new contractors" : 
             view === "documents" ? "Manage contractor documentation" :
             "Contractor information and management"}
          </p>
        </div>
        <div className="flex space-x-3">
          <ActionButton
            label="Back to Overview"
            variant="outline"
            onClick={() => window.location.href = "/contractors"}
          />
        </div>
      </div>
      
      {view === "add" && (
        <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Contractor Onboarding Form</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Complete the form below to register a new contractor. Fields marked with * are required.</p>
          
          {/* Form with tabs for different sections */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {/* Using divs instead of buttons to avoid hydration errors with fdprocessedid attributes */}
                <div className="border-primary text-primary hover:text-primary-hover dark:text-primary-light dark:hover:text-white border-b-2 py-4 px-1 text-sm font-medium cursor-pointer">
                  Company Information
                </div>
                <div className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-b-2 py-4 px-1 text-sm font-medium cursor-pointer">
                  Contact Details
                </div>
                <div className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-b-2 py-4 px-1 text-sm font-medium cursor-pointer">
                  Compliance Documents
                </div>
                <div className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-b-2 py-4 px-1 text-sm font-medium cursor-pointer">
                  Banking Details
                </div>
              </nav>
            </div>
          </div>
          
          {/* Company Information Section */}
          <div>
            <h4 className="text-md font-medium mb-4 text-gray-800 dark:text-gray-200">Company Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registered Company Name *</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.company_registered_name}
                  onChange={e => setNewContractor({ ...newContractor, company_registered_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trading Name</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.trading_name}
                  onChange={e => setNewContractor({ ...newContractor, trading_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Registration Number *</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.company_registration_number}
                  onChange={e => setNewContractor({ ...newContractor, company_registration_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">VAT Number</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.vat_number}
                  onChange={e => setNewContractor({ ...newContractor, vat_number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">B-BBEE Level</label>
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.bee_level}
                  onChange={e => setNewContractor({ ...newContractor, bee_level: e.target.value })}
                >
                  <option value="">Select B-BBEE Level</option>
                  <option value="Level 1">Level 1 (≥ 100 points)</option>
                  <option value="Level 2">Level 2 (≥ 95 points)</option>
                  <option value="Level 3">Level 3 (≥ 90 points)</option>
                  <option value="Level 4">Level 4 (≥ 80 points)</option>
                  <option value="Level 5">Level 5 (≥ 75 points)</option>
                  <option value="Level 6">Level 6 (≥ 70 points)</option>
                  <option value="Level 7">Level 7 (≥ 55 points)</option>
                  <option value="Level 8">Level 8 (≥ 40 points)</option>
                  <option value="Non-Compliant">Non-Compliant (&lt; 40 points)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CIDB Rating (if applicable)</label>
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.cidb_rating || ""}
                  onChange={e => setNewContractor({ ...newContractor, cidb_rating: e.target.value })}
                >
                  <option value="">Select CIDB Rating</option>
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                  <option value="6">Grade 6</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Services Offered *</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g. Trenching, Cable Installation, Fiber Splicing (comma separated)"
                  value={Array.isArray(newContractor.type_of_services_offered) ? newContractor.type_of_services_offered.join(", ") : ""}
                  onChange={e => setNewContractor({ ...newContractor, type_of_services_offered: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  required
                />
              </div>
            </div>
            
            {/* Contact Details Section */}
            <h4 className="text-md font-medium mb-4 text-gray-800 dark:text-gray-200 mt-8">Contact Details</h4>
            
            <div className="mb-6 border-b pb-6">
              <h5 className="text-md font-semibold mb-3 text-gray-700">Contact Lookup</h5>
              
              <div className="relative mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search for Contact</label>
                <div className="flex">
                  <input
                    type="text"
                    value={searchContact}
                    onChange={(e) => setSearchContact(e.target.value)}
                    placeholder="Search by name, email or phone"
                    className="flex-grow p-2 border rounded-l focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleContactSearch}
                    className="bg-[#003049] text-white px-4 py-2 rounded-r hover:bg-[#00436a] transition-colors"
                  >
                    Search
                  </button>
                </div>
                
                {/* Contact search results */}
                {showContactResults && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                    {contacts.length > 0 ? (
                      contacts.map(contact => (
                        <div 
                          key={contact.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                          onClick={() => handleSelectContact(contact)}
                        >
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-gray-600">{contact.email}</div>
                          <div className="text-sm text-gray-600">{contact.phone}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center">
                        <p>No contacts found</p>
                        <button 
                          className="mt-2 text-sm text-blue-600 hover:underline"
                          onClick={() => setShowCreateContact(true)}
                        >
                          Create new contact
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Selected Contact Display */}
              {selectedContact && (
                <div className="mb-4 p-3 border rounded-md bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{selectedContact.name}</h5>
                      <p className="text-sm">{selectedContact.email}</p>
                      <p className="text-sm">{selectedContact.phone}</p>
                      {selectedContact.position && <p className="text-sm text-gray-600">Position: {selectedContact.position}</p>}
                    </div>
                    <button 
                      onClick={() => setSelectedContact(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Related entities */}
                  {selectedContact.related_to && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm font-medium">Related to:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedContact.related_to.contractors && selectedContact.related_to.contractors.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {selectedContact.related_to.contractors.length} Contractor(s)
                          </span>
                        )}
                        {selectedContact.related_to.customers && selectedContact.related_to.customers.length > 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {selectedContact.related_to.customers.length} Customer(s)
                          </span>
                        )}
                        {selectedContact.related_to.projects && selectedContact.related_to.projects.length > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {selectedContact.related_to.projects.length} Project(s)
                          </span>
                        )}
                        {(!selectedContact.related_to.contractors || !selectedContact.related_to.contractors.length) && 
                         (!selectedContact.related_to.customers || !selectedContact.related_to.customers.length) && 
                         (!selectedContact.related_to.projects || !selectedContact.related_to.projects.length) && (
                          <span className="text-xs text-gray-500">No related entities</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Create Contact Form */}
              {showCreateContact && (
                <div className="mb-4 p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium">Create New Contact</h5>
                    <button 
                      onClick={() => setShowCreateContact(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={newContact.name}
                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input
                        type="text"
                        value={newContact.position}
                        onChange={(e) => setNewContact({...newContact, position: e.target.value})}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={newContact.company}
                        onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleCreateContact}
                      className="bg-[#003049] text-white px-4 py-2 rounded hover:bg-[#00436a] transition-colors"
                    >
                      Create Contact
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person *</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.contact_person}
                  onChange={e => setNewContractor({ ...newContractor, contact_person: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.contact_email}
                  onChange={e => setNewContractor({ ...newContractor, contact_email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.contact_phone}
                  onChange={e => setNewContractor({ ...newContractor, contact_phone: e.target.value })}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Physical Address *</label>
                <textarea
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.physical_address}
                  onChange={e => setNewContractor({ ...newContractor, physical_address: e.target.value })}
                  required
                  rows={3}
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Address</label>
                <textarea
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.postal_address}
                  onChange={e => setNewContractor({ ...newContractor, postal_address: e.target.value })}
                  rows={3}
                ></textarea>
              </div>
            </div>
            
            {/* Compliance Documents Section */}
            <h4 className="text-md font-medium mb-4 text-gray-800 dark:text-gray-200 mt-8">Compliance Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">B-BBEE Certificate</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#003049] focus:ring-[#003049] border-gray-300 rounded"
                    checked={newContractor.has_bee_certificate}
                    onChange={e => setNewContractor({ ...newContractor, has_bee_certificate: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Document Available</span>
                </div>
                {newContractor.has_bee_certificate && (
                  <div className="mt-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newContractor.bee_certificate_expiry || ""}
                      onChange={e => setNewContractor({ ...newContractor, bee_certificate_expiry: e.target.value })}
                    />
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Document</label>
                      <div className="flex flex-col space-y-2">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="block w-full text-sm text-gray-700 dark:text-gray-300"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setFiles(prev => ({ ...prev, bee_certificate: e.target.files?.[0] || null }));
                              // Set initial status for new document
                              setNewContractor(prev => ({
                                ...prev,
                                bee_certificate_status: {
                                  status: 'none'
                                }
                              }));
                            }
                          }}
                        />
                        {files.bee_certificate && (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                              Document Selected
                            </span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {files.bee_certificate.name}
                            </p>
                          </div>
                        )}
                        
                        {/* Document status indicators for existing documents */}
                        {editing && contractors.find(c => c.id === editing)?.bee_certificate_status?.status === 'uploaded' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Document Uploaded - Pending Approval
                          </span>
                        )}
                        {editing && contractors.find(c => c.id === editing)?.bee_certificate_status?.status === 'approved' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Approved
                          </span>
                        )}
                        {editing && contractors.find(c => c.id === editing)?.bee_certificate_status?.status === 'declined' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Declined
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Clearance Certificate</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#003049] focus:ring-[#003049] border-gray-300 rounded"
                    checked={newContractor.has_tax_clearance}
                    onChange={e => setNewContractor({ ...newContractor, has_tax_clearance: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Document Available</span>
                </div>
                {newContractor.has_tax_clearance && (
                  <div className="mt-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newContractor.tax_clearance_expiry || ""}
                      onChange={e => setNewContractor({ ...newContractor, tax_clearance_expiry: e.target.value })}
                    />
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Document</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="block w-full text-sm text-gray-700 dark:text-gray-300"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setFiles(prev => ({ ...prev, tax_clearance: e.target.files?.[0] || null }));
                          }
                        }}
                      />
                      {files.tax_clearance && (
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          Selected: {files.tax_clearance.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Letter of Good Standing</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#003049] focus:ring-[#003049] border-gray-300 rounded"
                    checked={newContractor.has_letter_of_good_standing}
                    onChange={e => setNewContractor({ ...newContractor, has_letter_of_good_standing: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Document Available</span>
                </div>
                {newContractor.has_letter_of_good_standing && (
                  <div className="mt-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newContractor.letter_of_good_standing_expiry || ""}
                      onChange={e => setNewContractor({ ...newContractor, letter_of_good_standing_expiry: e.target.value })}
                    />
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Document</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="block w-full text-sm text-gray-700 dark:text-gray-300"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setFiles(prev => ({ ...prev, letter_of_good_standing: e.target.files?.[0] || null }));
                          }
                        }}
                      />
                      {files.letter_of_good_standing && (
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          Selected: {files.letter_of_good_standing.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Workman's Compensation</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#003049] focus:ring-[#003049] border-gray-300 rounded"
                    checked={newContractor.has_workman_compensation}
                    onChange={e => setNewContractor({ ...newContractor, has_workman_compensation: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Document Available</span>
                </div>
                {newContractor.has_workman_compensation && (
                  <div className="mt-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newContractor.workman_compensation_expiry || ""}
                      onChange={e => setNewContractor({ ...newContractor, workman_compensation_expiry: e.target.value })}
                    />
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Document</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="block w-full text-sm text-gray-700 dark:text-gray-300"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setFiles(prev => ({ ...prev, workman_compensation: e.target.files?.[0] || null }));
                          }
                        }}
                      />
                      {files.workman_compensation && (
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          Selected: {files.workman_compensation.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CIDB Certificate</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#003049] focus:ring-[#003049] border-gray-300 rounded"
                    checked={newContractor.has_cidb_certificate}
                    onChange={e => setNewContractor({ ...newContractor, has_cidb_certificate: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Document Available</span>
                </div>
                {newContractor.has_cidb_certificate && (
                  <div className="mt-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Document</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-gray-700 dark:text-gray-300"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setFiles(prev => ({ ...prev, cidb_certificate: e.target.files?.[0] || null }));
                        }
                      }}
                    />
                    {files.cidb_certificate && (
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        Selected: {files.cidb_certificate.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Registration Document</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#003049] focus:ring-[#003049] border-gray-300 rounded"
                    checked={newContractor.has_company_registration}
                    onChange={e => setNewContractor({ ...newContractor, has_company_registration: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Document Available</span>
                </div>
                {newContractor.has_company_registration && (
                  <div className="mt-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Document</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-gray-700 dark:text-gray-300"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setFiles(prev => ({ ...prev, company_registration: e.target.files?.[0] || null }));
                        }
                      }}
                    />
                    {files.company_registration && (
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        Selected: {files.company_registration.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">VAT Registration</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#003049] focus:ring-[#003049] border-gray-300 rounded"
                    checked={newContractor.has_vat_registration}
                    onChange={e => setNewContractor({ ...newContractor, has_vat_registration: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Document Available</span>
                </div>
                {newContractor.has_vat_registration && (
                  <div className="mt-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Document</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-gray-700 dark:text-gray-300"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setFiles(prev => ({ ...prev, vat_registration: e.target.files?.[0] || null }));
                        }
                      }}
                    />
                    {files.vat_registration && (
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        Selected: {files.vat_registration.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Banking Details Section */}
            <h4 className="text-md font-medium mb-4 text-gray-800 dark:text-gray-200 mt-8">Banking Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.bank_name || ""}
                  onChange={e => setNewContractor({ ...newContractor, bank_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.bank_account_number || ""}
                  onChange={e => setNewContractor({ ...newContractor, bank_account_number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch Code</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.bank_branch_code || ""}
                  onChange={e => setNewContractor({ ...newContractor, bank_branch_code: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContractor.bank_account_type || ""}
                  onChange={e => setNewContractor({ ...newContractor, bank_account_type: e.target.value })}
                >
                  <option value="">Select Account Type</option>
                  <option value="Savings">Savings Account</option>
                  <option value="Cheque">Cheque Account</option>
                  <option value="Current">Current Account</option>
                  <option value="Business">Business Account</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Confirmation Letter</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#003049] focus:ring-[#003049] border-gray-300 rounded"
                    checked={newContractor.has_bank_confirmation_letter}
                    onChange={e => setNewContractor({ ...newContractor, has_bank_confirmation_letter: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Document Available</span>
                </div>
                {newContractor.has_bank_confirmation_letter && (
                  <div className="mt-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Document</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-gray-700 dark:text-gray-300"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setFiles(prev => ({ ...prev, bank_confirmation_letter: e.target.files?.[0] || null }));
                        }
                      }}
                    />
                    {files.bank_confirmation_letter && (
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        Selected: {files.bank_confirmation_letter.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#003049] hover:bg-[#00406a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003049]"
                onClick={handleAdd}
              >
                Add Contractor
              </button>
            </div>
          </div>
        </div>
      )}
      
      {view === "management" && (
        <>
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">Loading contractors...</p>
            </div>
          ) : contractors.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No contractors found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add a new contractor to get started
              </p>
              <button
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#003049] hover:bg-[#00406a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003049]"
                onClick={() => window.location.href = "/contractors?view=add"}
              >
                Add Contractor
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company Name</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registration #</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">VAT #</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Services</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Performance</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {contractors.map((contractor) => (
                    <tr 
                      key={contractor.id} 
                      onClick={() => setEditing(contractor.id)}
                      className="cursor-pointer transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-700 group">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white group-hover:font-medium">
                        {editing === contractor.id ? (
                          <input
                            type="text"
                            value={contractor.company_registered_name}
                            onChange={e => handleEditField(contractor.id, "company_registered_name", e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          contractor.company_registered_name
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white group-hover:font-medium">
                        {editing === contractor.id ? (
                          <input
                            type="text"
                            value={contractor.company_registration_number}
                            onChange={e => handleEditField(contractor.id, "company_registration_number", e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          contractor.company_registration_number
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white group-hover:font-medium">
                        {editing === contractor.id ? (
                          <input
                            type="text"
                            value={contractor.vat_number}
                            onChange={e => handleEditField(contractor.id, "vat_number", e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          contractor.vat_number
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white group-hover:font-medium">
                        {editing === contractor.id ? (
                          <input
                            type="text"
                            value={Array.isArray(contractor.type_of_services_offered) ? contractor.type_of_services_offered.join(", ") : ""}
                            onChange={e => handleEditField(contractor.id, "type_of_services_offered", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                            className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          Array.isArray(contractor.type_of_services_offered) ? contractor.type_of_services_offered.join(", ") : ""
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white group-hover:font-medium">
                        {editing === contractor.id ? (
                          <input
                            type="text"
                            value={contractor.contractor_performance}
                            onChange={e => handleEditField(contractor.id, "contractor_performance", e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          contractor.contractor_performance
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {editing === contractor.id ? (
                          <div className="flex space-x-2">
                            <button 
                              className="bg-black dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSave(contractor.id);
                              }}
                            >
                              Save
                            </button>
                            <button 
                              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditing(null);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="bg-black dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditing(contractor.id);
                            }}
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
        </>
      )}
      
      {view === "documents" && (
        <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Contractor Document Management</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">Review and approve contractor documents</p>
          
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-700 dark:text-gray-300">Loading documents...</p>
            </div>
          ) : contractors.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-700 dark:text-gray-300">No contractors found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contractor</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document Type</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Uploaded</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {contractors.flatMap(contractor => {
                    const documents = [
                      { type: 'B-BBEE Certificate', status: contractor.bee_certificate_status, field: 'bee_certificate_status', hasDoc: contractor.has_bee_certificate },
                      { type: 'Tax Clearance', status: contractor.tax_clearance_status, field: 'tax_clearance_status', hasDoc: contractor.has_tax_clearance },
                      { type: 'Letter of Good Standing', status: contractor.letter_of_good_standing_status, field: 'letter_of_good_standing_status', hasDoc: contractor.has_letter_of_good_standing },
                      { type: 'Workman\'s Compensation', status: contractor.workman_compensation_status, field: 'workman_compensation_status', hasDoc: contractor.has_workman_compensation },
                      { type: 'CIDB Certificate', status: contractor.cidb_certificate_status, field: 'cidb_certificate_status', hasDoc: contractor.has_cidb_certificate },
                      { type: 'Company Registration', status: contractor.company_registration_status, field: 'company_registration_status', hasDoc: contractor.has_company_registration },
                      { type: 'VAT Registration', status: contractor.vat_registration_status, field: 'vat_registration_status', hasDoc: contractor.has_vat_registration },
                      { type: 'Bank Confirmation Letter', status: contractor.bank_confirmation_letter_status, field: 'bank_confirmation_letter_status', hasDoc: contractor.has_bank_confirmation_letter }
                    ];
                    
                    // Filter to only show documents that have been uploaded
                    return documents
                      .filter(doc => doc.hasDoc && doc.status?.status === 'uploaded')
                      .map(doc => (
                        <tr key={`${contractor.id}-${doc.field}`}>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{contractor.company_registered_name}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{doc.type}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending Approval
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                            {doc.status?.uploaded_at ? new Date(doc.status.uploaded_at).toLocaleDateString() : 'Unknown'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="flex space-x-2">
                              <button 
                                className="bg-[#003049] text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-[#00406a] transition-colors"
                                onClick={async () => {
                                  const now = new Date().toISOString();
                                  const update = {
                                    [doc.field]: {
                                      ...doc.status,
                                      status: 'approved',
                                      approved_at: now,
                                      approved_by: currentUser
                                    }
                                  };
                                  
                                  const { error } = await supabase
                                    .from('contractors')
                                    .update(update)
                                    .eq('id', contractor.id);
                                    
                                  if (error) {
                                    console.error('Error approving document:', error);
                                  } else {
                                    fetchContractors();
                                  }
                                }}
                              >
                                Approve
                              </button>
                              <button 
                                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                onClick={async () => {
                                  const now = new Date().toISOString();
                                  const update = {
                                    [doc.field]: {
                                      ...doc.status,
                                      status: 'declined',
                                      declined_at: now,
                                      declined_by: currentUser
                                    }
                                  };
                                  
                                  const { error } = await supabase
                                    .from('contractors')
                                    .update(update)
                                    .eq('id', contractor.id);
                                    
                                  if (error) {
                                    console.error('Error declining document:', error);
                                  } else {
                                    fetchContractors();
                                  }
                                }}
                              >
                                Decline
                              </button>
                              <button 
                                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                onClick={() => {
                                  // Logic to view the document would go here
                                  // This would typically open the document in a new tab or modal
                                  alert('View document functionality will be implemented in the future');
                                }}
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                  })}
                </tbody>
              </table>
              
              {/* Show approved and declined documents */}
              <h4 className="text-md font-medium mt-8 mb-4 text-gray-800 dark:text-gray-200">Processed Documents</h4>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contractor</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document Type</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Processed Date</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Processed By</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {contractors.flatMap(contractor => {
                    const documents = [
                      { type: 'B-BBEE Certificate', status: contractor.bee_certificate_status, field: 'bee_certificate_status', hasDoc: contractor.has_bee_certificate },
                      { type: 'Tax Clearance', status: contractor.tax_clearance_status, field: 'tax_clearance_status', hasDoc: contractor.has_tax_clearance },
                      { type: 'Letter of Good Standing', status: contractor.letter_of_good_standing_status, field: 'letter_of_good_standing_status', hasDoc: contractor.has_letter_of_good_standing },
                      { type: 'Workman\'s Compensation', status: contractor.workman_compensation_status, field: 'workman_compensation_status', hasDoc: contractor.has_workman_compensation },
                      { type: 'CIDB Certificate', status: contractor.cidb_certificate_status, field: 'cidb_certificate_status', hasDoc: contractor.has_cidb_certificate },
                      { type: 'Company Registration', status: contractor.company_registration_status, field: 'company_registration_status', hasDoc: contractor.has_company_registration },
                      { type: 'VAT Registration', status: contractor.vat_registration_status, field: 'vat_registration_status', hasDoc: contractor.has_vat_registration },
                      { type: 'Bank Confirmation Letter', status: contractor.bank_confirmation_letter_status, field: 'bank_confirmation_letter_status', hasDoc: contractor.has_bank_confirmation_letter }
                    ];
                    
                    // Filter to only show documents that have been approved or declined
                    return documents
                      .filter(doc => doc.hasDoc && (doc.status?.status === 'approved' || doc.status?.status === 'declined'))
                      .map(doc => (
                        <tr key={`${contractor.id}-${doc.field}-processed`}>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{contractor.company_registered_name}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{doc.type}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                            {doc.status?.status === 'approved' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Declined
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                            {doc.status?.status === 'approved' 
                              ? (doc.status?.approved_at ? new Date(doc.status.approved_at).toLocaleDateString() : 'Unknown')
                              : (doc.status?.declined_at ? new Date(doc.status.declined_at).toLocaleDateString() : 'Unknown')
                            }
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                            {doc.status?.status === 'approved' ? doc.status?.approved_by : doc.status?.declined_by}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <button 
                              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                              onClick={() => {
                                // Logic to view the document would go here
                                alert('View document functionality will be implemented in the future');
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ));
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {view === "reports" && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">Contractor reports coming soon</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            This feature is under development
          </p>
        </div>
      )}
    </div>
  );
}

export default function ContractorsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading contractors...</div>}>
      <ContractorsContent />
    </Suspense>
  );
}
