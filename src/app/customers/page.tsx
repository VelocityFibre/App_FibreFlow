"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";

interface Customer {
  id: string;
  client_name: string;
  client_type: string;
  contact_information: string;
  sla_terms: string;
  created_time: string;
  linkedProjects?: string[]; // Array of project IDs
}

interface Project {
  id: string;
  name: string;
  status: string;
  start_date?: string;
}

export default function CustomersPage() {
  const [editing, setEditing] = useState<string|null>(null);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [newCustomer, setNewCustomer] = useState({ 
    client_name: "", 
    client_type: "", 
    contact_information: "", 
    sla_terms: "",
    selectedProjects: [] as string[]
  });
  const [loading, setLoading] = useState(true);

  // Demo data for projects
  const availableProjects: Project[] = [
    {
      id: "proj-1",
      name: "Cape Town Fiber Rollout Phase 1",
      status: "active",
      start_date: "2024-01-15"
    },
    {
      id: "proj-2", 
      name: "Stellenbosch Business District",
      status: "planning",
      start_date: "2024-03-01"
    },
    {
      id: "proj-3",
      name: "Paarl Residential Network",
      status: "active",
      start_date: "2024-02-10"
    },
    {
      id: "proj-4",
      name: "Somerset West Industrial",
      status: "pending",
      start_date: "2024-04-01"
    },
    {
      id: "proj-5",
      name: "Hermanus Coastal Link",
      status: "completed",
      start_date: "2023-11-01"
    }
  ];

  // Demo customers with linked projects
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "cust-1",
      client_name: "VelocityFibre Solutions",
      client_type: "ISP",
      contact_information: "info@velocityfibre.co.za\n+27 21 123 4567\nCape Town, Western Cape",
      sla_terms: "99.9% uptime guarantee\n24/7 technical support\n4-hour response time",
      created_time: "2024-01-10T08:00:00Z",
      linkedProjects: ["proj-1", "proj-3"]
    },
    {
      id: "cust-2", 
      client_name: "Metro Connect Ltd",
      client_type: "Enterprise",
      contact_information: "contracts@metroconnect.co.za\n+27 21 987 6543\nStellenbosch, Western Cape",
      sla_terms: "99.5% uptime guarantee\nBusiness hours support\n8-hour response time",
      created_time: "2024-01-15T10:30:00Z",
      linkedProjects: ["proj-2", "proj-4"]
    },
    {
      id: "cust-3",
      client_name: "Coastal Networks",
      client_type: "Regional ISP", 
      contact_information: "admin@coastal.net\n+27 28 555 1234\nHermanus, Western Cape",
      sla_terms: "99.8% uptime guarantee\n12/7 support coverage\n6-hour response time",
      created_time: "2024-01-20T14:15:00Z",
      linkedProjects: ["proj-5"]
    },
    {
      id: "cust-4",
      client_name: "Business Park Connectivity",
      client_type: "Business Complex",
      contact_information: "facilities@bizpark.co.za\n+27 21 444 5555\nPaarl, Western Cape", 
      sla_terms: "Standard service agreement\nBusiness hours support\n12-hour response time",
      created_time: "2024-02-01T09:00:00Z",
      linkedProjects: ["proj-3", "proj-4"]
    }
  ]);

  useEffect(() => {
    // Simulate loading time for demo
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  function handleSave(id: string) {
    console.log(`Demo: Saved changes for customer ${id}`);
    setEditing(null);
    alert("Demo: Customer changes saved successfully!");
  }

  function handleAdd() {
    if (!newCustomer.client_name) return;
    
    const { selectedProjects, ...customerData } = newCustomer;
    const customerWithId: Customer = {
      id: crypto.randomUUID(),
      ...customerData,
      created_time: new Date().toISOString(),
      linkedProjects: selectedProjects
    };
    
    setCustomers(prev => [...prev, customerWithId]);
    setNewCustomer({ 
      client_name: "", 
      client_type: "", 
      contact_information: "", 
      sla_terms: "",
      selectedProjects: []
    });
    console.log("Demo: Added new customer", customerWithId);
    alert("Demo: Customer added successfully!");
  }

  function toggleCustomerExpansion(customerId: string) {
    setExpandedCustomers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  }

  function linkProjectToCustomer(customerId: string, projectId: string) {
    setCustomers(prev => prev.map(customer => {
      if (customer.id === customerId) {
        const linkedProjects = customer.linkedProjects || [];
        if (!linkedProjects.includes(projectId)) {
          return {
            ...customer,
            linkedProjects: [...linkedProjects, projectId]
          };
        }
      }
      return customer;
    }));
    console.log(`Demo: Linked project ${projectId} to customer ${customerId}`);
  }

  function unlinkProjectFromCustomer(customerId: string, projectId: string) {
    setCustomers(prev => prev.map(customer => {
      if (customer.id === customerId) {
        return {
          ...customer,
          linkedProjects: (customer.linkedProjects || []).filter(id => id !== projectId)
        };
      }
      return customer;
    }));
    console.log(`Demo: Unlinked project ${projectId} from customer ${customerId}`);
  }

  function getProjectById(projectId: string): Project | undefined {
    return availableProjects.find(p => p.id === projectId);
  }

  function getAvailableProjectsForCustomer(customerId: string): Project[] {
    const customer = customers.find(c => c.id === customerId);
    const linkedProjectIds = customer?.linkedProjects || [];
    return availableProjects.filter(project => !linkedProjectIds.includes(project.id));
  }

  function toggleProjectInNewCustomer(projectId: string) {
    setNewCustomer(prev => {
      const selectedProjects = prev.selectedProjects.includes(projectId)
        ? prev.selectedProjects.filter(id => id !== projectId)
        : [...prev.selectedProjects, projectId];
      
      return {
        ...prev,
        selectedProjects
      };
    });
  }

  function handleEditField(id: string, field: string, value: string) {
    setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  }

  return (
    <div className="space-y-12">
      <div className="border-b border-border pb-8 mb-12">
        <h1 className="text-5xl font-light text-foreground mb-4">Customers</h1>
        <p className="text-xl text-muted-foreground font-light">Manage your customer relationships and service agreements</p>
      </div>

      {/* Add new customer form */}
      <section className="mb-20">
        <div className="bg-card border border-border rounded-xl p-12 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-3xl font-light text-foreground mb-12">Add New Customer</h2>
          <div className="max-w-4xl">
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="ff-label">Client Name *</label>
                  <input
                    type="text"
                    placeholder="Enter client name"
                    className="ff-input"
                    value={newCustomer.client_name}
                    onChange={e => setNewCustomer({ ...newCustomer, client_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="ff-label">Client Type</label>
                  <input
                    type="text"
                    placeholder="Enter client type"
                    className="ff-input"
                    value={newCustomer.client_type}
                    onChange={e => setNewCustomer({ ...newCustomer, client_type: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="ff-label">Contact Information</label>
                <textarea
                  placeholder="Enter contact details"
                  className="ff-input resize-none"
                  value={newCustomer.contact_information}
                  onChange={e => setNewCustomer({ ...newCustomer, contact_information: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <label className="ff-label">SLA Terms</label>
                <textarea
                  placeholder="Enter service level agreement terms"
                  className="ff-input resize-none"
                  value={newCustomer.sla_terms}
                  onChange={e => setNewCustomer({ ...newCustomer, sla_terms: e.target.value })}
                  rows={4}
                />
              </div>
              
              {/* Project Selection */}
              <div>
                <label className="ff-label">Link to Projects (Optional)</label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select which projects this customer should be linked to. You can also add these later.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableProjects.map(project => {
                    const isSelected = newCustomer.selectedProjects.includes(project.id);
                    return (
                      <label
                        key={project.id}
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-border hover:border-blue-300 hover:bg-muted/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProjectInNewCustomer(project.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{project.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              project.status === 'active' ? 'bg-green-100 text-green-800' :
                              project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                              project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status}
                            </span>
                            {project.start_date && (
                              <span className="text-xs text-muted-foreground">
                                Start: {new Date(project.start_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                
                {/* Selected Projects Summary */}
                {newCustomer.selectedProjects.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Selected Projects ({newCustomer.selectedProjects.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {newCustomer.selectedProjects.map(projectId => {
                        const project = getProjectById(projectId);
                        return project ? (
                          <span 
                            key={projectId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {project.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4">
                <button
                  className="ff-button-primary px-8 py-3"
                  onClick={handleAdd}
                >
                  Add Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mb-20">
        <h2 className="text-3xl font-light text-foreground mb-12">Customer Directory</h2>
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8">
            <p className="text-muted-foreground text-center">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-medium text-foreground mb-4">No Customers Yet</h3>
              <p className="text-muted-foreground mb-2">Add your first customer using the form above</p>
              <p className="text-sm text-muted-foreground">Customers help you organize projects and track service agreements</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {customers.map((customer) => {
              const isExpanded = expandedCustomers.has(customer.id);
              const linkedProjects = customer.linkedProjects || [];
              const availableProjects = getAvailableProjectsForCustomer(customer.id);
              
              return (
                <div key={customer.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  {/* Customer Header */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleCustomerExpansion(customer.id)}
                            className="flex items-center gap-2 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                          >
                            {isExpanded ? 
                              <ChevronUp className="w-4 h-4" /> : 
                              <ChevronDown className="w-4 h-4" />
                            }
                            <h3 className="text-xl font-medium text-foreground">
                              {editing === customer.id ? (
                                <input
                                  type="text"
                                  value={customer.client_name}
                                  onChange={e => handleEditField(customer.id, "client_name", e.target.value)}
                                  className="ff-input text-lg"
                                />
                              ) : (
                                customer.client_name
                              )}
                            </h3>
                          </button>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="px-2 py-1 bg-muted rounded-full">
                            {editing === customer.id ? (
                              <input
                                type="text"
                                value={customer.client_type || ''}
                                onChange={e => handleEditField(customer.id, "client_type", e.target.value)}
                                className="ff-input text-xs w-24"
                              />
                            ) : (
                              customer.client_type || 'No type'
                            )}
                          </span>
                          <span>{linkedProjects.length} linked project{linkedProjects.length !== 1 ? 's' : ''}</span>
                          <span>Created: {new Date(customer.created_time).toLocaleDateString()}</span>
                        </div>

                        {/* Linked Projects Preview */}
                        {linkedProjects.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {linkedProjects.slice(0, 3).map(projectId => {
                              const project = getProjectById(projectId);
                              return project ? (
                                <span key={projectId} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {project.name}
                                </span>
                              ) : null;
                            })}
                            {linkedProjects.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{linkedProjects.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {editing === customer.id ? (
                          <div className="space-x-2">
                            <button 
                              className="ff-button-primary text-sm px-4 py-2" 
                              onClick={() => handleSave(customer.id)}
                            >
                              Save
                            </button>
                            <button 
                              className="ff-button-ghost text-sm px-4 py-2" 
                              onClick={() => setEditing(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="ff-button-ghost text-sm px-4 py-2" 
                            onClick={() => setEditing(customer.id)}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/20 p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Customer Details */}
                        <div>
                          <h4 className="font-medium text-foreground mb-4">Customer Details</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="ff-label">Contact Information</label>
                              {editing === customer.id ? (
                                <textarea
                                  value={customer.contact_information || ''}
                                  onChange={e => handleEditField(customer.id, "contact_information", e.target.value)}
                                  className="ff-input resize-none"
                                  rows={4}
                                />
                              ) : (
                                <div className="bg-card border border-border rounded-lg p-3 text-sm whitespace-pre-line">
                                  {customer.contact_information || 'No contact information'}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="ff-label">SLA Terms</label>
                              {editing === customer.id ? (
                                <textarea
                                  value={customer.sla_terms || ''}
                                  onChange={e => handleEditField(customer.id, "sla_terms", e.target.value)}
                                  className="ff-input resize-none"
                                  rows={4}
                                />
                              ) : (
                                <div className="bg-card border border-border rounded-lg p-3 text-sm whitespace-pre-line">
                                  {customer.sla_terms || 'No SLA terms defined'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Project Links */}
                        <div>
                          <h4 className="font-medium text-foreground mb-4">Linked Projects</h4>
                          
                          {/* Current Linked Projects */}
                          {linkedProjects.length > 0 ? (
                            <div className="space-y-3 mb-6">
                              {linkedProjects.map(projectId => {
                                const project = getProjectById(projectId);
                                return project ? (
                                  <div key={projectId} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{project.name}</div>
                                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                                          project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                                          project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {project.status}
                                        </span>
                                        {project.start_date && (
                                          <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => unlinkProjectFromCustomer(customer.id, projectId)}
                                      className="text-red-600 hover:text-red-800 p-1"
                                      title="Unlink project"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm mb-6">No projects linked to this customer.</p>
                          )}

                          {/* Add New Project Link */}
                          {availableProjects.length > 0 && (
                            <div>
                              <label className="ff-label">Link New Project</label>
                              <select
                                className="ff-input"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    linkProjectToCustomer(customer.id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="">Select a project to link...</option>
                                {availableProjects.map(project => (
                                  <option key={project.id} value={project.id}>
                                    {project.name} ({project.status})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
