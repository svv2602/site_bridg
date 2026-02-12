/**
 * Notification Endpoints
 *
 * Provides count, mark-read, and mark-all-read for the NotificationBell component.
 *
 * Note: 'notifications' collection slug uses `as any` casts because payload-types.ts
 * hasn't been regenerated yet. These resolve after `npm run build` or `payload generate:types`.
 */
import type { Endpoint } from 'payload';

/**
 * GET /api/notifications/count
 * Returns unread notification count for the bell badge.
 */
export const notificationCountEndpoint: Endpoint = {
  path: '/notifications/count',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const result = await (req.payload as any).find({
        collection: 'notifications',
        where: { read: { equals: false } },
        limit: 0,
      });

      return Response.json({ count: result.totalDocs });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Response.json({ error: message }, { status: 500 });
    }
  },
};

/**
 * POST /api/notifications/mark-read
 * Mark a single notification as read.
 * Body: { id: string }
 */
export const notificationMarkReadEndpoint: Endpoint = {
  path: '/notifications/mark-read',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = await req.json?.() as { id?: string } | undefined;
      const id = body?.id;
      if (!id) {
        return Response.json({ error: 'Missing id' }, { status: 400 });
      }

      const userEmail = (req.user as { email?: string }).email || 'unknown';

      await (req.payload as any).update({
        collection: 'notifications',
        id,
        data: {
          read: true,
          readAt: new Date().toISOString(),
          readBy: userEmail,
        },
      });

      return Response.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Response.json({ error: message }, { status: 500 });
    }
  },
};

/**
 * POST /api/notifications/mark-all-read
 * Mark all unread notifications as read.
 */
export const notificationMarkAllReadEndpoint: Endpoint = {
  path: '/notifications/mark-all-read',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const userEmail = (req.user as { email?: string }).email || 'unknown';

      const unread = await (req.payload as any).find({
        collection: 'notifications',
        where: { read: { equals: false } },
        limit: 500,
      });

      const updates = unread.docs.map((doc: any) =>
        (req.payload as any).update({
          collection: 'notifications',
          id: String(doc.id),
          data: {
            read: true,
            readAt: new Date().toISOString(),
            readBy: userEmail,
          },
        })
      );

      await Promise.all(updates);

      return Response.json({ success: true, updated: unread.docs.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Response.json({ error: message }, { status: 500 });
    }
  },
};
