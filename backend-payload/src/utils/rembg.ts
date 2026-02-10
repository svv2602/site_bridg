import path from 'path';

/**
 * Get the path to the rembg CLI binary.
 * Checks REMBG_PATH env var first, then falls back to local venv.
 */
export function getRembgPath(): string {
  if (process.env.REMBG_PATH) {
    return process.env.REMBG_PATH;
  }
  // Try venv first (local development), fallback to system-wide (Docker/server)
  const venvPath = path.resolve(process.cwd(), '.venv/bin/rembg');
  return venvPath;
}
