/**
 * AG-UI Protocol Implementation
 * 
 * This file implements the AG-UI protocol for standardized agent-user interaction.
 * It provides utilities for emitting and consuming AG-UI events.
 * 
 * @see https://docs.ag-ui.com/introduction
 */

// AG-UI Event Types
export enum EventType {
  // Lifecycle Events
  RUN_STARTED = "RUN_STARTED",
  RUN_FINISHED = "RUN_FINISHED",
  RUN_ERROR = "RUN_ERROR",
  STEP_STARTED = "STEP_STARTED",
  STEP_FINISHED = "STEP_FINISHED",
  
  // Text Message Events
  TEXT_MESSAGE_START = "TEXT_MESSAGE_START",
  TEXT_MESSAGE_CONTENT = "TEXT_MESSAGE_CONTENT",
  TEXT_MESSAGE_END = "TEXT_MESSAGE_END",
  
  // Tool Call Events
  TOOL_CALL_START = "TOOL_CALL_START",
  TOOL_CALL_ARGS = "TOOL_CALL_ARGS",
  TOOL_CALL_END = "TOOL_CALL_END",
  
  // State Management Events
  STATE_SNAPSHOT = "STATE_SNAPSHOT",
  STATE_DELTA = "STATE_DELTA",
  MESSAGES_SNAPSHOT = "MESSAGES_SNAPSHOT",
  
  // Special Events
  RAW = "RAW",
  CUSTOM = "CUSTOM"
}

// Base Event Interface
export interface BaseEvent {
  type: EventType;
  timestamp: number;
  raw_event?: any;
}

// Lifecycle Events
export interface RunStartedEvent extends BaseEvent {
  type: EventType.RUN_STARTED;
  thread_id: string;
  run_id: string;
}

export interface RunFinishedEvent extends BaseEvent {
  type: EventType.RUN_FINISHED;
  thread_id: string;
  run_id: string;
}

export interface RunErrorEvent extends BaseEvent {
  type: EventType.RUN_ERROR;
  message: string;
  code?: string;
}

export interface StepStartedEvent extends BaseEvent {
  type: EventType.STEP_STARTED;
  step_name: string;
}

export interface StepFinishedEvent extends BaseEvent {
  type: EventType.STEP_FINISHED;
  step_name: string;
}

// Text Message Events
export interface TextMessageStartEvent extends BaseEvent {
  type: EventType.TEXT_MESSAGE_START;
  message_id: string;
  role: "assistant";
}

export interface TextMessageContentEvent extends BaseEvent {
  type: EventType.TEXT_MESSAGE_CONTENT;
  message_id: string;
  delta: string;
}

export interface TextMessageEndEvent extends BaseEvent {
  type: EventType.TEXT_MESSAGE_END;
  message_id: string;
}

// Tool Call Events
export interface ToolCallStartEvent extends BaseEvent {
  type: EventType.TOOL_CALL_START;
  tool_call_id: string;
  tool: string;
  input?: any;
}

export interface ToolCallArgsEvent extends BaseEvent {
  type: EventType.TOOL_CALL_ARGS;
  tool_call_id: string;
  args: any;
}

export interface ToolCallEndEvent extends BaseEvent {
  type: EventType.TOOL_CALL_END;
  tool_call_id: string;
  output: any;
}

// State Management Events
export interface StateSnapshotEvent extends BaseEvent {
  type: EventType.STATE_SNAPSHOT;
  state: any;
}

export interface StateDeltaEvent extends BaseEvent {
  type: EventType.STATE_DELTA;
  delta: any;
}

export interface MessagesSnapshotEvent extends BaseEvent {
  type: EventType.MESSAGES_SNAPSHOT;
  messages: any[];
}

// Special Events
export interface RawEvent extends BaseEvent {
  type: EventType.RAW;
  content: any;
}

export interface CustomEvent extends BaseEvent {
  type: EventType.CUSTOM;
  name: string;
  payload: any;
}

// Union type for all AG-UI events
export type AGUIEvent =
  | RunStartedEvent
  | RunFinishedEvent
  | RunErrorEvent
  | StepStartedEvent
  | StepFinishedEvent
  | TextMessageStartEvent
  | TextMessageContentEvent
  | TextMessageEndEvent
  | ToolCallStartEvent
  | ToolCallArgsEvent
  | ToolCallEndEvent
  | StateSnapshotEvent
  | StateDeltaEvent
  | MessagesSnapshotEvent
  | RawEvent
  | CustomEvent;

// Event Emitter Interface
export interface EventEmitter {
  emit(event: AGUIEvent): void;
}

/**
 * Server-side event emitter for SSE (Server-Sent Events)
 */
export class SSEEventEmitter implements EventEmitter {
  private controller: ReadableStreamDefaultController<Uint8Array>;
  private encoder: TextEncoder;

  constructor(controller: ReadableStreamDefaultController<Uint8Array>) {
    this.controller = controller;
    this.encoder = new TextEncoder();
  }

  emit(event: AGUIEvent): void {
    // Add timestamp if not present
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }
    
    // Encode event as SSE message
    const data = `data: ${JSON.stringify(event)}\n\n`;
    this.controller.enqueue(this.encoder.encode(data));
  }
}

/**
 * Create a ReadableStream for SSE with AG-UI events
 */
export function createSSEStream(handler: (emitter: EventEmitter) => Promise<void>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      try {
        const emitter = new SSEEventEmitter(controller);
        await handler(emitter);
        controller.close();
      } catch (error) {
        // Emit error event if handler throws
        const errorEvent: RunErrorEvent = {
          type: EventType.RUN_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        controller.close();
      }
    }
  });
}

/**
 * Client-side event source setup
 */
export interface EventCallbacks {
  onRunStarted?: (event: RunStartedEvent) => void;
  onRunFinished?: (event: RunFinishedEvent) => void;
  onRunError?: (event: RunErrorEvent) => void;
  onStepStarted?: (event: StepStartedEvent) => void;
  onStepFinished?: (event: StepFinishedEvent) => void;
  onTextMessageStart?: (event: TextMessageStartEvent) => void;
  onTextMessageContent?: (event: TextMessageContentEvent) => void;
  onTextMessageEnd?: (event: TextMessageEndEvent) => void;
  onToolCallStart?: (event: ToolCallStartEvent) => void;
  onToolCallArgs?: (event: ToolCallArgsEvent) => void;
  onToolCallEnd?: (event: ToolCallEndEvent) => void;
  onStateSnapshot?: (event: StateSnapshotEvent) => void;
  onStateDelta?: (event: StateDeltaEvent) => void;
  onMessagesSnapshot?: (event: MessagesSnapshotEvent) => void;
  onRaw?: (event: RawEvent) => void;
  onCustom?: (event: CustomEvent) => void;
  onUnknown?: (event: any) => void;
}

/**
 * Set up an EventSource for AG-UI events
 */
export function setupEventSource(url: string, callbacks: EventCallbacks): EventSource {
  const eventSource = new EventSource(url);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as AGUIEvent;
      
      switch (data.type) {
        case EventType.RUN_STARTED:
          callbacks.onRunStarted?.(data as RunStartedEvent);
          break;
        case EventType.RUN_FINISHED:
          callbacks.onRunFinished?.(data as RunFinishedEvent);
          break;
        case EventType.RUN_ERROR:
          callbacks.onRunError?.(data as RunErrorEvent);
          break;
        case EventType.STEP_STARTED:
          callbacks.onStepStarted?.(data as StepStartedEvent);
          break;
        case EventType.STEP_FINISHED:
          callbacks.onStepFinished?.(data as StepFinishedEvent);
          break;
        case EventType.TEXT_MESSAGE_START:
          callbacks.onTextMessageStart?.(data as TextMessageStartEvent);
          break;
        case EventType.TEXT_MESSAGE_CONTENT:
          callbacks.onTextMessageContent?.(data as TextMessageContentEvent);
          break;
        case EventType.TEXT_MESSAGE_END:
          callbacks.onTextMessageEnd?.(data as TextMessageEndEvent);
          break;
        case EventType.TOOL_CALL_START:
          callbacks.onToolCallStart?.(data as ToolCallStartEvent);
          break;
        case EventType.TOOL_CALL_ARGS:
          callbacks.onToolCallArgs?.(data as ToolCallArgsEvent);
          break;
        case EventType.TOOL_CALL_END:
          callbacks.onToolCallEnd?.(data as ToolCallEndEvent);
          break;
        case EventType.STATE_SNAPSHOT:
          callbacks.onStateSnapshot?.(data as StateSnapshotEvent);
          break;
        case EventType.STATE_DELTA:
          callbacks.onStateDelta?.(data as StateDeltaEvent);
          break;
        case EventType.MESSAGES_SNAPSHOT:
          callbacks.onMessagesSnapshot?.(data as MessagesSnapshotEvent);
          break;
        case EventType.RAW:
          callbacks.onRaw?.(data as RawEvent);
          break;
        case EventType.CUSTOM:
          callbacks.onCustom?.(data as CustomEvent);
          break;
        default:
          callbacks.onUnknown?.(data);
      }
    } catch (error) {
      console.error('Error parsing event data:', error);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    // Don't close automatically, allow reconnection attempts
  };
  
  return eventSource;
}

/**
 * Helper function to create AG-UI events with proper timestamps
 */
export function createEvent<T extends AGUIEvent>(event: Omit<T, 'timestamp'>): T {
  return {
    ...event,
    timestamp: Date.now()
  } as T;
}
