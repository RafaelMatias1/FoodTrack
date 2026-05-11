import { ZodSchema } from 'zod';

export class ValidationError extends Error {
  constructor(public issues: unknown) {
    super('Validation error');
  }
}

export const parseBody = <T>(schema: ZodSchema<T>, body: unknown): T => {
  const r = schema.safeParse(body);
  if (!r.success) throw new ValidationError(r.error.format());
  return r.data;
};
