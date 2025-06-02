import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    // First, check if the steps table exists by trying a simple query
    const { error: stepsCheckError } = await supabase
      .from('steps')
      .select('id')
      .limit(1);

    if (stepsCheckError && stepsCheckError.message.includes('does not exist')) {
      return NextResponse.json(
        { 
          error: 'Database not fully configured', 
          details: 'The steps table does not exist. Please run database-setup.sql in Supabase SQL Editor.',
          setupRequired: true 
        },
        { status: 503 }
      );
    }

    // Fetch project data first
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return NextResponse.json(
        { error: 'Failed to fetch project', details: projectError.message },
        { status: 500 }
      );
    }

    if (!projectData) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch project phases
    const { data: projectPhases, error: phasesError } = await supabase
      .from('project_phases')
      .select('*, phases(*)')
      .eq('project_id', params.projectId)
      .order('created_at');

    if (phasesError) {
      console.error('Error fetching project phases:', phasesError);
    }

    // Build the hierarchy step by step
    const phasesWithSteps = [];

    if (projectPhases && projectPhases.length > 0) {
      for (const projectPhase of projectPhases) {
        const phase = projectPhase.phases;
        if (!phase) continue;

        // Fetch steps for this phase
        const { data: steps, error: stepsError } = await supabase
          .from('steps')
          .select('*')
          .eq('phase_id', phase.id)
          .eq('is_active', true)
          .order('order_index');

        if (stepsError) {
          console.error(`Error fetching steps for phase ${phase.id}:`, stepsError);
        }

        const stepsWithTasks = [];
        if (steps && steps.length > 0) {
          for (const step of steps) {
            // Fetch tasks for this step
            const { data: tasks, error: tasksError } = await supabase
              .from('tasks')
              .select('*')
              .eq('step_id', step.id)
              .order('order_index');

            if (tasksError) {
              console.error(`Error fetching tasks for step ${step.id}:`, tasksError);
            }

            stepsWithTasks.push({
              id: step.id,
              name: step.name,
              description: step.description,
              order_index: step.order_index,
              phase_id: phase.id,
              tasks: tasks?.map(task => ({
                id: task.id,
                title: task.title || task.name,
                description: task.description,
                status: task.status || 'pending',
                order_index: task.order_index || 0,
                assignee_id: task.assignee_id,
                estimated_hours: task.estimated_hours,
                actual_hours: task.actual_hours,
                step_id: step.id,
                created_at: task.created_at,
                updated_at: task.updated_at,
                completed_at: task.completed_at
              })) || []
            });
          }
        }

        phasesWithSteps.push({
          id: phase.id,
          name: phase.name,
          description: phase.description,
          order_index: phase.order_no || phase.order_index || 0,
          is_standard: phase.is_standard,
          project_phase_id: projectPhase.id,
          steps: stepsWithTasks
        });
      }
    }

    // Sort phases by order_index
    phasesWithSteps.sort((a, b) => a.order_index - b.order_index);

    const hierarchy = {
      project: {
        id: projectData.id,
        name: projectData.project_name || projectData.name || 'Unnamed Project',
        description: projectData.description || '',
        status: projectData.status || 'active',
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        created_at: projectData.created_at,
        updated_at: projectData.updated_at
      },
      phases: phasesWithSteps
    };

    return NextResponse.json(hierarchy);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json();
    
    // Update project details
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: body.name,
        description: body.description,
        status: body.status,
        start_date: body.start_date,
        end_date: body.end_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.projectId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update project', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}