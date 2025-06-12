import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

interface AppConfigType {
  nodeEnv: string;
  backendPort: number;
  frontendPort: number;

  // OpenAI
  openaiApiKey: string;
  openaiBaseUrl: string;

  // Anthropic (Claude)
  anthropicApiKey: string;
  anthropicBaseUrl: string;

  // Google (Gemini)
  googleApiKey: string;
  googleGeminiBaseUrl: string;

  // Alibaba (Qwen)
  alibabaApiKey: string;
  alibabaBaseUrl: string;

  // Smart Router
  defaultProvider: string;
  fallbackProviders: string[];
  autoFallback: boolean;
  loadBalance: string | boolean;

  // Cost Control
  costLimitDaily: number;
  costLimitMonthly: number;
  costAlertThreshold: number;

  // Performance
  performanceThresholdMs: number;
  timeoutMs: number;
  maxRetries: number;

  // Cache
  redisUrl?: string;
  cacheTtlSeconds: number;

  // Security
  jwtSecret: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;

  // Logging
  logLevel: string;
  logFormat: string;

  // UI (Potentially for backend decisions if any, or just mirroring .env)
  uiTheme: string;
  uiAnimation: string;
  sidebarDefaultCollapsed: boolean;
}

function getEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function getEnvAsNumber(key: string, defaultValue?: number): number | undefined {
  const value = getEnv(key);
  if (value === undefined && defaultValue !== undefined) return defaultValue;
  if (value === undefined) return undefined;
  const num = parseFloat(value);
  if (isNaN(num)) throw new Error(`Environment variable ${key} is not a valid number.`);
  return num;
}

function getEnvAsBoolean(key: string, defaultValue?: boolean): boolean | undefined {
  const value = getEnv(key)?.toLowerCase();
  if (value === undefined && defaultValue !== undefined) return defaultValue;
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`Environment variable ${key} is not a valid boolean ('true' or 'false').`);
}

export const AppConfig: AppConfigType = {
  nodeEnv: getEnv('NODE_ENV', 'development')!,
  backendPort: getEnvAsNumber('BACKEND_PORT', 8000)!,
  frontendPort: getEnvAsNumber('FRONTEND_PORT', 3000)!,

  openaiApiKey: getEnvOrThrow('OPENAI_API_KEY'),
  openaiBaseUrl: getEnv('OPENAI_BASE_URL', 'https://api.openai.com/v1')!,

  anthropicApiKey: getEnvOrThrow('ANTHROPIC_API_KEY'),
  anthropicBaseUrl: getEnv('ANTHROPIC_BASE_URL', 'https://api.anthropic.com/v1')!,

  googleApiKey: getEnvOrThrow('GOOGLE_API_KEY'),
  googleGeminiBaseUrl: getEnv(
    'GOOGLE_GEMINI_BASE_URL',
    'https://generativelanguage.googleapis.com'
  )!,

  alibabaApiKey: getEnvOrThrow('ALIBABA_API_KEY'),
  alibabaBaseUrl: getEnv('ALIBABA_BASE_URL', 'https://dashscope.aliyuncs.com/api/v1')!,

  defaultProvider: getEnv('DEFAULT_PROVIDER', 'anthropic')!,
  fallbackProviders: getEnv('FALLBACK_PROVIDERS', 'openai,google,alibaba')!
    .split(',')
    .map((p) => p.trim()),
  autoFallback: getEnvAsBoolean('AUTO_FALLBACK', true)!,
  loadBalance: getEnv('LOAD_BALANCE', 'true')! === 'true' ? true : getEnv('LOAD_BALANCE', 'true')!,

  costLimitDaily: getEnvAsNumber('COST_LIMIT_DAILY', 50.0)!,
  costLimitMonthly: getEnvAsNumber('COST_LIMIT_MONTHLY', 1000.0)!,
  costAlertThreshold: getEnvAsNumber('COST_ALERT_THRESHOLD', 0.8)!,

  performanceThresholdMs: getEnvAsNumber('PERFORMANCE_THRESHOLD_MS', 5000)!,
  timeoutMs: getEnvAsNumber('TIMEOUT_MS', 30000)!,
  maxRetries: getEnvAsNumber('MAX_RETRIES', 3)!,

  redisUrl: getEnv('REDIS_URL'),
  cacheTtlSeconds: getEnvAsNumber('CACHE_TTL_SECONDS', 3600)!,

  jwtSecret: getEnv('JWT_SECRET', 'default_jwt_secret_please_change')!,
  rateLimitWindowMs: getEnvAsNumber('RATE_LIMIT_WINDOW_MS', 900000)!,
  rateLimitMaxRequests: getEnvAsNumber('RATE_LIMIT_MAX_REQUESTS', 100)!,

  logLevel: getEnv('LOG_LEVEL', 'info')!,
  logFormat: getEnv('LOG_FORMAT', 'combined')!,

  uiTheme: getEnv('UI_THEME', 'dark')!,
  uiAnimation: getEnv('UI_ANIMATION', 'enabled')!,
  sidebarDefaultCollapsed: getEnvAsBoolean('SIDEBAR_DEFAULT_COLLAPSED', false)!,
};
