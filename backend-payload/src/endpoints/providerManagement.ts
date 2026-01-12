import type { Endpoint } from 'payload';

// Default provider configurations
const DEFAULT_PROVIDERS = [
  {
    name: 'anthropic',
    type: 'llm',
    enabled: true,
    priority: 1,
    defaultModel: 'claude-sonnet-4-20250514',
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
    maxTokens: 4096,
    availableModels: [
      { model: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', description: 'Найновіша модель' },
      { model: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', description: 'Попередня версія' },
      { model: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', description: 'Швидка та дешева' },
    ],
  },
  {
    name: 'openai',
    type: 'llm',
    enabled: false,
    priority: 2,
    defaultModel: 'gpt-4o',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    maxTokens: 4096,
    availableModels: [
      { model: 'gpt-4o', label: 'GPT-4o', description: 'Мультимодальна модель' },
      { model: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Дешевша версія' },
      { model: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Попередня версія' },
    ],
  },
  {
    name: 'deepseek',
    type: 'llm',
    enabled: false,
    priority: 3,
    defaultModel: 'deepseek-chat',
    apiKeyEnvVar: 'DEEPSEEK_API_KEY',
    baseUrl: 'https://api.deepseek.com',
    maxTokens: 4096,
    availableModels: [
      { model: 'deepseek-chat', label: 'DeepSeek Chat', description: 'Основна модель' },
      { model: 'deepseek-reasoner', label: 'DeepSeek Reasoner', description: 'Для складних задач' },
    ],
  },
  {
    name: 'google',
    type: 'llm',
    enabled: false,
    priority: 4,
    defaultModel: 'gemini-2.0-flash-exp',
    apiKeyEnvVar: 'GOOGLE_AI_API_KEY',
    maxTokens: 8192,
    availableModels: [
      { model: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash', description: 'Найновіша модель' },
      { model: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Велике контекстне вікно' },
      { model: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Швидка модель' },
    ],
  },
  {
    name: 'groq',
    type: 'llm',
    enabled: false,
    priority: 5,
    defaultModel: 'llama-3.3-70b-versatile',
    apiKeyEnvVar: 'GROQ_API_KEY',
    maxTokens: 4096,
    availableModels: [
      { model: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', description: 'Велика модель' },
      { model: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', description: 'Швидка модель' },
      { model: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', description: 'MoE модель' },
    ],
  },
  {
    name: 'openrouter',
    type: 'llm',
    enabled: false,
    priority: 10,
    defaultModel: 'anthropic/claude-3.5-sonnet',
    apiKeyEnvVar: 'OPENROUTER_API_KEY',
    baseUrl: 'https://openrouter.ai/api/v1',
    maxTokens: 4096,
    availableModels: [
      { model: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 via OpenRouter', description: '' },
      { model: 'openai/gpt-4o', label: 'GPT-4o via OpenRouter', description: '' },
    ],
  },
  {
    name: 'ollama',
    type: 'llm',
    enabled: false,
    priority: 100,
    defaultModel: 'llama3.2',
    apiKeyEnvVar: 'OLLAMA_BASE_URL',
    baseUrl: 'http://localhost:11434',
    maxTokens: 4096,
    availableModels: [
      { model: 'llama3.2', label: 'Llama 3.2', description: 'Локальна модель' },
      { model: 'mistral', label: 'Mistral', description: 'Локальна модель' },
    ],
  },
  {
    name: 'openai-dalle',
    type: 'image',
    enabled: false,
    priority: 1,
    defaultModel: 'dall-e-3',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    availableModels: [
      { model: 'dall-e-3', label: 'DALL-E 3', description: 'Найкраща якість' },
      { model: 'dall-e-2', label: 'DALL-E 2', description: 'Дешевша версія' },
    ],
  },
  {
    name: 'stability',
    type: 'image',
    enabled: false,
    priority: 2,
    defaultModel: 'stable-diffusion-3',
    apiKeyEnvVar: 'STABILITY_API_KEY',
    availableModels: [
      { model: 'stable-diffusion-3', label: 'Stable Diffusion 3', description: '' },
      { model: 'stable-diffusion-xl', label: 'SDXL', description: '' },
    ],
  },
  {
    name: 'replicate',
    type: 'image',
    enabled: false,
    priority: 3,
    defaultModel: 'black-forest-labs/flux-pro',
    apiKeyEnvVar: 'REPLICATE_API_TOKEN',
    availableModels: [
      { model: 'black-forest-labs/flux-pro', label: 'Flux Pro', description: 'Висока якість' },
      { model: 'black-forest-labs/flux-schnell', label: 'Flux Schnell', description: 'Швидка генерація' },
    ],
  },
];

const DEFAULT_TASK_ROUTING = [
  {
    task: 'content-generation',
    description: 'Генерація описів шин, keyBenefits, SEO текстів',
    preferredProvider: 'anthropic',
    preferredModel: 'claude-sonnet-4-20250514',
    fallbackProviders: ['openai', 'deepseek'],
    maxRetries: 2,
    timeoutMs: 60000,
    maxCost: 0.5,
  },
  {
    task: 'content-rewrite',
    description: 'Рерайт та покращення існуючого контенту',
    preferredProvider: 'deepseek',
    preferredModel: 'deepseek-chat',
    fallbackProviders: ['anthropic', 'openai'],
    maxRetries: 2,
    timeoutMs: 45000,
    maxCost: 0.2,
  },
  {
    task: 'quick-task',
    description: 'Швидкі задачі: виправлення, форматування',
    preferredProvider: 'groq',
    preferredModel: 'llama-3.3-70b-versatile',
    fallbackProviders: ['google', 'anthropic'],
    maxRetries: 1,
    timeoutMs: 15000,
    maxCost: 0.05,
  },
  {
    task: 'reasoning',
    description: 'Складний аналіз та логічні задачі',
    preferredProvider: 'deepseek',
    preferredModel: 'deepseek-reasoner',
    fallbackProviders: ['anthropic', 'openai'],
    maxRetries: 2,
    timeoutMs: 120000,
    maxCost: 1.0,
  },
  {
    task: 'content-translation',
    description: 'Переклад контенту',
    preferredProvider: 'google',
    preferredModel: 'gemini-2.0-flash-exp',
    fallbackProviders: ['anthropic', 'deepseek'],
    maxRetries: 2,
    timeoutMs: 30000,
    maxCost: 0.1,
  },
  {
    task: 'image-article',
    description: 'Генерація зображень для статей блогу',
    preferredProvider: 'openai-dalle',
    preferredModel: 'dall-e-3',
    fallbackProviders: ['replicate', 'stability'],
    maxRetries: 2,
    timeoutMs: 120000,
    maxCost: 0.15,
  },
];

/**
 * POST /api/providers/seed
 * Seed default provider and task routing settings
 */
export const providersSeedEndpoint: Endpoint = {
  path: '/providers/seed',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = req.payload;
    let providersCreated = 0;
    let routingCreated = 0;

    // Seed providers
    for (const provider of DEFAULT_PROVIDERS) {
      const existing = await payload.find({
        collection: 'provider-settings',
        where: { name: { equals: provider.name } },
        limit: 1,
      });

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'provider-settings',
          data: provider as any,
        });
        providersCreated++;
      }
    }

    // Seed task routing
    for (const routing of DEFAULT_TASK_ROUTING) {
      const existing = await payload.find({
        collection: 'task-routing',
        where: { task: { equals: routing.task } },
        limit: 1,
      });

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'task-routing',
          data: routing as any,
        });
        routingCreated++;
      }
    }

    return Response.json({
      message: 'Seeding completed',
      providersCreated,
      routingCreated,
    });
  },
};

/**
 * GET /api/providers/status
 * Get status of all providers (with API key availability)
 */
export const providersStatusEndpoint: Endpoint = {
  path: '/providers/status',
  method: 'get',
  handler: async (req) => {
    const payload = req.payload;

    const providers = await payload.find({
      collection: 'provider-settings',
      limit: 100,
      sort: 'priority',
    });

    const routing = await payload.find({
      collection: 'task-routing',
      limit: 100,
    });

    // Check API key availability
    const providersWithStatus = providers.docs.map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      enabled: p.enabled,
      priority: p.priority,
      defaultModel: p.defaultModel,
      hasApiKey: p.apiKeyEnvVar ? Boolean(process.env[p.apiKeyEnvVar]) : true,
      availableModels: p.availableModels || [],
    }));

    return Response.json({
      providers: providersWithStatus,
      taskRouting: routing.docs,
    });
  },
};

/**
 * POST /api/providers/:name/toggle
 * Enable/disable a provider
 */
export const providersToggleEndpoint: Endpoint = {
  path: '/providers/:name/toggle',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const providerName = req.routeParams?.name as string;
    const payload = req.payload;

    const existing = await payload.find({
      collection: 'provider-settings',
      where: { name: { equals: providerName } },
      limit: 1,
    });

    if (existing.docs.length === 0) {
      return Response.json({ error: 'Provider not found' }, { status: 404 });
    }

    const provider = existing.docs[0] as any;
    await payload.update({
      collection: 'provider-settings',
      id: provider.id,
      data: { enabled: !provider.enabled },
    });

    return Response.json({
      name: providerName,
      enabled: !provider.enabled,
    });
  },
};

/**
 * PATCH /api/providers/:name/model
 * Update provider's default model
 */
export const providersUpdateModelEndpoint: Endpoint = {
  path: '/providers/:name/model',
  method: 'patch',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const providerName = req.routeParams?.name as string;
    const body = await req.json?.() as { model: string } | undefined;

    if (!body?.model) {
      return Response.json({ error: 'Model is required' }, { status: 400 });
    }

    const payload = req.payload;

    const existing = await payload.find({
      collection: 'provider-settings',
      where: { name: { equals: providerName } },
      limit: 1,
    });

    if (existing.docs.length === 0) {
      return Response.json({ error: 'Provider not found' }, { status: 404 });
    }

    const provider = existing.docs[0] as any;
    await payload.update({
      collection: 'provider-settings',
      id: provider.id,
      data: { defaultModel: body.model },
    });

    return Response.json({
      name: providerName,
      defaultModel: body.model,
    });
  },
};

/**
 * PATCH /api/task-routing/:task
 * Update task routing configuration
 */
export const taskRoutingUpdateEndpoint: Endpoint = {
  path: '/routing/update/:task',
  method: 'patch',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskName = req.routeParams?.task as string;
    const body = await req.json?.() as {
      preferredProvider?: string;
      preferredModel?: string;
      fallbackProviders?: string[];
      maxRetries?: number;
      timeoutMs?: number;
      maxCost?: number;
    } | undefined;

    if (!body) {
      return Response.json({ error: 'Body is required' }, { status: 400 });
    }

    const payload = req.payload;

    const existing = await payload.find({
      collection: 'task-routing',
      where: { task: { equals: taskName } },
      limit: 1,
    });

    if (existing.docs.length === 0) {
      return Response.json({ error: 'Task routing not found' }, { status: 404 });
    }

    const routing = existing.docs[0] as any;
    const updateData: any = {};

    if (body.preferredProvider !== undefined) {
      updateData.preferredProvider = body.preferredProvider;
    }
    if (body.preferredModel !== undefined) {
      updateData.preferredModel = body.preferredModel;
    }
    if (body.fallbackProviders !== undefined) {
      updateData.fallbackProviders = body.fallbackProviders;
    }
    if (body.maxRetries !== undefined) {
      updateData.maxRetries = body.maxRetries;
    }
    if (body.timeoutMs !== undefined) {
      updateData.timeoutMs = body.timeoutMs;
    }
    if (body.maxCost !== undefined) {
      updateData.maxCost = body.maxCost;
    }

    await payload.update({
      collection: 'task-routing',
      id: routing.id,
      data: updateData,
    });

    return Response.json({
      task: taskName,
      ...updateData,
    });
  },
};
