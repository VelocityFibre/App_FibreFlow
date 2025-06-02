import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET all steps for a phase
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phaseId = searchParams.get('phase_id');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    let query = supabase
      .from('steps')
      .select(`
        *,
        phase:phases(id, name),
        tasks(id, title, status, order_index)
      `)
      .eq('is_active', true)
      .order('order_index');
    
    if (phaseId) {
      query = query.eq('phase_id', phaseId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch steps', details: error.message },
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

// POST create new step
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    
    // Validate required fields
    if (!body.phase_id || !body.name) {
      return NextResponse.json(
        { error: 'phase_id and name are required' },
        { status: 400 }
      );
    }
    
    // Get the next order_index for this phase
    const { data: maxOrder } = await supabase
      .from('steps')
      .select('order_index')
      .eq('phase_id', body.phase_id)
      .order('order_index', { ascending: false })
      .limit(1);
    
    const nextOrderIndex = maxOrder && maxOrder.length > 0 
      ? maxOrder[0].order_index + 1 
      : 1;
    
    const { data, error } = await supabase
      .from('steps')
      .insert({
        phase_id: body.phase_id,
        name: body.name,
        description: body.description || null,
        order_index: body.order_index || nextOrderIndex,
        is_active: true
      })
      .select(`
        *,
        phase:phases(id, name),
        tasks(id, title, status, order_index)
      `)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create step', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update step
export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Step ID is required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('steps')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        phase:phases(id, name),
        tasks(id, title, status, order_index)
      `)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update step', details: error.message },
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

// DELETE step (soft delete)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stepId = searchParams.get('id');
    
    if (!stepId) {
      return NextResponse.json(
        { error: 'Step ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if step has active tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('step_id', stepId)
      .neq('status', 'cancelled');
    
    if (tasks && tasks.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete step with active tasks. Archive or reassign tasks first.' },
        { status: 409 }
      );
    }
    
    // Soft delete by setting archived_at
    const { data, error } = await supabase
      .from('steps')
      .update({
        is_active: false,
        archived_at: new Date().toISOString()
      })
      .eq('id', stepId)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete step', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Step archived successfully', data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}