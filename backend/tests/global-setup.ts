import { execSync } from 'node:child_process';
import { unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export default function setup() {
  const dbPath = join(process.cwd(), 'prisma', 'test.db');
  if (existsSync(dbPath)) {
    try { unlinkSync(dbPath); } catch { /* ignore */ }
  }
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
}
