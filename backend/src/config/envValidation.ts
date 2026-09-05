import logger from './logger';

interface RequiredEnv {
  name: string;
  requiredInProduction: boolean;
  isSecret?: boolean;
}

const REQUIRED_ENV_VARS: RequiredEnv[] = [
  { name: 'DATABASE_URL', requiredInProduction: true, isSecret: true },
  { name: 'JWT_SECRET', requiredInProduction: true, isSecret: true },
  { name: 'JWT_REFRESH_SECRET', requiredInProduction: true, isSecret: true },
  { name: 'PORT', requiredInProduction: false },
  { name: 'CLIENT_URL', requiredInProduction: false },
];

/**
 * Validates environment variables on startup to prevent insecure execution
 */
export const validateEnv = (): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    const val = process.env[envVar.name];

    if (!val) {
      if (isProduction && envVar.requiredInProduction) {
        missing.push(envVar.name);
      } else if (!isProduction && envVar.requiredInProduction) {
        warnings.push(`Missing recommended variable: ${envVar.name}`);
      }
    } else if (envVar.isSecret && isProduction) {
      // Check for weak default placeholder values in production
      const lower = val.toLowerCase();
      if (
        lower.includes('secret') ||
        lower.includes('change-this') ||
        lower.includes('password') ||
        lower.includes('12345') ||
        val.length < 16
      ) {
        missing.push(
          `${envVar.name} appears to be using a default/weak placeholder value. Must be at least 16 secure characters.`
        );
      }
    }
  }

  if (warnings.length > 0) {
    warnings.forEach((w) => logger.warn(`[Security Config Warning] ${w}`));
  }

  if (missing.length > 0) {
    const errorMsg = `CRITICAL SECURITY FAILURE: Missing or insecure environment variables:\n - ${missing.join(
      '\n - '
    )}`;
    logger.error(errorMsg);
    if (isProduction) {
      throw new Error(errorMsg);
    }
  } else {
    logger.info('🛡️ Environment security configuration validated successfully.');
  }
};

export default validateEnv;
