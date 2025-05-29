/**
 * Agent Configuration
 * 
 * This file contains the configuration for the agent, including its capabilities,
 * default tools, and model settings. Modify this file to customize the agent for
 * specific tasks.
 */

export interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  defaultTools: string[];
  models: {
    reasoning: string;
    generation: string;
    embedding: string;
  };
  dataSourcePriority: ('sql' | 'vector' | 'memory')[];
  memoryEnabled: boolean;
  streamingEnabled: boolean;
}

/**
 * Default agent configuration
 * Customize this for your specific use case
 */
export const agentConfig: AgentConfig = {
  name: "Velocity Fibre Assistant",
  description: "An AI assistant that helps answer questions about Velocity Fibre data",
  capabilities: [
    "Answer questions about Velocity Fibre data",
    "Generate SQL queries from natural language",
    "Search through documentation and knowledge base",
    "Provide insights and analysis on projects, staff, and operations"
  ],
  defaultTools: [
    "database",
    "vectorSearch",
    "memoryRetrieval"
  ],
  models: {
    reasoning: "gpt-4.1",
    generation: "gpt-4.1-mini",
    embedding: "text-embedding-3-small"
  },
  dataSourcePriority: ['sql', 'vector', 'memory'],
  memoryEnabled: true,
  streamingEnabled: true
};

/**
 * Get the appropriate model for a specific task
 * @param task The task to get the model for
 * @returns The model name to use
 */
export function getModelForTask(task: 'reasoning' | 'generation' | 'embedding'): string {
  return agentConfig.models[task];
}

/**
 * Check if a capability is enabled for this agent
 * @param capability The capability to check
 * @returns True if the capability is enabled
 */
export function hasCapability(capability: string): boolean {
  return agentConfig.capabilities.includes(capability);
}

/**
 * Check if a tool is enabled for this agent
 * @param tool The tool to check
 * @returns True if the tool is enabled
 */
export function hasDefaultTool(tool: string): boolean {
  return agentConfig.defaultTools.includes(tool);
}

/**
 * Get the data source priority for this agent
 * This determines the order in which data sources are queried
 * @returns Array of data source types in priority order
 */
export function getDataSourcePriority(): ('sql' | 'vector' | 'memory')[] {
  return agentConfig.dataSourcePriority;
}

/**
 * Check if memory system is enabled
 * @returns True if memory is enabled
 */
export function isMemoryEnabled(): boolean {
  return agentConfig.memoryEnabled;
}

/**
 * Check if streaming responses are enabled
 * @returns True if streaming is enabled
 */
export function isStreamingEnabled(): boolean {
  return agentConfig.streamingEnabled;
}
