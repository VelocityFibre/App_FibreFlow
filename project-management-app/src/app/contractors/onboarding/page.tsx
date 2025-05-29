"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ProvinceDropdown from "@/components/ProvinceDropdown";

interface ContractorFormData {
  company_name: string;
  registration_number: string;
  vat_number: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  province: string;
  country: string;
  website: string;
  services_offered: string;
  years_experience: string;
  employee_count: string;
  has_insurance: boolean;
  insurance_provider: string;
  insurance_policy_number: string;
  insurance_expiry_date: string;
  has_safety_certification: boolean;
  safety_certification_details: string;
  bank_name: string;
  bank_account_number: string;
  bank_branch_code: string;
  tax_clearance: boolean;
  tax_clearance_expiry: string;
  notes: string;
}

export default function ContractorOnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ContractorFormData>({
    company_name: "",
    registration_number: "",
    vat_number: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    province: "",
    country: "South Africa",
    website: "",
    services_offered: "",
    years_experience: "",
    employee_count: "",
    has_insurance: false,
    insurance_provider: "",
    insurance_policy_number: "",
    insurance_expiry_date: "",
    has_safety_certification: false,
    safety_certification_details: "",
    bank_name: "",
    bank_account_number: "",
    bank_branch_code: "",
    tax_clearance: false,
    tax_clearance_expiry: "",
    notes: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fileUploads, setFileUploads] = useState<{
    company_registration: File | null;
    tax_clearance_certificate: File | null;
    insurance_certificate: File | null;
    safety_certification: File | null;
    bank_confirmation_letter: File | null;
  }>({
    company_registration: null,
    tax_clearance_certificate: null,
    insurance_certificate: null,
    safety_certification: null,
    bank_confirmation_letter: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: keyof typeof fileUploads) => {
    if (e.target.files && e.target.files[0]) {
      setFileUploads(prev => ({
        ...prev,
        [fileType]: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      // Step 1: Insert contractor data
      const { data: contractorData, error: contractorError } = await supabase
        .from('contractors')
        .insert([{
          company_name: formData.company_name,
          registration_number: formData.registration_number,
          vat_number: formData.vat_number,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone,
          // Combine address fields into a single address_line field or use address_line1
          address_line1: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          province: formData.province,
          country: formData.country,
          website: formData.website,
          services_offered: formData.services_offered,
          years_experience: parseInt(formData.years_experience) || 0,
          employee_count: parseInt(formData.employee_count) || 0,
          has_insurance: formData.has_insurance,
          insurance_provider: formData.insurance_provider,
          insurance_policy_number: formData.insurance_policy_number,
          insurance_expiry_date: formData.insurance_expiry_date,
          has_safety_certification: formData.has_safety_certification,
          safety_certification_details: formData.safety_certification_details,
          bank_name: formData.bank_name,
          bank_account_number: formData.bank_account_number,
          bank_branch_code: formData.bank_branch_code,
          tax_clearance: formData.tax_clearance,
          tax_clearance_expiry: formData.tax_clearance_expiry,
          notes: formData.notes,
          onboarding_date: new Date().toISOString(),
          status: 'pending'
        }])
        .select();

      if (contractorError) {
        throw new Error(`Error inserting contractor data: ${contractorError.message}`);
      }

      const contractorId = contractorData?.[0]?.id;
      
      // Step 2: Upload files if contractor was created successfully
      if (contractorId) {
        const uploadPromises = [];
        
        // Upload each file if it exists
        for (const [fileType, file] of Object.entries(fileUploads)) {
          if (file) {
            const filePath = `contractors/${contractorId}/${fileType}_${Date.now()}`;
            uploadPromises.push(
              supabase.storage
                .from('contractor_documents')
                .upload(filePath, file)
                .then(async ({ data: fileData, error: fileError }) => {
                  if (fileError) {
                    console.error(`Error uploading ${fileType}:`, fileError);
                    return null;
                  }
                  
                  // Record the document in the contractor_documents table
                  if (fileData) {
                    const { error: docError } = await supabase
                      .from('contractor_documents')
                      .insert([{
                        contractor_id: contractorId,
                        document_type: fileType,
                        file_path: filePath,
                        file_name: file.name,
                        uploaded_at: new Date().toISOString()
                      }]);
                      
                    if (docError) {
                      console.error(`Error recording document ${fileType}:`, docError);
                    }
                  }
                  
                  return fileData;
                })
            );
          }
        }
        
        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      }
      
      setSuccessMessage("Contractor onboarding information submitted successfully!");
      
      // Reset form after successful submission
      setFormData({
        company_name: "",
        registration_number: "",
        vat_number: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        province: "",
        country: "South Africa",
        website: "",
        services_offered: "",
        years_experience: "",
        employee_count: "",
        has_insurance: false,
        insurance_provider: "",
        insurance_policy_number: "",
        insurance_expiry_date: "",
        has_safety_certification: false,
        safety_certification_details: "",
        bank_name: "",
        bank_account_number: "",
        bank_branch_code: "",
        tax_clearance: false,
        tax_clearance_expiry: "",
        notes: ""
      });
      
      setFileUploads({
        company_registration: null,
        tax_clearance_certificate: null,
        insurance_certificate: null,
        safety_certification: null,
        bank_confirmation_letter: null
      });
      
      // Redirect to contractors list after a short delay
      setTimeout(() => {
        router.push('/contractors');
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting contractor data:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#003049]">Contractor Onboarding</h1>
        <p className="text-gray-600">Complete the form below to onboard a new contractor</p>
      </div>
      
      {successMessage && (
        <div className="bg-[#003049]/10 border border-[#003049]/30 text-[#003049] px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Basic information about the contractor company</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input 
                  id="company_name" 
                  name="company_name" 
                  value={formData.company_name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number *</Label>
                <Input 
                  id="registration_number" 
                  name="registration_number" 
                  value={formData.registration_number} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_number">VAT Number</Label>
                <Input 
                  id="vat_number" 
                  name="vat_number" 
                  value={formData.vat_number} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  name="website" 
                  type="url" 
                  value={formData.website} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input 
                  id="years_experience" 
                  name="years_experience" 
                  type="number" 
                  value={formData.years_experience} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee_count">Number of Employees</Label>
                <Input 
                  id="employee_count" 
                  name="employee_count" 
                  type="number" 
                  value={formData.employee_count} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="services_offered">Services Offered *</Label>
                <Textarea 
                  id="services_offered" 
                  name="services_offered" 
                  value={formData.services_offered} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="List the services this contractor provides"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company_registration">Company Registration Document</Label>
                <Input 
                  id="company_registration" 
                  name="company_registration" 
                  type="file" 
                  onChange={(e) => handleFileChange(e, 'company_registration')} 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="text-sm text-gray-500">Upload company registration certificate (PDF, DOC, or image)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Primary contact details for the contractor</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person *</Label>
                <Input 
                  id="contact_person" 
                  name="contact_person" 
                  value={formData.contact_person} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea 
                  id="address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input 
                    id="postal_code" 
                    name="postal_code" 
                    value={formData.postal_code} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <ProvinceDropdown
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input 
                  id="country" 
                  name="country" 
                  value={formData.country} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Insurance & Certification</CardTitle>
            <CardDescription>Insurance and safety certification details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="has_insurance" 
                name="has_insurance" 
                checked={formData.has_insurance} 
                onChange={handleInputChange} 
                className="h-4 w-4 rounded border-gray-300 text-[#003049] focus:ring-[#003049]"
              />
              <Label htmlFor="has_insurance">Has Insurance</Label>
            </div>
            
            {formData.has_insurance && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6 border-l-2 border-[#003049]/20">
                <div className="space-y-2">
                  <Label htmlFor="insurance_provider">Insurance Provider *</Label>
                  <Input 
                    id="insurance_provider" 
                    name="insurance_provider" 
                    value={formData.insurance_provider} 
                    onChange={handleInputChange} 
                    required={formData.has_insurance} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurance_policy_number">Policy Number *</Label>
                  <Input 
                    id="insurance_policy_number" 
                    name="insurance_policy_number" 
                    value={formData.insurance_policy_number} 
                    onChange={handleInputChange} 
                    required={formData.has_insurance} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurance_expiry_date">Expiry Date *</Label>
                  <Input 
                    id="insurance_expiry_date" 
                    name="insurance_expiry_date" 
                    type="date" 
                    value={formData.insurance_expiry_date} 
                    onChange={handleInputChange} 
                    required={formData.has_insurance} 
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="insurance_certificate">Insurance Certificate</Label>
                  <Input 
                    id="insurance_certificate" 
                    name="insurance_certificate" 
                    type="file" 
                    onChange={(e) => handleFileChange(e, 'insurance_certificate')} 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-gray-500">Upload insurance certificate (PDF, DOC, or image)</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 mt-4">
              <input 
                type="checkbox" 
                id="has_safety_certification" 
                name="has_safety_certification" 
                checked={formData.has_safety_certification} 
                onChange={handleInputChange} 
                className="h-4 w-4 rounded border-gray-300 text-[#003049] focus:ring-[#003049]"
              />
              <Label htmlFor="has_safety_certification">Has Safety Certification</Label>
            </div>
            
            {formData.has_safety_certification && (
              <div className="grid grid-cols-1 gap-4 pl-6 border-l-2 border-[#003049]/20">
                <div className="space-y-2">
                  <Label htmlFor="safety_certification_details">Safety Certification Details *</Label>
                  <Textarea 
                    id="safety_certification_details" 
                    name="safety_certification_details" 
                    value={formData.safety_certification_details} 
                    onChange={handleInputChange} 
                    required={formData.has_safety_certification} 
                    placeholder="Provide details about safety certifications"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="safety_certification">Safety Certification Document</Label>
                  <Input 
                    id="safety_certification" 
                    name="safety_certification" 
                    type="file" 
                    onChange={(e) => handleFileChange(e, 'safety_certification')} 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-gray-500">Upload safety certification document (PDF, DOC, or image)</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Banking & Tax Information</CardTitle>
            <CardDescription>Banking and tax details for payment processing</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name *</Label>
                <Input 
                  id="bank_name" 
                  name="bank_name" 
                  value={formData.bank_name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Account Number *</Label>
                <Input 
                  id="bank_account_number" 
                  name="bank_account_number" 
                  value={formData.bank_account_number} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_branch_code">Branch Code *</Label>
                <Input 
                  id="bank_branch_code" 
                  name="bank_branch_code" 
                  value={formData.bank_branch_code} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bank_confirmation_letter">Bank Confirmation Letter</Label>
              <Input 
                id="bank_confirmation_letter" 
                name="bank_confirmation_letter" 
                type="file" 
                onChange={(e) => handleFileChange(e, 'bank_confirmation_letter')} 
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-sm text-gray-500">Upload bank confirmation letter (PDF, DOC, or image)</p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <input 
                type="checkbox" 
                id="tax_clearance" 
                name="tax_clearance" 
                checked={formData.tax_clearance} 
                onChange={handleInputChange} 
                className="h-4 w-4 rounded border-gray-300 text-[#003049] focus:ring-[#003049]"
              />
              <Label htmlFor="tax_clearance">Has Tax Clearance Certificate</Label>
            </div>
            
            {formData.tax_clearance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-[#003049]/20">
                <div className="space-y-2">
                  <Label htmlFor="tax_clearance_expiry">Tax Clearance Expiry Date *</Label>
                  <Input 
                    id="tax_clearance_expiry" 
                    name="tax_clearance_expiry" 
                    type="date" 
                    value={formData.tax_clearance_expiry} 
                    onChange={handleInputChange} 
                    required={formData.tax_clearance} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_clearance_certificate">Tax Clearance Certificate</Label>
                  <Input 
                    id="tax_clearance_certificate" 
                    name="tax_clearance_certificate" 
                    type="file" 
                    onChange={(e) => handleFileChange(e, 'tax_clearance_certificate')} 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-gray-500">Upload tax clearance certificate (PDF, DOC, or image)</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Any other relevant information about the contractor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                value={formData.notes} 
                onChange={handleInputChange} 
                placeholder="Any additional information or special requirements"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/contractors')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Contractor Information'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
