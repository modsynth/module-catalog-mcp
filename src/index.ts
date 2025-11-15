#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const MODULES = [
  // Backend Modules
  { name: 'auth-module', category: 'backend', description: 'JWT + OAuth2.0 authentication', techStack: ['Go', 'JWT', 'OAuth2.0'], version: 'v0.1.0', cicd: true },
  { name: 'db-module', category: 'backend', description: 'GORM database abstraction (PostgreSQL, MySQL, SQLite)', techStack: ['Go', 'GORM', 'PostgreSQL'], version: 'v0.1.0', cicd: true },
  { name: 'cache-module', category: 'backend', description: 'Redis caching client', techStack: ['Go', 'Redis'], version: 'v0.1.0', cicd: true },
  { name: 'logging-module', category: 'backend', description: 'Structured logging with Zap', techStack: ['Go', 'Zap'], version: 'v0.1.0', cicd: false },
  { name: 'api-gateway', category: 'backend', description: 'Gin-based API gateway with routing and middleware', techStack: ['Go', 'Gin'], version: 'v0.1.0', cicd: true },
  { name: 'messaging-module', category: 'backend', description: 'RabbitMQ/Kafka message queue abstraction', techStack: ['Go', 'RabbitMQ', 'Kafka'], version: 'v0.1.0', cicd: false },
  { name: 'file-storage-module', category: 'backend', description: 'S3/MinIO file storage', techStack: ['Go', 'S3', 'MinIO'], version: 'v0.1.0', cicd: false },
  { name: 'notification-module', category: 'backend', description: 'Email/SMS/Push notifications', techStack: ['Go', 'SMTP', 'Twilio'], version: 'v0.1.0', cicd: false },
  { name: 'monitoring-module', category: 'backend', description: 'Prometheus metrics and monitoring', techStack: ['Go', 'Prometheus'], version: 'v0.1.0', cicd: false },
  { name: 'task-scheduler', category: 'backend', description: 'Cron job scheduler', techStack: ['Go', 'Cron'], version: 'v0.1.0', cicd: false },
  { name: 'search-module', category: 'backend', description: 'Elasticsearch search integration', techStack: ['Go', 'Elasticsearch'], version: 'v0.1.0', cicd: true },
  { name: 'payment-module', category: 'backend', description: 'Stripe/PayPal payment processing', techStack: ['Go', 'Stripe', 'PayPal'], version: 'v0.1.0', cicd: true },

  // Frontend Modules
  { name: 'ui-components', category: 'frontend', description: 'Tailwind CSS React UI components with Card, Spinner, and utility functions', techStack: ['React', 'TypeScript', 'Tailwind CSS'], version: 'v0.2.0', cicd: true },
  { name: 'api-client', category: 'frontend', description: 'Axios REST API client with React hooks and retry logic', techStack: ['TypeScript', 'Axios'], version: 'v0.2.0', cicd: true },
  { name: 'state-management', category: 'frontend', description: 'Redux Toolkit state management with typed hooks', techStack: ['TypeScript', 'Redux Toolkit'], version: 'v0.2.0', cicd: true },
  { name: 'form-validation', category: 'frontend', description: 'React Hook Form + Zod validation with common schemas', techStack: ['React', 'TypeScript', 'Zod'], version: 'v0.2.0', cicd: false },
  { name: 'routing', category: 'frontend', description: 'React Router navigation with ProtectedRoute and hooks', techStack: ['React', 'TypeScript', 'React Router'], version: 'v0.2.0', cicd: true },
  { name: 'auth-client', category: 'frontend', description: 'Frontend authentication client with JWT utilities', techStack: ['TypeScript', 'React'], version: 'v0.2.0', cicd: true },
  { name: 'error-handling', category: 'frontend', description: 'Error Boundary components with ErrorLogger', techStack: ['React', 'TypeScript'], version: 'v0.2.0', cicd: false },
  { name: 'websocket-client', category: 'frontend', description: 'WebSocket client with auto-reconnect and React hook', techStack: ['TypeScript', 'WebSocket'], version: 'v0.2.0', cicd: false },
  { name: 'i18n', category: 'frontend', description: 'Internationalization with i18next, formatters, and language sync', techStack: ['React', 'TypeScript', 'i18next'], version: 'v0.2.0', cicd: false },
  { name: 'chart-components', category: 'frontend', description: 'Chart.js React chart components with themes', techStack: ['React', 'TypeScript', 'Chart.js'], version: 'v0.2.0', cicd: false },
  { name: 'table-components', category: 'frontend', description: 'TanStack Table components with CSV export and pagination', techStack: ['React', 'TypeScript', 'TanStack Table'], version: 'v0.2.0', cicd: false },
  { name: 'analytics-client', category: 'frontend', description: 'Google Analytics integration with useAnalytics hook', techStack: ['TypeScript', 'Google Analytics'], version: 'v0.2.0', cicd: false },

  // Infrastructure Modules
  { name: 'shared-configs', category: 'infrastructure', description: 'Shared ESLint, Prettier, TypeScript configs, GitHub Actions, Testing', techStack: ['ESLint', 'Prettier', 'TypeScript', 'GitHub Actions'], version: 'v0.3.0', cicd: false },
  { name: 'modules-manifest', category: 'infrastructure', description: 'Multi-repo management with profile-based syncing', techStack: ['Shell', 'JSON'], version: 'v0.1.0', cicd: false },
  { name: 'module-catalog-mcp', category: 'infrastructure', description: 'MCP Server for AI-powered module search', techStack: ['TypeScript', 'MCP'], version: 'v0.1.0', cicd: false },
  { name: 'claude-code-templates', category: 'infrastructure', description: 'Claude Code slash command templates', techStack: ['Markdown'], version: 'v0.1.0', cicd: false },

  // Documentation
  { name: 'docs-dev', category: 'documentation', description: 'Architecture documentation and guides', techStack: ['Markdown'], version: 'v0.1.0', cicd: false },
  { name: 'docs-site', category: 'documentation', description: 'Docusaurus documentation website', techStack: ['Docusaurus', 'React', 'TypeScript'], version: 'v0.2.0', cicd: false },

  // Examples
  { name: 'examples', category: 'examples', description: 'Production templates: E-Commerce API, Task Management, Real-Time Chat', techStack: ['Go', 'React', 'TypeScript', 'Docker'], version: 'v0.2.0', cicd: false },
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

    // Authentication
    if (useCase.includes('auth') || useCase.includes('login') || useCase.includes('register')) {
      recommendations.push('auth-module', 'auth-client');
    }

    // Database
    if (useCase.includes('database') || useCase.includes('data') || useCase.includes('store')) {
      recommendations.push('db-module', 'cache-module');
    }

    // API
    if (useCase.includes('api') || useCase.includes('rest') || useCase.includes('http')) {
      recommendations.push('api-gateway', 'api-client');
    }

    // UI/Frontend
    if (useCase.includes('ui') || useCase.includes('frontend') || useCase.includes('component')) {
      recommendations.push('ui-components', 'routing', 'state-management');
    }

    // Real-time
    if (useCase.includes('realtime') || useCase.includes('websocket') || useCase.includes('chat')) {
      recommendations.push('websocket-client', 'messaging-module');
    }

    // Payment
    if (useCase.includes('payment') || useCase.includes('checkout') || useCase.includes('stripe')) {
      recommendations.push('payment-module');
    }

    // Search
    if (useCase.includes('search') || useCase.includes('elasticsearch')) {
      recommendations.push('search-module');
    }

    // File Upload
    if (useCase.includes('file') || useCase.includes('upload') || useCase.includes('storage')) {
      recommendations.push('file-storage-module');
    }

    // Notifications
    if (useCase.includes('notification') || useCase.includes('email') || useCase.includes('sms')) {
      recommendations.push('notification-module');
    }

    // Monitoring
    if (useCase.includes('monitor') || useCase.includes('metric') || useCase.includes('prometheus')) {
      recommendations.push('monitoring-module', 'logging-module');
    }

    // Charts/Data Visualization
    if (useCase.includes('chart') || useCase.includes('graph') || useCase.includes('visual')) {
      recommendations.push('chart-components', 'table-components');
    }

    // Forms
    if (useCase.includes('form') || useCase.includes('validation')) {
      recommendations.push('form-validation');
    }

    // Internationalization
    if (useCase.includes('i18n') || useCase.includes('translation') || useCase.includes('language')) {
      recommendations.push('i18n');
    }

    // E-commerce
    if (useCase.includes('ecommerce') || useCase.includes('shop') || useCase.includes('product')) {
      recommendations.push('auth-module', 'db-module', 'cache-module', 'payment-module', 'search-module', 'file-storage-module', 'monitoring-module');
    }

    // Task Management
    if (useCase.includes('task') || useCase.includes('project') || useCase.includes('kanban')) {
      recommendations.push('auth-module', 'db-module', 'cache-module', 'websocket-client', 'notification-module', 'file-storage-module', 'ui-components', 'state-management', 'routing');
    }

    // Chat Application
    if (useCase.includes('chat') || useCase.includes('messaging')) {
      recommendations.push('auth-module', 'db-module', 'cache-module', 'websocket-client', 'messaging-module', 'search-module', 'file-storage-module', 'notification-module', 'ui-components', 'state-management');
    }

    const modules = MODULES.filter(m => recommendations.includes(m.name));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            useCase: (args as any).useCase,
            recommendedModules: modules,
            totalModules: modules.length,
          }, null, 2),
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
