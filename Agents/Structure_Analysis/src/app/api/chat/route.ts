import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createSSEStream, EventEmitter, EventType } from '@/lib/agui';
import { processQuery } from '@/lib/queryProcessor';
import { isStreamingEnabled } from '@/lib/agentConfig';

/**
 * POST handler for the chat API
 * Implements AG-UI protocol with streaming responses
 */
export async function POST(request: NextRequest) {
  const requestId = uuidv4();
  const startTime = performance.now();
  
  // Parse the request body
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Invalid request body',
        details: 'Request body must be valid JSON'
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Extract the question from the request
  const { question } = requestBody;
  if (!question || typeof question !== 'string') {
    return new Response(
      JSON.stringify({
        error: 'Invalid request',
        details: 'Question parameter is required and must be a string'
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Check if streaming is enabled
  if (!isStreamingEnabled()) {
    // If streaming is disabled, use traditional request/response
    try {
      const result = await processQuery(question, requestId);
      return new Response(
        JSON.stringify({
          id: requestId,
          question,
          ...result,
          timestamp: new Date().toISOString(),
          performance: {
            totalTime: Math.round(performance.now() - startTime)
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error',
          performance: {
            totalTime: Math.round(performance.now() - startTime)
          }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // If streaming is enabled, use SSE with AG-UI events
  const stream = createSSEStream(async (emitter: EventEmitter) => {
    try {
      // Emit RUN_STARTED event
      emitter.emit({
        type: EventType.RUN_STARTED,
        thread_id: requestId,
        run_id: requestId,
        timestamp: Date.now()
      });
      
      // Create a message ID for the assistant's response
      const messageId = uuidv4();
      
      // Emit TEXT_MESSAGE_START event
      emitter.emit({
        type: EventType.TEXT_MESSAGE_START,
        message_id: messageId,
        role: "assistant",
        timestamp: Date.now()
      });
      
      // Process the query with event emission
      await processQuery(question, requestId, {
        onStepStart: (stepName: string) => {
          emitter.emit({
            type: EventType.STEP_STARTED,
            step_name: stepName,
            timestamp: Date.now()
          });
        },
        onStepFinish: (stepName: string) => {
          emitter.emit({
            type: EventType.STEP_FINISHED,
            step_name: stepName,
            timestamp: Date.now()
          });
        },
        onToolStart: (tool: string, input: any) => {
          const toolCallId = uuidv4();
          emitter.emit({
            type: EventType.TOOL_CALL_START,
            tool_call_id: toolCallId,
            tool,
            input,
            timestamp: Date.now()
          });
          return toolCallId;
        },
        onToolEnd: (toolCallId: string, output: any) => {
          emitter.emit({
            type: EventType.TOOL_CALL_END,
            tool_call_id: toolCallId,
            output,
            timestamp: Date.now()
          });
        },
        onTextDelta: (delta: string) => {
          emitter.emit({
            type: EventType.TEXT_MESSAGE_CONTENT,
            message_id: messageId,
            delta,
            timestamp: Date.now()
          });
        }
      });
      
      // Emit TEXT_MESSAGE_END event
      emitter.emit({
        type: EventType.TEXT_MESSAGE_END,
        message_id: messageId,
        timestamp: Date.now()
      });
      
      // Emit RUN_FINISHED event
      emitter.emit({
        type: EventType.RUN_FINISHED,
        thread_id: requestId,
        run_id: requestId,
        timestamp: Date.now()
      });
    } catch (error) {
      // Emit RUN_ERROR event
      emitter.emit({
        type: EventType.RUN_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });
  
  // Return the SSE stream
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

/**
 * GET handler for the chat API
 * Supports SSE connections with query parameters
 */
export async function GET(request: NextRequest) {
  // Extract question from query parameters
  const { searchParams } = new URL(request.url);
  const question = searchParams.get('question');
  
  if (!question) {
    return new Response(
      JSON.stringify({
        error: 'Invalid request',
        details: 'Question parameter is required'
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Handle the request the same way as POST but with query parameters
  const requestId = uuidv4();
  
  // Create SSE stream with AG-UI events
  const stream = createSSEStream(async (emitter: EventEmitter) => {
    try {
      // Emit RUN_STARTED event
      emitter.emit({
        type: EventType.RUN_STARTED,
        thread_id: requestId,
        run_id: requestId,
        timestamp: Date.now()
      });
      
      // Create a message ID for the assistant's response
      const messageId = uuidv4();
      
      // Emit TEXT_MESSAGE_START event
      emitter.emit({
        type: EventType.TEXT_MESSAGE_START,
        message_id: messageId,
        role: "assistant",
        timestamp: Date.now()
      });
      
      // Process the query with event emission
      await processQuery(question, requestId, {
        onStepStart: (stepName: string) => {
          emitter.emit({
            type: EventType.STEP_STARTED,
            step_name: stepName,
            timestamp: Date.now()
          });
        },
        onStepFinish: (stepName: string) => {
          emitter.emit({
            type: EventType.STEP_FINISHED,
            step_name: stepName,
            timestamp: Date.now()
          });
        },
        onToolStart: (tool: string, input: any) => {
          const toolCallId = uuidv4();
          emitter.emit({
            type: EventType.TOOL_CALL_START,
            tool_call_id: toolCallId,
            tool,
            input,
            timestamp: Date.now()
          });
          return toolCallId;
        },
        onToolEnd: (toolCallId: string, output: any) => {
          emitter.emit({
            type: EventType.TOOL_CALL_END,
            tool_call_id: toolCallId,
            output,
            timestamp: Date.now()
          });
        },
        onTextDelta: (delta: string) => {
          emitter.emit({
            type: EventType.TEXT_MESSAGE_CONTENT,
            message_id: messageId,
            delta,
            timestamp: Date.now()
          });
        }
      });
      
      // Emit TEXT_MESSAGE_END event
      emitter.emit({
        type: EventType.TEXT_MESSAGE_END,
        message_id: messageId,
        timestamp: Date.now()
      });
      
      // Emit RUN_FINISHED event
      emitter.emit({
        type: EventType.RUN_FINISHED,
        thread_id: requestId,
        run_id: requestId,
        timestamp: Date.now()
      });
    } catch (error) {
      // Emit RUN_ERROR event
      emitter.emit({
        type: EventType.RUN_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });
  
  // Return the SSE stream
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
