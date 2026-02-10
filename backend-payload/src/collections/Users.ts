/**
 * Users Collection
 *
 * Admin users with email/password auth and API key support.
 * Roles: admin (full access) and editor (content management).
 * API keys used by the content automation pipeline.
 *
 * Access: auth-required for all operations.
 * Security: Login rate limiting (5 attempts per IP per 15 minutes).
 */
import type { CollectionConfig } from 'payload';
import { createRateLimiter, extractIp } from '../lib/rate-limiter';
import { validatePasswordComplexity } from '../lib/password-validation';
import { APIError } from 'payload';

/**
 * Login rate limiter: 5 attempts per IP per 15 minutes.
 * Prevents brute-force attacks on admin credentials.
 */
const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
});

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Користувач',
    plural: 'Користувачі',
  },
  auth: {
    useAPIKey: true,  // Enable API key authentication for automation
  },
  admin: {
    useAsTitle: 'email',
    group: 'Налаштування',
    description: 'Адміністратори системи',
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Validate password complexity only when password is being set/changed
        if (data?.password) {
          const result = validatePasswordComplexity(data.password);
          if (!result.valid) {
            throw new APIError(result.errors.join('. '), 400);
          }
        }
        return data;
      },
    ],
    beforeLogin: [
      async ({ req }) => {
        // Rate limit login attempts by IP address
        const ip = extractIp(req as unknown as Request);
        const result = loginRateLimiter.check(ip);
        if (!result.allowed) {
          throw new APIError(
            'Забагато спроб. Спробуйте пізніше.',
            429,
          );
        }
      },
    ],
    afterLogin: [
      async ({ req }) => {
        // Reset rate limiter on successful login so legitimate users aren't penalized
        const ip = extractIp(req as unknown as Request);
        loginRateLimiter.reset(ip);
      },
    ],
  },
  access: {
    // Only admins can create, update, or delete users
    create: ({ req }) => {
      if (!req.user) return false;
      return (req.user as { role?: string }).role === 'admin';
    },
    update: ({ req }) => {
      if (!req.user) return false;
      const user = req.user as { id?: string; role?: string };
      // Admins can update anyone; users can update themselves
      if (user.role === 'admin') return true;
      return { id: { equals: user.id } };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      return (req.user as { role?: string }).role === 'admin';
    },
    // All authenticated users can read users list
    read: ({ req }) => {
      return !!req.user;
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
      required: true,
      access: {
        // Only admins can change roles
        update: ({ req }) => {
          return (req.user as { role?: string })?.role === 'admin';
        },
      },
    },
  ],
};
