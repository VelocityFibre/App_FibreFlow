/**
 * Memory System
 * 
 * This module provides a memory system for the agent to remember user preferences,
 * common query patterns, and previous interactions.
 */

import { Pool } from 'pg';
import { isMemoryEnabled } from './agentConfig';

// Initialize database connection for memory storage
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Memory interface
export interface AgentMemory {
  userId: string;
  preferences?: {
    favoriteQueries?: string[];
    dataSourcePreference?: 'sql' | 'vector' | 'hybrid';
    detailLevel?: 'brief' | 'detailed' | 'technical';
  };
  commonPatterns?: {
    entityFocus?: string[];
    queryTypes?: string[];
    timeRanges?: string[];
  };
  recentQueries?: {
    question: string;
    timestamp: string;
    sql?: string;
  }[];
  sessionHistory?: {
    sessionId: string;
    startTime: string;
    endTime?: string;
    queryCount: number;
  }[];
}

/**
 * Initialize the memory system
 * Creates the necessary database tables if they don't exist
 */
export async function initializeMemorySystem(): Promise<boolean> {
  if (!isMemoryEnabled()) {
    console.log('Memory system is disabled');
    return false;
  }
  
  try {
    const client = await pool.connect();
    try {
      // Create memory table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS agent_memory (
          user_id TEXT PRIMARY KEY,
          preferences JSONB DEFAULT '{}',
          common_patterns JSONB DEFAULT '{}',
          recent_queries JSONB DEFAULT '[]',
          session_history JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create memory log table for tracking memory updates
      await client.query(`
        CREATE TABLE IF NOT EXISTS agent_memory_log (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          action TEXT NOT NULL,
          data JSONB NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('Memory system initialized successfully');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to initialize memory system:', error);
    return false;
  }
}

/**
 * Get user memory
 * @param userId User ID to get memory for
 * @returns User memory or null if not found
 */
export async function getUserMemory(userId: string): Promise<AgentMemory | null> {
  if (!isMemoryEnabled()) {
    return null;
  }
  
  try {
    const client = await pool.connect();
    try {
      // Check if user memory exists
      const result = await client.query(
        'SELECT * FROM agent_memory WHERE user_id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        // Create new memory for user
        await client.query(
          'INSERT INTO agent_memory (user_id) VALUES ($1)',
          [userId]
        );
        
        return {
          userId,
          preferences: {},
          commonPatterns: {},
          recentQueries: [],
          sessionHistory: []
        };
      }
      
      // Return existing memory
      const memory = result.rows[0];
      return {
        userId,
        preferences: memory.preferences || {},
        commonPatterns: memory.common_patterns || {},
        recentQueries: memory.recent_queries || [],
        sessionHistory: memory.session_history || []
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to get user memory:', error);
    return null;
  }
}

/**
 * Update user memory
 * @param userId User ID to update memory for
 * @param data Data to update in memory
 * @returns Success status
 */
export async function updateUserMemory(
  userId: string,
  data: {
    question: string;
    sql?: string;
    usedSources?: {
      sql: boolean;
      vector: boolean;
      memory: boolean;
    };
    timestamp: string;
  }
): Promise<boolean> {
  if (!isMemoryEnabled()) {
    return false;
  }
  
  try {
    const client = await pool.connect();
    try {
      // Get existing memory
      const memory = await getUserMemory(userId);
      if (!memory) {
        return false;
      }
      
      // Update recent queries
      const recentQueries = memory.recentQueries || [];
      recentQueries.unshift({
        question: data.question,
        timestamp: data.timestamp,
        sql: data.sql
      });
      
      // Keep only the 10 most recent queries
      if (recentQueries.length > 10) {
        recentQueries.length = 10;
      }
      
      // Update common patterns
      const commonPatterns = memory.commonPatterns || {};
      
      // Extract entities from question (simple implementation)
      const entities = extractEntities(data.question);
      const entityFocus = commonPatterns.entityFocus || [];
      
      // Add new entities
      for (const entity of entities) {
        if (!entityFocus.includes(entity)) {
          entityFocus.push(entity);
        }
      }
      
      // Keep only the 10 most common entities
      if (entityFocus.length > 10) {
        entityFocus.length = 10;
      }
      
      // Update preferences based on data source usage
      const preferences = memory.preferences || {};
      if (data.usedSources) {
        if (data.usedSources.sql && data.usedSources.vector) {
          preferences.dataSourcePreference = 'hybrid';
        } else if (data.usedSources.sql) {
          preferences.dataSourcePreference = 'sql';
        } else if (data.usedSources.vector) {
          preferences.dataSourcePreference = 'vector';
        }
      }
      
      // Update favorite queries if this is a repeated question
      const favoriteQueries = preferences.favoriteQueries || [];
      const similarQuestions = recentQueries
        .filter(q => calculateSimilarity(q.question, data.question) > 0.7)
        .map(q => q.question);
      
      if (similarQuestions.length > 1 && !favoriteQueries.includes(data.question)) {
        favoriteQueries.push(data.question);
        
        // Keep only the 5 most favorite queries
        if (favoriteQueries.length > 5) {
          favoriteQueries.shift();
        }
      }
      
      // Update memory in database
      await client.query(
        `UPDATE agent_memory 
         SET preferences = $1, 
             common_patterns = $2, 
             recent_queries = $3, 
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4`,
        [
          { ...preferences, favoriteQueries },
          { ...commonPatterns, entityFocus },
          recentQueries,
          userId
        ]
      );
      
      // Log memory update
      await client.query(
        `INSERT INTO agent_memory_log (user_id, action, data)
         VALUES ($1, $2, $3)`,
        [
          userId,
          'update',
          {
            question: data.question,
            timestamp: data.timestamp,
            usedSources: data.usedSources
          }
        ]
      );
      
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to update user memory:', error);
    return false;
  }
}

/**
 * Start a new session for a user
 * @param userId User ID to start session for
 * @returns Session ID
 */
export async function startSession(userId: string): Promise<string | null> {
  if (!isMemoryEnabled()) {
    return null;
  }
  
  try {
    const client = await pool.connect();
    try {
      // Get existing memory
      const memory = await getUserMemory(userId);
      if (!memory) {
        return null;
      }
      
      // Create new session
      const sessionId = generateSessionId();
      const sessionHistory = memory.sessionHistory || [];
      
      sessionHistory.unshift({
        sessionId,
        startTime: new Date().toISOString(),
        queryCount: 0
      });
      
      // Keep only the 10 most recent sessions
      if (sessionHistory.length > 10) {
        sessionHistory.length = 10;
      }
      
      // Update memory in database
      await client.query(
        `UPDATE agent_memory 
         SET session_history = $1, 
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [sessionHistory, userId]
      );
      
      return sessionId;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to start session:', error);
    return null;
  }
}

/**
 * End a session for a user
 * @param userId User ID to end session for
 * @param sessionId Session ID to end
 * @returns Success status
 */
export async function endSession(userId: string, sessionId: string): Promise<boolean> {
  if (!isMemoryEnabled()) {
    return false;
  }
  
  try {
    const client = await pool.connect();
    try {
      // Get existing memory
      const memory = await getUserMemory(userId);
      if (!memory) {
        return false;
      }
      
      // Find and update session
      const sessionHistory = memory.sessionHistory || [];
      const sessionIndex = sessionHistory.findIndex(s => s.sessionId === sessionId);
      
      if (sessionIndex === -1) {
        return false;
      }
      
      sessionHistory[sessionIndex].endTime = new Date().toISOString();
      
      // Update memory in database
      await client.query(
        `UPDATE agent_memory 
         SET session_history = $1, 
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [sessionHistory, userId]
      );
      
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to end session:', error);
    return false;
  }
}

/**
 * Generate a unique session ID
 * @returns Session ID
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Extract entities from a question
 * @param question Question to extract entities from
 * @returns Array of entities
 */
function extractEntities(question: string): string[] {
  // Simple implementation - extract capitalized words and words after "about"
  const entities: string[] = [];
  
  // Extract capitalized words (potential proper nouns)
  const capitalizedWords = question.match(/\b[A-Z][a-z]+\b/g) || [];
  entities.push(...capitalizedWords);
  
  // Extract words after "about" or "for"
  const aboutMatch = question.match(/\b(?:about|for)\s+(\w+)/gi);
  if (aboutMatch) {
    for (const match of aboutMatch) {
      const entity = match.replace(/\b(?:about|for)\s+/i, '');
      entities.push(entity);
    }
  }
  
  // Common business entities to look for
  const businessEntities = [
    'project', 'staff', 'employee', 'customer', 'client',
    'invoice', 'payment', 'contract', 'report', 'manager',
    'region', 'location', 'department', 'team', 'budget'
  ];
  
  for (const entity of businessEntities) {
    if (question.toLowerCase().includes(entity)) {
      entities.push(entity);
    }
  }
  
  // Remove duplicates and return
  return [...new Set(entities)];
}

/**
 * Calculate similarity between two strings
 * Simple implementation using Jaccard similarity
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity score (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  // Convert to lowercase and split into words
  const words1 = new Set(str1.toLowerCase().split(/\W+/).filter(Boolean));
  const words2 = new Set(str2.toLowerCase().split(/\W+/).filter(Boolean));
  
  // Calculate intersection
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  
  // Calculate union
  const union = new Set([...words1, ...words2]);
  
  // Calculate Jaccard similarity
  return intersection.size / union.size;
}
