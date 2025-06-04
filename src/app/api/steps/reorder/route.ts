import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// PUT reorder steps within a phase
export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    
    // Validate request body
    if (!body.phase_id || !Array.isArray(body.step_orders)) {
      return NextResponse.json(
        { error: 'phase_id and step_orders array are required' },
        { status: 400 }
      );
    }
    
    const { phase_id, step_orders } = body;
    
    // Validate step_orders format: [{ id, order_index }, ...]
    const invalidOrders = step_orders.filter(item => 
      !item.id || typeof item.order_index !== 'number'
    );
    
    if (invalidOrders.length > 0) {
      return NextResponse.json(
        { error: 'Each step_order must have id and order_index' },
        { status: 400 }
      );
    }
    
    // Update each step's order_index
    const updatePromises = step_orders.map(({ id, order_index }) =>
      supabase
        .from('steps')
        .update({ 
          order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('phase_id', phase_id) // Ensure step belongs to the phase
    );
    
    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Failed to reorder some steps', details: errors.map(e => e.error?.message) },
        { status: 500 }
      );
    }
    
    // Fetch updated steps for the phase
    const { data: updatedSteps, error: fetchError } = await supabase
      .from('steps')
      .select(`
        *,
        tasks(id, title, status, order_index)
      `)
      .eq('phase_id', phase_id)
      .eq('is_active', true)
      .order('order_index');
    
    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch updated steps', details: fetchError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Steps reordered successfully',
      steps: updatedSteps
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}