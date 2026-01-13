import type { CollectionConfig } from 'payload';

/**
 * Task Routing Collection
 *
 * Defines which provider/model to use for each content generation task.
 */
export const TaskRouting: CollectionConfig = {
  slug: 'task-routing',
  labels: {
    singular: 'Маршрут задачі',
    plural: 'Маршрутизація задач',
  },
  admin: {
    group: 'Налаштування',
    description: 'Вибір провайдера та моделі для кожного типу задачі',
    useAsTitle: 'task',
    defaultColumns: ['task', 'preferredProvider', 'preferredModel', 'maxCost'],
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'task',
      type: 'select',
      label: 'Тип задачі',
      required: true,
      unique: true,
      options: [
        { label: 'Генерація контенту (описи шин)', value: 'content-generation' },
        { label: 'Рерайт контенту', value: 'content-rewrite' },
        { label: 'Швидкі задачі', value: 'quick-task' },
        { label: 'Аналіз та reasoning', value: 'reasoning' },
        { label: 'Аналіз даних', value: 'analysis' },
        { label: 'Переклад', value: 'content-translation' },
        { label: 'Генерація коду', value: 'code-generation' },
        { label: 'Зображення для статей', value: 'image-article' },
        { label: 'Зображення продуктів', value: 'image-product' },
        { label: 'Lifestyle зображення', value: 'image-lifestyle' },
        { label: 'Банери', value: 'image-banner' },
        { label: 'Embedding для пошуку', value: 'embedding-search' },
        { label: 'Embedding для similarity', value: 'embedding-similarity' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Опис задачі',
      admin: {
        description: 'Для чого використовується цей тип задачі',
      },
    },
    {
      name: 'preferredProvider',
      type: 'select',
      label: 'Основний провайдер',
      required: true,
      options: [
        // LLM
        { label: 'Anthropic (Claude)', value: 'anthropic' },
        { label: 'OpenAI (GPT)', value: 'openai' },
        { label: 'DeepSeek', value: 'deepseek' },
        { label: 'Google (Gemini)', value: 'google' },
        { label: 'Groq', value: 'groq' },
        { label: 'OpenRouter', value: 'openrouter' },
        { label: 'Ollama', value: 'ollama' },
        // Image
        { label: 'DALL-E', value: 'openai-dalle' },
        { label: 'Stability AI', value: 'stability' },
        { label: 'Replicate', value: 'replicate' },
        { label: 'Leonardo AI', value: 'leonardo' },
      ],
    },
    {
      name: 'preferredModel',
      type: 'text',
      label: 'Модель',
      required: true,
      admin: {
        description: 'ID моделі: claude-sonnet-4-20250514, gpt-4o, deepseek-chat, тощо',
      },
    },
    {
      name: 'fallbackModels',
      type: 'array',
      label: 'Резервні моделі',
      admin: {
        description: 'Моделі для спроби якщо основна не працює (в порядку пріоритету)',
      },
      fields: [
        {
          name: 'model',
          type: 'text',
          label: 'ID моделі',
          required: true,
          admin: {
            description: 'Наприклад: dall-e-2, gpt-4o-mini, deepseek-chat',
          },
        },
      ],
    },
    {
      name: 'fallbackProviders',
      type: 'select',
      label: 'Резервні провайдери',
      hasMany: true,
      options: [
        { label: 'Anthropic', value: 'anthropic' },
        { label: 'OpenAI', value: 'openai' },
        { label: 'DeepSeek', value: 'deepseek' },
        { label: 'Google', value: 'google' },
        { label: 'Groq', value: 'groq' },
        { label: 'OpenRouter', value: 'openrouter' },
        { label: 'Replicate', value: 'replicate' },
        { label: 'Stability', value: 'stability' },
      ],
      admin: {
        description: 'Використовуються якщо основний провайдер недоступний',
      },
    },
    {
      name: 'maxRetries',
      type: 'number',
      label: 'Максимум повторів',
      defaultValue: 2,
      min: 0,
      max: 5,
    },
    {
      name: 'timeoutMs',
      type: 'number',
      label: 'Таймаут (мс)',
      defaultValue: 60000,
      min: 5000,
      max: 300000,
      admin: {
        description: 'Максимальний час очікування відповіді',
      },
    },
    {
      name: 'maxCost',
      type: 'number',
      label: 'Максимальна вартість ($)',
      defaultValue: 0.5,
      min: 0.01,
      max: 10,
      admin: {
        description: 'Максимальна вартість одного запиту',
      },
    },
  ],
};

export default TaskRouting;
