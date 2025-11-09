#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const MODULES = [
  { name: 'auth-module', category: 'backend', description: 'JWT + OAuth2.0 authentication', techStack: ['Go', 'JWT', 'OAuth2.0'] },
  { name: 'db-module', category: 'backend', description: 'GORM database abstraction', techStack: ['Go', 'GORM', 'PostgreSQL'] },
  { name: 'cache-module', category: 'backend', description: 'Redis cache client', techStack: ['Go', 'Redis'] },
  { name: 'ui-components', category: 'frontend', description: 'React UI components', techStack: ['React', 'Tailwind CSS'] },
  { name: 'api-client', category: 'frontend', description: 'Axios REST client', techStack: ['TypeScript', 'Axios'] },
];

const server = new Server(
  {
    name: 'module-catalog-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_modules',
        description: 'Search for Modsynth modules by keyword, category, or tech stack',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query (name, category, or technology)' },
          },
          required: ['query'],
        },
      },
      {
        name: 'recommend_modules',
        description: 'Get module recommendations for a use case',
        inputSchema: {
          type: 'object',
          properties: {
            useCase: { type: 'string', description: 'Use case description' },
          },
          required: ['useCase'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'search_modules') {
    const query = (args as any).query.toLowerCase();
    const results = MODULES.filter(m => 
      m.name.includes(query) || 
      m.category.includes(query) ||
      m.description.toLowerCase().includes(query) ||
      m.techStack.some(t => t.toLowerCase().includes(query))
    );
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  if (name === 'recommend_modules') {
    const useCase = (args as any).useCase.toLowerCase();
    let recommendations = [];
    
    if (useCase.includes('auth') || useCase.includes('login')) {
      recommendations.push('auth-module', 'auth-client');
    }
    if (useCase.includes('database') || useCase.includes('data')) {
      recommendations.push('db-module', 'cache-module');
    }
    if (useCase.includes('ui') || useCase.includes('frontend')) {
      recommendations.push('ui-components', 'api-client');
    }
    
    const modules = MODULES.filter(m => recommendations.includes(m.name));
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(modules, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
