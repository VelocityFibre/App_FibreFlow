# Velocity Fibre Agent Base

This is a base template for creating new Velocity Fibre agents with AG-UI protocol integration. It combines the existing NLQ (Natural Language Query) system with the AG-UI protocol for standardized agent-user interaction.

## Features

- **AG-UI Protocol Integration**: Standardized event-driven communication between agents and UI
- **Multi-Model Architecture**: Combines reasoning, SQL generation, and answer generation models
- **Hybrid Data Access**: SQL database queries + vector search for comprehensive answers
- **Real-Time Streaming**: Server-Sent Events (SSE) for immediate feedback
- **Responsive UI**: Works on desktop and mobile devices
- **Memory System**: Remembers user preferences and common queries

## Quick Start

1. Clone this repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

**Note:** The `.env` file with company API keys is already included in the repository for your convenience.

## Environment Setup

The `.env` file with all necessary API keys and configuration is already included in the repository. No additional setup is required.

If you need to customize any environment variables for your specific development environment, you can create a `.env.local` file which will override the values in the `.env` file.

## Creating a New Agent

To create a new agent for a specific task:

1. Duplicate this base template
2. Modify the agent configuration in `src/lib/agentConfig.ts`
3. Update the prompts in `src/lib/metaPrompts.ts` for your specific use case
4. Customize the UI components in `src/components` as needed
5. Add any additional tools in `src/lib/tools`

## Directory Structure

```
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── chat/        # Chat API with AG-UI events
│   │   │   ├── schema/      # Database schema endpoints
│   │   │   └── setup/       # Setup and configuration endpoints
│   │   ├── dashboard/       # Main dashboard page
│   │   └── login/           # Login page
│   ├── components/          # React components
│   ├── context/             # React context providers
│   ├── lib/                 # Core libraries
│   │   ├── agui.ts          # AG-UI protocol implementation
│   │   ├── db.ts            # Database connection and queries
│   │   ├── memorySystem.ts  # User memory and preferences
│   │   ├── metaPrompts.ts   # LLM prompts for different tasks
│   │   ├── multiModel.ts    # Multi-model processing pipeline
│   │   ├── openai.ts        # OpenAI API integration
│   │   ├── rag.ts           # Retrieval Augmented Generation
│   │   ├── textSplitter.ts  # Text processing utilities
│   │   ├── tools/           # Agent tools
│   │   └── vectorStore.ts   # Vector database integration
│   └── types/               # TypeScript type definitions
├── scripts/                 # Utility scripts
├── .env.example             # Example environment variables
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Core Components

### AG-UI Integration

The AG-UI protocol is implemented in `src/lib/agui.ts` and provides standardized events for agent-user interaction. The main event types are:

- **Lifecycle Events**: `RUN_STARTED`, `RUN_FINISHED`, `RUN_ERROR`, `STEP_STARTED`, `STEP_FINISHED`
- **Text Message Events**: `TEXT_MESSAGE_START`, `TEXT_MESSAGE_CONTENT`, `TEXT_MESSAGE_END`
- **Tool Call Events**: `TOOL_CALL_START`, `TOOL_CALL_ARGS`, `TOOL_CALL_END`
- **State Management Events**: `STATE_SNAPSHOT`, `STATE_DELTA`, `MESSAGES_SNAPSHOT`

### Multi-Model Architecture

The system uses multiple models for different tasks:

- **Reasoning Model**: GPT-4.1 for complex reasoning and final answer generation
- **SQL Generation Model**: GPT-4.1-mini for efficient SQL query generation
- **RAG Model**: Handles vector search and document retrieval

### Database Integration

The system connects to a Neon PostgreSQL database and provides:

- Natural language to SQL conversion
- Schema-aware query generation
- Efficient query execution
- Result formatting and summarization

### Vector Search

The vector search functionality allows:

- Semantic search across documents
- Hybrid search (combining keyword and semantic search)
- Document upload and management
- Context-aware responses

## Customizing for New Tasks

### 1. Update Agent Configuration

Modify `src/lib/agentConfig.ts` to define your agent's capabilities:

```typescript
export const agentConfig = {
  name: "Your Agent Name",
  description: "Description of what your agent does",
  capabilities: [
    "capability1",
    "capability2",
    // Add more capabilities
  ],
  defaultTools: [
    "tool1",
    "tool2",
    // Add default tools
  ],
  models: {
    reasoning: "gpt-4.1",
    generation: "gpt-4.1-mini",
    embedding: "text-embedding-3-small"
  }
};
```

### 2. Update Prompts

Modify the prompts in `src/lib/metaPrompts.ts` to guide the models for your specific use case:

```typescript
export const systemPrompt = `You are a specialized agent that helps with [specific task].
Your goal is to [describe the goal].
...`;

export const sqlGenerationPrompt = `Given a natural language description of a database query, generate a SQL query.
...`;

// Add more task-specific prompts
```

### 3. Add Custom Tools

Create new tools in `src/lib/tools` directory:

```typescript
// src/lib/tools/yourTool.ts
export async function yourTool(params: YourToolParams): Promise<YourToolResult> {
  // Tool implementation
}
```

Register the tool in `src/lib/tools/index.ts`:

```typescript
import { yourTool } from './yourTool';

export const tools = {
  // Existing tools
  yourTool,
};
```

### 4. Customize UI

Update the UI components in `src/components` to match your agent's functionality:

- Modify `ChatMessage.tsx` for custom message rendering
- Update `Dashboard.tsx` for agent-specific controls
- Add new components as needed

## Advanced Configuration

### Memory System

The memory system in `src/lib/memorySystem.ts` allows your agent to remember:

- User preferences
- Common query patterns
- Previous interactions
- Entity focus

Customize the memory schema for your specific agent:

```typescript
export interface AgentMemory {
  userId: string;
  preferences: {
    // Add agent-specific preferences
  };
  commonPatterns: {
    // Add pattern tracking
  };
  // Add more memory structures
}
```

### Vector Store Configuration

Customize the vector store in `src/lib/vectorStore.ts` for your specific knowledge base:

- Update document processing logic
- Modify search parameters
- Adjust result formatting

## Deployment

### GitHub and Vercel Deployment

Follow these steps to deploy your agent:

1. Create a new GitHub repository for your agent

   ```bash
   # Initialize git repository
   git init
   git add .
   git commit -m "Initial commit"

   # Add your GitHub repository as remote
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```

2. Send the repository URL to [ai@velocityfibre.co.za](mailto:ai@velocityfibre.co.za) for Vercel deployment

   The Velocity Fibre AI team will deploy your agent to Vercel. Include the following information in your email:

   - Repository URL
   - Agent name and purpose
   - Any specific environment variables that need to be modified
### Local Production Build

```bash
npm run build
npm start
```

### Docker Deployment

A Dockerfile is provided for containerized deployment:

```bash
docker build -t velocity-fibre-agent .
docker run -p 3000:3000 velocity-fibre-agent
```

## Troubleshooting

### Common Issues

- **API Key Issues**: Ensure all API keys are correctly set in `.env.local`
- **Database Connection**: Check your DATABASE_URL format and credentials
- **Vector Store**: Ensure your vector store ID is valid and the store is populated

### Logs

Check the logs for detailed error information:

- Development: Console output
- Production: `/logs` directory

## Contributing

Please follow the contribution guidelines in CONTRIBUTING.md when making changes to this template.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
