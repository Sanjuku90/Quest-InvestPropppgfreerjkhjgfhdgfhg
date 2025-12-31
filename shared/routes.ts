import { z } from 'zod';
import { insertUserSchema, users, dailyQuests, transactions } from './schema';
export type { InsertUser } from './schema';

export type LoginRequest = {
  email: string;
  password: string;
};

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  badRequest: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  invest: {
    deposit: {
      method: 'POST' as const,
      path: '/api/invest/deposit',
      input: z.object({ amount: z.number().min(20), depositAddress: z.string().optional() }),
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.badRequest,
      },
    },
  },
  quests: {
    list: {
      method: 'GET' as const,
      path: '/api/quests',
      responses: {
        200: z.array(z.custom<typeof dailyQuests.$inferSelect>()),
      },
    },
    complete: {
      method: 'POST' as const,
      path: '/api/quests/:id/complete',
      responses: {
        200: z.object({
          quest: z.custom<typeof dailyQuests.$inferSelect>(),
          user: z.custom<typeof users.$inferSelect>(),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
  game: {
    spin: {
      method: 'POST' as const,
      path: '/api/game/spin',
      responses: {
        200: z.object({
          won: z.boolean(),
          message: z.string(),
          user: z.custom<typeof users.$inferSelect>(),
        }),
        400: errorSchemas.badRequest,
      },
    },
  },
  wallet: {
    withdraw: {
      method: 'POST' as const,
      path: '/api/wallet/withdraw',
      input: z.object({ amount: z.number().min(50), walletAddress: z.string() }),
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.badRequest,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/wallet/history',
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
  },
  leaderboard: {
    list: {
      method: 'GET' as const,
      path: '/api/leaderboard',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          fullName: z.string().nullable(),
          level: z.string(),
          investmentBalance: z.number(),
          walletBalance: z.number(),
          referralEarnings: z.number(),
          totalEarnings: z.number(),
        })),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
