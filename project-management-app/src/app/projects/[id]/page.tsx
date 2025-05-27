"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      const { data, error } = await supabase.from("new_projects").select("*").eq("id", id).single();
      setProject(data);
      setLoading(false);
    }
    if (id) fetchProject();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!project) return <div className="p-8 text-red-500">Project not found.</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-4">{project.name || `Project #${project.id}`}</h1>
      <div className="mb-2 text-gray-500">Created: {project.created_at?.slice(0,10)}</div>
      {/* Add more project fields here as needed */}
      <div className="mt-8">
        <a href="/projects" className="text-blue-600 hover:underline">Back to Projects</a>
      </div>
    </div>
  );
}
