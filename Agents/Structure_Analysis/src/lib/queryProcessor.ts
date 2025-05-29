/**
 * Query Processor
 * 
 * This module handles the processing of user queries through a multi-model approach,
 * integrating database queries, vector search, and memory retrieval.
 */

import { naturalLanguageToSQL } from './openai';
import { executeQuery, getDatabaseSchema } from './db';
import { searchVectorStore, hybridSearchVectorStore, formatSearchResults } from './vectorStore';
import { getUserMemory, updateUserMemory } from './memorySystem';
import { getDataSourcePriority, getModelForTask, isMemoryEnabled } from './agentConfig';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Event callbacks for AG-UI integration
export interface QueryProcessorCallbacks {
  onStepStart?: (stepName: string) => void;
  onStepFinish?: (stepName: string) => void;
  onToolStart?: (tool: string, input: any) => string; // Returns toolCallId
  onToolEnd?: (toolCallId: string, output: any) => void;
  onTextDelta?: (delta: string) => void;
}

/**
 * Process a user query using the multi-model approach
 * @param question The user's question
 * @param requestId The unique ID for this request
 * @param callbacks Optional callbacks for AG-UI events
 * @returns The processed query result
 */
export async function processQuery(
  question: string,
  requestId: string,
  callbacks?: QueryProcessorCallbacks
): Promise<{
  sql?: string;
  results?: Record<string, unknown>[];
  summary: string;
  vectorResults?: any;
  usedRag: boolean;
}> {
  // Performance metrics
  const metrics: {
    schemaFetchTime?: number;
    sqlGenerationTime?: number;
    queryExecutionTime?: number;
    vectorSearchTime?: number;
    summaryGenerationTime?: number;
  } = {};

  try {
    // Determine data source priority
    const dataSources = getDataSourcePriority();
    
    // Track which data sources were used
    const usedSources: {
      sql: boolean;
      vector: boolean;
      memory: boolean;
    } = {
      sql: false,
      vector: false,
      memory: false
    };

    // Results from different sources
    let sqlResults: Record<string, unknown>[] | undefined;
    let sql: string | undefined;
    let vectorResults: any = null;
    let memoryResults: any = null;
    
    // Step 1: Get user memory if enabled
    if (isMemoryEnabled() && dataSources.includes('memory')) {
      callbacks?.onStepStart?.('memory_retrieval');
      const toolCallId = callbacks?.onToolStart?.('memoryRetrieval', { question });
      
      try {
        const memory = await getUserMemory(requestId);
        if (memory) {
          memoryResults = memory;
          usedSources.memory = true;
        }
        
        callbacks?.onToolEnd?.(toolCallId || '', { success: true, memory });
      } catch (error) {
        callbacks?.onToolEnd?.(toolCallId || '', { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      
      callbacks?.onStepFinish?.('memory_retrieval');
    }
    
    // Step 2: Process with SQL if it's in the priority list
    if (dataSources.includes('sql')) {
      callbacks?.onStepStart?.('sql_generation');
      
      // Get database schema
      const schemaStartTime = performance.now();
      const toolCallId1 = callbacks?.onToolStart?.('schemaFetch', {});
      
      let schemaDescription: string;
      try {
        schemaDescription = await getDatabaseSchema();
        callbacks?.onToolEnd?.(toolCallId1 || '', { success: true });
      } catch (error) {
        callbacks?.onToolEnd?.(toolCallId1 || '', { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw error;
      }
      
      metrics.schemaFetchTime = performance.now() - schemaStartTime;
      
      // Generate SQL from natural language
      const sqlStartTime = performance.now();
      const toolCallId2 = callbacks?.onToolStart?.('sqlGeneration', { question, schema: '(schema omitted for brevity)' });
      
      try {
        const sqlResult = await naturalLanguageToSQL(question, schemaDescription);
        if (!sqlResult.success || !sqlResult.data) {
          callbacks?.onToolEnd?.(toolCallId2 || '', { 
            success: false, 
            error: sqlResult.error || 'Failed to generate SQL query' 
          });
          throw new Error(sqlResult.error || 'Failed to generate SQL query');
        }
        
        sql = sqlResult.data;
        callbacks?.onToolEnd?.(toolCallId2 || '', { success: true, sql });
      } catch (error) {
        callbacks?.onToolEnd?.(toolCallId2 || '', { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw error;
      }
      
      metrics.sqlGenerationTime = performance.now() - sqlStartTime;
      
      // Execute the SQL query
      const queryStartTime = performance.now();
      const toolCallId3 = callbacks?.onToolStart?.('sqlExecution', { sql });
      
      try {
        const queryResult = await executeQuery(sql);
        if (!queryResult.success) {
          callbacks?.onToolEnd?.(toolCallId3 || '', { 
            success: false, 
            error: queryResult.error || 'Failed to execute SQL query' 
          });
          throw new Error(queryResult.error || 'Failed to execute SQL query');
        }
        
        sqlResults = queryResult.data;
        usedSources.sql = true;
        callbacks?.onToolEnd?.(toolCallId3 || '', { success: true, rowCount: sqlResults?.length || 0 });
      } catch (error) {
        callbacks?.onToolEnd?.(toolCallId3 || '', { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw error;
      }
      
      metrics.queryExecutionTime = performance.now() - queryStartTime;
      callbacks?.onStepFinish?.('sql_generation');
    }
    
    // Step 3: Process with vector search if it's in the priority list
    if (dataSources.includes('vector')) {
      callbacks?.onStepStart?.('vector_search');
      
      const vectorStartTime = performance.now();
      const toolCallId = callbacks?.onToolStart?.('vectorSearch', { question });
      
      try {
        // Try hybrid search first
        vectorResults = await hybridSearchVectorStore(question);
        
        // Fall back to semantic search if hybrid search fails or returns no results
        if (!vectorResults || vectorResults.data.length === 0) {
          vectorResults = await searchVectorStore(question);
        }
        
        if (vectorResults && vectorResults.data.length > 0) {
          usedSources.vector = true;
          callbacks?.onToolEnd?.(toolCallId || '', { 
            success: true, 
            resultCount: vectorResults.data.length 
          });
        } else {
          callbacks?.onToolEnd?.(toolCallId || '', { 
            success: false, 
            error: 'No relevant documents found' 
          });
        }
      } catch (error) {
        callbacks?.onToolEnd?.(toolCallId || '', { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      
      metrics.vectorSearchTime = performance.now() - vectorStartTime;
      callbacks?.onStepFinish?.('vector_search');
    }
    
    // Step 4: Generate final response
    callbacks?.onStepStart?.('response_generation');
    
    const summaryStartTime = performance.now();
    let summary = '';
    
    // Format vector results if available
    const formattedVectorResults = vectorResults ? formatSearchResults(vectorResults) : '';
    
    // Generate summary based on available data
    if (usedSources.sql && sqlResults) {
      // If we have SQL results, generate a summary of them
      const prompt = `
You are an assistant for Velocity Fibre management.

User Question: "${question}"

${sql ? `SQL Query Used:\n\`\`\`sql\n${sql}\n\`\`\`\n\n` : ''}

Query Results:
\`\`\`json
${JSON.stringify(sqlResults, null, 2)}
\`\`\`

${usedSources.vector ? `Additional Context from Documents:\n${formattedVectorResults}\n\n` : ''}
${usedSources.memory ? `User Memory:\n${JSON.stringify(memoryResults, null, 2)}\n\n` : ''}

Please provide a clear, concise answer to the user's question based on the data provided. Include key insights, patterns, or notable information. Format your response in plain text.`;

      const completion = await openai.chat.completions.create({
        model: getModelForTask('reasoning'),
        messages: [
          { role: "system", content: "You are a business analyst that summarizes data in clear, concise language." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: Boolean(callbacks?.onTextDelta),
      });
      
      if (callbacks?.onTextDelta) {
        // Handle streaming response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            callbacks.onTextDelta(content);
            summary += content;
          }
        }
      } else {
        // Handle non-streaming response
        summary = completion.choices[0]?.message?.content || 'No summary could be generated.';
      }
    } else if (usedSources.vector) {
      // If we only have vector results, generate a summary from them
      const prompt = `
You are an assistant for Velocity Fibre management.

User Question: "${question}"

Context from Documents:
${formattedVectorResults}

${usedSources.memory ? `User Memory:\n${JSON.stringify(memoryResults, null, 2)}\n\n` : ''}

Please provide a clear, concise answer to the user's question based on the context provided. If the context doesn't contain enough information to answer the question directly, acknowledge this and provide the most helpful response possible based on what you know. Format your response in plain text.`;

      const completion = await openai.chat.completions.create({
        model: getModelForTask('reasoning'),
        messages: [
          { role: "system", content: "You are a knowledgeable assistant that provides helpful information based on available context." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: Boolean(callbacks?.onTextDelta),
      });
      
      if (callbacks?.onTextDelta) {
        // Handle streaming response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            callbacks.onTextDelta(content);
            summary += content;
          }
        }
      } else {
        // Handle non-streaming response
        summary = completion.choices[0]?.message?.content || 'No summary could be generated.';
      }
    } else {
      // If we have no results from any source, provide a fallback response
      summary = "I don't have enough information to answer that question. Please try asking something about Velocity Fibre's projects, staff, or operations.";
      
      if (callbacks?.onTextDelta) {
        // Stream the fallback response
        for (const char of summary) {
          callbacks.onTextDelta(char);
          await new Promise(resolve => setTimeout(resolve, 10)); // Simulate typing
        }
      }
    }
    
    metrics.summaryGenerationTime = performance.now() - summaryStartTime;
    callbacks?.onStepFinish?.('response_generation');
    
    // Step 5: Update user memory if enabled
    if (isMemoryEnabled()) {
      callbacks?.onStepStart?.('memory_update');
      const toolCallId = callbacks?.onToolStart?.('memoryUpdate', { question });
      
      try {
        await updateUserMemory(requestId, {
          question,
          sql: sql,
          usedSources,
          timestamp: new Date().toISOString()
        });
        
        callbacks?.onToolEnd?.(toolCallId || '', { success: true });
      } catch (error) {
        callbacks?.onToolEnd?.(toolCallId || '', { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      
      callbacks?.onStepFinish?.('memory_update');
    }
    
    // Return the final result
    return {
      sql,
      results: sqlResults,
      summary,
      vectorResults: vectorResults?.data,
      usedRag: usedSources.vector
    };
  } catch (error) {
    console.error('Error processing query:', error);
    throw error;
  }
}
