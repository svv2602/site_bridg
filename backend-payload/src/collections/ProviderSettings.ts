import type { CollectionConfig } from 'payload';

// Map provider name to environment variable
const PROVIDER_ENV_VARS: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  'openai-dalle': 'OPENAI_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  google: 'GOOGLE_AI_API_KEY',
  groq: 'GROQ_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  ollama: 'OLLAMA_BASE_URL',
  stability: 'STABILITY_API_KEY',
  replicate: 'REPLICATE_API_TOKEN',
  leonardo: 'LEONARDO_API_KEY',
};

/**
 * Provider Settings Collection
 *
 * Stores LLM/Image provider configuration that can be managed from admin.
 * API keys are read from environment variables (.env file).
 */
export const ProviderSettings: CollectionConfig = {
  slug: 'provider-settings',
  labels: {
    singular: 'Налаштування провайдера',
    plural: 'Налаштування провайдерів',
  },
  admin: {
    group: 'Налаштування',
    description: 'Керування AI провайдерами. API ключі налаштовуються у файлі .env на сервері.',
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'enabled', 'defaultModel', 'apiKeyStatus'],
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-populate apiKeyEnvVar based on provider name
        if (data?.name && PROVIDER_ENV_VARS[data.name]) {
          data.apiKeyEnvVar = PROVIDER_ENV_VARS[data.name];
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'select',
      label: 'Провайдер',
      required: true,
      unique: true,
      options: [
        // LLM Providers
        { label: 'Anthropic (Claude)', value: 'anthropic' },
        { label: 'OpenAI (GPT)', value: 'openai' },
        { label: 'DeepSeek', value: 'deepseek' },
        { label: 'Google (Gemini)', value: 'google' },
        { label: 'Groq', value: 'groq' },
        { label: 'OpenRouter', value: 'openrouter' },
        { label: 'Ollama (локальний)', value: 'ollama' },
        // Image Providers
        { label: 'DALL-E (OpenAI)', value: 'openai-dalle' },
        { label: 'Stability AI', value: 'stability' },
        { label: 'Replicate', value: 'replicate' },
        { label: 'Leonardo AI', value: 'leonardo' },
      ],
    },
    {
      name: 'type',
      type: 'select',
      label: 'Тип',
      required: true,
      options: [
        { label: 'LLM (текст)', value: 'llm' },
        { label: 'Image (зображення)', value: 'image' },
        { label: 'Embedding', value: 'embedding' },
      ],
      admin: {
        description: 'Тип провайдера',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Активний',
      defaultValue: false,
      admin: {
        description: 'Включити/виключити провайдера',
      },
    },
    {
      name: 'priority',
      type: 'number',
      label: 'Пріоритет',
      defaultValue: 10,
      min: 1,
      max: 100,
      admin: {
        description: 'Менше число = вищий пріоритет (1 = найвищий)',
      },
    },
    {
      name: 'defaultModel',
      type: 'text',
      label: 'Модель за замовчуванням',
      admin: {
        components: {
          Field: '/src/components/ModelSelector#ModelSelectorField',
        },
      },
    },
    {
      name: 'availableModels',
      type: 'array',
      label: 'Доступні моделі',
      admin: {
        description: 'Список моделей для вибору',
      },
      fields: [
        {
          name: 'model',
          type: 'text',
          label: 'ID моделі',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Назва',
        },
        {
          name: 'description',
          type: 'text',
          label: 'Опис',
        },
      ],
    },
    {
      name: 'apiKeyEnvVar',
      type: 'text',
      label: 'Змінна середовища',
      admin: {
        hidden: true, // Auto-populated based on provider name
      },
    },
    {
      name: 'apiKeyStatus',
      type: 'ui',
      admin: {
        components: {
          Field: '/src/components/ApiKeyStatus#ApiKeyStatusField',
        },
      },
    },
    {
      name: 'baseUrl',
      type: 'text',
      label: 'Base URL (опціонально)',
      admin: {
        description: 'Для провайдерів з кастомним URL',
      },
    },
    {
      name: 'maxTokens',
      type: 'number',
      label: 'Максимум токенів',
      defaultValue: 4096,
      min: 100,
      max: 128000,
    },
  ],
};

export default ProviderSettings;
