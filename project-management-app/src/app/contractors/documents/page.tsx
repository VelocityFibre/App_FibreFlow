"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Contractor {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
}

interface Document {
  id: string;
  contractor_id: string;
  document_type: string;
  document_name: string;
  file_path: string;
  uploaded_at: string;
  expiry_date: string | null;
  status: string;
}

export default function ContractorDocumentsPage() {
  const router = useRouter();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractor, setSelectedContractor] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");
  const [documentName, setDocumentName] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDocType, setFilterDocType] = useState<string>("all");

  useEffect(() => {
    fetchContractors();
    fetchDocuments();
  }, []);

  async function fetchContractors() {
    try {
      const { data, error } = await supabase
        .from("contractors")
        .select("id, company_name, contact_person, email")
        .order("company_name");

      if (error) {
        console.error("Error fetching contractors:", error);
      } else {
        setContractors(data || []);
      }
    } catch (error) {
      console.error("Exception fetching contractors:", error);
    }
  }

  async function fetchDocuments() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contractor_documents")
        .select(`
          id, 
          contractor_id, 
          document_type, 
          document_name, 
          file_path, 
          uploaded_at, 
          expiry_date, 
          status
        `)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
      } else {
        setDocuments(data || []);
      }
    } catch (error) {
      console.error("Exception fetching documents:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadDocument = async () => {
    if (!selectedContractor || !documentType || !documentName || !file) {
      alert("Please fill in all required fields and select a file.");
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedContractor}/${Date.now()}.${fileExt}`;
      const filePath = `contractor-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('contractor_documents')
        .insert({
          contractor_id: selectedContractor,
          document_type: documentType,
          document_name: documentName,
          file_path: urlData.publicUrl,
          expiry_date: expiryDate || null,
          status: 'active'
        });

      if (dbError) {
        throw dbError;
      }

      // Reset form and refresh documents
      setSelectedContractor("");
      setDocumentType("");
      setDocumentName("");
      setExpiryDate("");
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      fetchDocuments();
      alert("Document uploaded successfully!");
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Error uploading document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contractor_documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        throw error;
      }

      // Refresh documents
      fetchDocuments();
      alert("Document deleted successfully!");
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Error deleting document. Please try again.");
    }
  };

  const updateDocumentStatus = async (documentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contractor_documents')
        .update({ status })
        .eq('id', documentId);

      if (error) {
        throw error;
      }

      // Update local state
      setDocuments(documents.map(doc => 
        doc.id === documentId ? { ...doc, status } : doc
      ));
    } catch (error) {
      console.error("Error updating document status:", error);
      alert("Error updating document status. Please try again.");
    }
  };

  const getContractorName = (contractorId: string) => {
    const contractor = contractors.find(c => c.id === contractorId);
    return contractor ? contractor.company_name : "Unknown";
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const filteredDocuments = documents.filter(doc => {
    // Filter by document type
    if (filterDocType !== "all" && doc.document_type !== filterDocType) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const contractorName = getContractorName(doc.contractor_id).toLowerCase();
      
      return (
        contractorName.includes(searchLower) ||
        doc.document_name.toLowerCase().includes(searchLower) ||
        doc.document_type.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Get unique document types for filter
  const documentTypes = Array.from(new Set(documents.map(doc => doc.document_type)));

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#003049]">Contractor Documents</h1>
        <Button 
          onClick={() => router.push("/contractors/management")}
          className="bg-[#003049] hover:bg-[#004b74]"
        >
          Back to Management
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-[#003049]/20 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-semibold text-[#003049] mb-1">Upload Documents</h3>
            <p className="text-sm text-gray-600 mb-4">Add contractor documents</p>
            <p className="text-sm mb-4">Upload important documents such as certifications, insurance, and compliance documents.</p>
            <Button 
              onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-[#003049] hover:bg-[#004b74]"
            >
              Upload Document
            </Button>
          </div>
        </div>

        <div className="bg-white border border-[#003049]/20 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-semibold text-[#003049] mb-1">Expiring Documents</h3>
            <p className="text-sm text-gray-600 mb-4">Track document expirations</p>
            <p className="text-sm mb-4">View documents that are expiring soon or have already expired.</p>
            <Button 
              onClick={() => document.getElementById('expiring-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-[#003049] hover:bg-[#004b74]"
            >
              View Expiring Documents
            </Button>
          </div>
        </div>

        <div className="bg-white border border-[#003049]/20 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-semibold text-[#003049] mb-1">Document Management</h3>
            <p className="text-sm text-gray-600 mb-4">Manage all documents</p>
            <p className="text-sm mb-4">View, download, and manage all contractor documents in one place.</p>
            <Button 
              onClick={() => document.getElementById('documents-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-[#003049] hover:bg-[#004b74]"
            >
              Manage Documents
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Document Section */}
      <div id="upload-section" className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#003049]">Upload New Document</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contractor</label>
                <select
                  value={selectedContractor}
                  onChange={(e) => setSelectedContractor(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Contractor</option>
                  {contractors.map((contractor) => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Document Type</option>
                  <option value="Business Registration">Business Registration</option>
                  <option value="Insurance Certificate">Insurance Certificate</option>
                  <option value="Tax Clearance">Tax Clearance</option>
                  <option value="Certification">Certification</option>
                  <option value="Contract">Contract</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Document Name</label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter document name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date (if applicable)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Document File</label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted file types: PDF, DOC, DOCX, JPG, PNG (Max size: 5MB)
                </p>
              </div>

              <div className="md:col-span-2">
                <Button
                  onClick={uploadDocument}
                  disabled={uploading}
                  className="w-full bg-[#003049] hover:bg-[#004b74]"
                >
                  {uploading ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Documents Section */}
      <div id="expiring-section" className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#003049]">Expiring Documents</h2>
        
        {loading ? (
          <p className="text-gray-700">Loading documents...</p>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-[#003049]/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents
                    .filter(doc => doc.expiry_date && new Date(doc.expiry_date) < new Date(new Date().setDate(new Date().getDate() + 30)))
                    .map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{getContractorName(doc.contractor_id)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doc.document_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doc.document_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isExpired(doc.expiry_date) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                            {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'N/A'}
                            {isExpired(doc.expiry_date) && ' (Expired)'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(doc.status)}`}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <a 
                              href={doc.file_path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#003049] hover:text-[#004b74]"
                            >
                              View
                            </a>
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {documents.filter(doc => doc.expiry_date && new Date(doc.expiry_date) < new Date(new Date().setDate(new Date().getDate() + 30))).length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No documents expiring in the next 30 days
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* All Documents Section */}
      <div id="documents-section" className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-[#003049]">All Documents</h2>
        
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="doc-type-filter" className="text-sm font-medium">Filter by Type:</label>
            <select
              id="doc-type-filter"
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Types</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64"
            />
          </div>
        </div>
        
        {loading ? (
          <p className="text-gray-700">Loading documents...</p>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-[#003049]/20 shadow-sm">
            <p className="text-gray-500">No documents found matching your criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-[#003049]/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{getContractorName(doc.contractor_id)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doc.document_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doc.document_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(doc.uploaded_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isExpired(doc.expiry_date) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                          {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'N/A'}
                          {isExpired(doc.expiry_date) && ' (Expired)'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={doc.status}
                          onChange={(e) => updateDocumentStatus(doc.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusBadgeClass(doc.status)}`}
                        >
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <a 
                            href={doc.file_path} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#003049] hover:text-[#004b74]"
                          >
                            View
                          </a>
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
