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
  phone: string;
  services_offered: string;
  status: string;
  onboarding_date: string;
}

export default function ContractorManagementPage() {
  const router = useRouter();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchContractors();
  }, []);

  async function fetchContractors() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contractors")
        .select("*")
        .order("company_name");

      if (error) {
        console.error("Error fetching contractors:", error);
      } else {
        setContractors(data || []);
      }
    } catch (error) {
      console.error("Exception fetching contractors:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredContractors = contractors.filter(contractor => {
    // Filter by status
    if (filterStatus !== "all" && contractor.status !== filterStatus) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        contractor.company_name.toLowerCase().includes(searchLower) ||
        contractor.contact_person.toLowerCase().includes(searchLower) ||
        contractor.email.toLowerCase().includes(searchLower) ||
        contractor.services_offered.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  async function updateContractorStatus(contractorId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("contractors")
        .update({ status: newStatus })
        .eq("id", contractorId);

      if (error) {
        console.error("Error updating contractor status:", error);
      } else {
        // Update local state
        setContractors(contractors.map(c => 
          c.id === contractorId ? { ...c, status: newStatus } : c
        ));
      }
    } catch (error) {
      console.error("Exception updating contractor status:", error);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#003049]">Contractor Management</h1>
        <Button 
          onClick={() => router.push("/contractors/onboarding")}
          className="bg-[#003049] hover:bg-[#004b74]"
        >
          Onboard New Contractor
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contractor Management Tools</CardTitle>
          <CardDescription>Manage your contractors and their onboarding process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-[#003049]/5 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#003049] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <h3 className="font-semibold mb-1">Contractor Onboarding</h3>
              <p className="text-sm text-gray-600 mb-3">Add new contractors to your system</p>
              <Button 
                onClick={() => router.push("/contractors/onboarding")}
                size="sm"
              >
                Onboard Contractor
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-[#003049]/5 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#003049] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-semibold mb-1">Document Management</h3>
              <p className="text-sm text-gray-600 mb-3">Manage contractor documents and certifications</p>
              <Button 
                onClick={() => router.push("/contractors/documents")}
                size="sm"
              >
                Manage Documents
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-[#003049]/5 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#003049] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="font-semibold mb-1">Performance Tracking</h3>
              <p className="text-sm text-gray-600 mb-3">Track and evaluate contractor performance</p>
              <Button 
                onClick={() => router.push("/contractors/performance")}
                size="sm"
              >
                View Performance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="status-filter" className="text-sm font-medium">Filter by Status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="Search contractors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-2 w-full md:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Loading contractors...</p>
        </div>
      ) : filteredContractors.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border">
          <p className="text-gray-500">No contractors found matching your criteria</p>
          <Button 
            onClick={() => router.push("/contractors/onboarding")}
            className="mt-4"
          >
            Onboard New Contractor
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContractors.map((contractor) => (
                <tr key={contractor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{contractor.company_name}</div>
                    <div className="text-sm text-gray-500">Onboarded: {new Date(contractor.onboarding_date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contractor.contact_person}</div>
                    <div className="text-sm text-gray-500">{contractor.email}</div>
                    <div className="text-sm text-gray-500">{contractor.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{contractor.services_offered}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(contractor.status)}`}>
                      {contractor.status.charAt(0).toUpperCase() + contractor.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/contractors/${contractor.id}`)}
                        className="text-[#003049] hover:text-[#004b74]"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/contractors/${contractor.id}/edit`)}
                        className="text-[#003049] hover:text-[#004b74]"
                      >
                        Edit
                      </button>
                      <select
                        value={contractor.status}
                        onChange={(e) => updateContractorStatus(contractor.id, e.target.value)}
                        className="text-xs border rounded px-1"
                      >
                        <option value="active">Set Active</option>
                        <option value="pending">Set Pending</option>
                        <option value="suspended">Set Suspended</option>
                        <option value="inactive">Set Inactive</option>
                      </select>
                    </div>
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
