"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { format } from "date-fns";

// Define types for our data structures
interface Project {
  id: string;
  name: string;
}

interface Contractor {
  id: string;
  name: string;
}

interface DailyReport {
  id?: string;
  date: string;
  project_id: string;
  contractor_id: string;
  pole_permissions: number;
  missing_status: number;
  declines: number;
  home_signups: number;
  poles_planted: number;
  stringing_meters: number;
  trenching_meters: number;
  homes_connected: number;
  key_issues: string;
  notes: string;
}

export default function DailyReportPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize form with default values
  const [formData, setFormData] = useState<DailyReport>({
    date: format(new Date(), "yyyy-MM-dd"),
    project_id: "",
    contractor_id: "",
    pole_permissions: 0,
    missing_status: 0,
    declines: 0,
    home_signups: 0,
    poles_planted: 0,
    stringing_meters: 0,
    trenching_meters: 0,
    homes_connected: 0,
    key_issues: "",
    notes: ""
  });

  useEffect(() => {
    console.log("Daily report component mounted");
    // Check if Supabase client is initialized correctly
    if (!supabase) {
      console.error("Supabase client is not initialized");
      setErrorMessage("Database connection error. Please check your configuration.");
      return;
    }
    
    // Fetch data from database
    fetchProjects();
    fetchContractors();
    
    // Add debugging info to console
    console.log("Current environment:", {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set"
    });
  }, []);

  async function fetchProjects() {
    try {
      // Log the start of fetching projects
      console.log("Fetching projects...");
      
      // Try the new_projects table first (based on your other code)
      const { data, error } = await supabase.from("new_projects").select("id, name");
      
      if (error) {
        console.error("Error fetching from new_projects:", error);
        
        // Fallback to projects table if new_projects fails
        const fallbackResult = await supabase.from("projects").select("id, name");
        
        if (fallbackResult.error) {
          console.error("Error fetching from projects fallback:", fallbackResult.error);
        } else {
          console.log(`Fetched ${fallbackResult.data?.length || 0} projects from fallback table`);
          setProjects(fallbackResult.data || []);
        }
      } else {
        console.log(`Fetched ${data?.length || 0} projects from new_projects table`);
        setProjects(data || []);
      }
    } catch (error) {
      console.error("Exception fetching projects:", error);
    }
  }

  async function fetchContractors() {
    try {
      // Log the start of fetching contractors
      console.log("Fetching contractors...");
      
      // Try with the contractors table
      const { data, error } = await supabase.from("contractors").select("id, name");
      
      if (error) {
        console.error("Error fetching contractors:", error);
        
        // If no contractors table exists, create some dummy data for testing
        const dummyContractors = [
          { id: "1", name: "Contractor 1" },
          { id: "2", name: "Contractor 2" },
          { id: "3", name: "Contractor 3" }
        ];
        
        console.log("Using dummy contractors for testing");
        setContractors(dummyContractors);
      } else {
        console.log(`Fetched ${data?.length || 0} contractors`);
        setContractors(data || []);
      }
    } catch (error) {
      console.error("Exception fetching contractors:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes("meters") ? parseFloat(value) : 
              ["pole_permissions", "missing_status", "declines", "home_signups", "poles_planted", "homes_connected"].includes(name) ? 
              parseInt(value) || 0 : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    // Validate required fields
    if (!formData.date || !formData.project_id || !formData.contractor_id) {
      setErrorMessage("Please fill in all required fields (Date, Project, and Contractor)");
      setSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("daily_tracker")
        .insert([formData])
        .select();

      if (error) {
        console.error("Error submitting daily report:", error);
        setErrorMessage(`Error submitting daily report: ${error.message}`);
      } else {
        setSuccessMessage("Daily report submitted successfully!");
        // Reset form with today's date
        setFormData({
          date: format(new Date(), "yyyy-MM-dd"),
          project_id: "",
          contractor_id: "",
          pole_permissions: 0,
          missing_status: 0,
          declines: 0,
          home_signups: 0,
          poles_planted: 0,
          stringing_meters: 0,
          trenching_meters: 0,
          homes_connected: 0,
          key_issues: "",
          notes: ""
        });
      }
    } catch (error) {
      console.error("Exception submitting daily report:", error);
      setErrorMessage(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Daily Project Report</h1>
        <p className="text-gray-600">Record daily KPIs and activities from the project site</p>
      </div>

      {successMessage && (
        <div className="bg-[#003049]/10 border border-[#003049]/30 text-[#003049] px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {errorMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daily Tracker Form</CardTitle>
          <CardDescription>
            Enter the daily KPIs and activities for the selected project
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Field */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Project Selection */}
              <div className="space-y-2">
                <Label htmlFor="project_id">Project *</Label>
                <select
                  id="project_id"
                  name="project_id"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.project_id}
                  onChange={(e) => handleSelectChange("project_id", e.target.value)}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contractor Selection */}
              <div className="space-y-2">
                <Label htmlFor="contractor_id">Contractor *</Label>
                <select
                  id="contractor_id"
                  name="contractor_id"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contractor_id}
                  onChange={(e) => handleSelectChange("contractor_id", e.target.value)}
                  required
                >
                  <option value="">Select a contractor</option>
                  {contractors.map((contractor) => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              {/* Pole Permissions */}
              <div className="space-y-2">
                <Label htmlFor="pole_permissions">Pole Permissions</Label>
                <Input
                  id="pole_permissions"
                  name="pole_permissions"
                  type="number"
                  min="0"
                  value={formData.pole_permissions}
                  onChange={handleInputChange}
                />
              </div>

              {/* Missing Status */}
              <div className="space-y-2">
                <Label htmlFor="missing_status">Missing Status</Label>
                <Input
                  id="missing_status"
                  name="missing_status"
                  type="number"
                  min="0"
                  value={formData.missing_status}
                  onChange={handleInputChange}
                />
              </div>

              {/* Declines */}
              <div className="space-y-2">
                <Label htmlFor="declines">Declines</Label>
                <Input
                  id="declines"
                  name="declines"
                  type="number"
                  min="0"
                  value={formData.declines}
                  onChange={handleInputChange}
                />
              </div>

              {/* Home Sign-Ups */}
              <div className="space-y-2">
                <Label htmlFor="home_signups">Home Sign-Ups</Label>
                <Input
                  id="home_signups"
                  name="home_signups"
                  type="number"
                  min="0"
                  value={formData.home_signups}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Poles Planted */}
              <div className="space-y-2">
                <Label htmlFor="poles_planted">Poles Planted</Label>
                <Input
                  id="poles_planted"
                  name="poles_planted"
                  type="number"
                  min="0"
                  value={formData.poles_planted}
                  onChange={handleInputChange}
                />
              </div>

              {/* Stringing */}
              <div className="space-y-2">
                <Label htmlFor="stringing_meters">Stringing (meters)</Label>
                <Input
                  id="stringing_meters"
                  name="stringing_meters"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.stringing_meters}
                  onChange={handleInputChange}
                />
              </div>

              {/* Trenching */}
              <div className="space-y-2">
                <Label htmlFor="trenching_meters">Trenching (meters)</Label>
                <Input
                  id="trenching_meters"
                  name="trenching_meters"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.trenching_meters}
                  onChange={handleInputChange}
                />
              </div>

              {/* Homes Connected */}
              <div className="space-y-2">
                <Label htmlFor="homes_connected">Homes Connected</Label>
                <Input
                  id="homes_connected"
                  name="homes_connected"
                  type="number"
                  min="0"
                  value={formData.homes_connected}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Key Issues */}
            <div className="space-y-2">
              <Label htmlFor="key_issues">Key Issues</Label>
              <Textarea
                id="key_issues"
                name="key_issues"
                rows={3}
                value={formData.key_issues}
                onChange={handleInputChange}
                placeholder="Enter any key issues encountered during the day"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes about the day's activities"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/projects')}
            >
              Cancel
            </Button>
            <button 
              type="submit" 
              className="bg-[#003049] text-white px-4 py-2 rounded hover:bg-[#004b74] transition-colors"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
