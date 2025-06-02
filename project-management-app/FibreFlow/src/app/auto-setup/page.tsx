"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { createAuditLog, AuditAction, AuditResourceType } from "@/lib/auditLogger";

export default function AutoSetup() {
  const [status, setStatus] = useState<string>("Setting up phases and tasks...");
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    async function setupPhasesAndTasks() {
      try {
        setStatus("Checking database schema...");
        
        // First, let's check the structure of the tasks table
        const { data: taskFields, error: taskFieldsError } = await supabase
          .from('tasks')
          .select()
          .limit(1);
          
        if (taskFieldsError) {
          console.log("Error checking tasks table:", taskFieldsError);
        }
        
        // Check if phases already exist
        const { data: existingPhases, error: checkError } = await supabase
          .from("phases")
          .select("id")
          .limit(1);
        
        if (checkError) {
          throw new Error(`Error checking existing phases: ${checkError.message}`);
        }
        
        if (existingPhases && existingPhases.length > 0) {
          setStatus("Phases already exist in the database. No changes made.");
          setIsComplete(true);
          return;
        }
        
        // Define default phases
        const defaultPhases = [
          { name: "Planning", description: "Initial project planning and requirements gathering", order_no: 1 },
          { name: "Design", description: "Technical design and architecture", order_no: 2 },
          { name: "Implementation", description: "Development and construction", order_no: 3 },
          { name: "Testing", description: "Quality assurance and testing", order_no: 4 },
          { name: "Deployment", description: "Final deployment and handover", order_no: 5 }
        ];
        
        // Insert phases
        const { data: phasesData, error } = await supabase
          .from("phases")
          .insert(defaultPhases)
          .select();
        
        if (error) {
          throw new Error(`Error creating phases: ${error.message}`);
        }
        
        // Create audit logs for each phase
        for (const phase of phasesData) {
          await createAuditLog(
            AuditAction.CREATE,
            AuditResourceType.PHASE,
            phase.id,
            { name: phase.name }
          );
        }
        
        setStatus(`Created ${phasesData.length} default phases. Creating tasks...`);
        
        // Let's create some default tasks - without trying to associate them with phases yet
        // We'll create tasks with descriptive names so they can be manually assigned later
        const tasksByPhase = [
          // Planning phase tasks
          [
            { title: "Requirements gathering", description: "Collect and document project requirements" },
            { title: "Stakeholder interviews", description: "Interview key stakeholders" },
            { title: "Project scope definition", description: "Define the scope of the project" }
          ],
          // Design phase tasks
          [
            { title: "Technical architecture", description: "Design the technical architecture" },
            { title: "UI/UX design", description: "Create user interface designs" },
            { title: "Design review", description: "Review and approve designs" }
          ],
          // Implementation phase tasks
          [
            { title: "Development setup", description: "Set up development environment" },
            { title: "Core functionality", description: "Implement core functionality" },
            { title: "Integration", description: "Integrate with external systems" }
          ],
          // Testing phase tasks
          [
            { title: "Test planning", description: "Create test plans" },
            { title: "Unit testing", description: "Perform unit tests" },
            { title: "User acceptance testing", description: "Conduct user acceptance testing" }
          ],
          // Deployment phase tasks
          [
            { title: "Deployment planning", description: "Plan the deployment process" },
            { title: "Production deployment", description: "Deploy to production" },
            { title: "Post-deployment review", description: "Review the deployment and address issues" }
          ]
        ];
        
        // Flatten the tasks array
        const allTasks = tasksByPhase.flat();
        
        // Insert all tasks
        const { data: createdTasks, error: tasksError } = await supabase
          .from("tasks")
          .insert(allTasks)
          .select();
        
        if (tasksError) {
          console.error("Error creating tasks:", tasksError);
          setStatus(`Created ${phasesData.length} phases but failed to create tasks: ${tasksError.message}`);
          setIsComplete(true);
          return;
        }
        
        // Create audit logs for tasks
        if (createdTasks) {
          for (const task of createdTasks) {
            await createAuditLog(
              AuditAction.CREATE,
              AuditResourceType.PROJECT_TASK,
              task.id,
              { title: task.title }
            );
          }
        }
        
        setStatus(`Setup complete! Created ${phasesData.length} phases and ${createdTasks ? createdTasks.length : 0} tasks.`);
        setIsComplete(true);
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error && 'message' in error) {
          errorMessage = String((error as { message?: string }).message);
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        setStatus(`Error: ${errorMessage}`);
        console.error("Error setting up phases:", error);
        setIsComplete(true);
      }
    }
    
    setupPhasesAndTasks();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Automatic Setup
      </h1>
      
      <div className={`p-4 rounded mb-6 ${isComplete ? (status.includes("Error") ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100" : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100") : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"}`}>
        <p className="text-lg">{status}</p>
      </div>
      
      {isComplete && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Default Phases
          </h2>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
            <li>Planning - Initial project planning and requirements gathering</li>
            <li>Design - Technical design and architecture</li>
            <li>Implementation - Development and construction</li>
            <li>Testing - Quality assurance and testing</li>
            <li>Deployment - Final deployment and handover</li>
          </ul>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              What's Next?
            </h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Now that phases and tasks are set up:
            </p>
            <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300">
              <li className="mb-2">Create a new project to test the automatic phase assignment</li>
              <li className="mb-2">The new project will automatically be assigned to the Planning phase</li>
              <li className="mb-2">You can track project progress through the phases and tasks</li>
              <li className="mb-2">Use the Kanban board to visualize task status</li>
            </ol>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <Link href="/projects" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
              Go to Projects
            </Link>
            <Link href="/kanban" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded">
              Go to Kanban Board
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
