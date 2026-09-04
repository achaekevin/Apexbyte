import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// List of known malicious scanners, scraping tools, and vulnerability probing agents
const BLOCKED_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /wpscan/i,
  /dirbuster/i,
  /gobuster/i,
  /masscan/i,
  /nmap/i,
  /zgrab/i,
  /havij/i,
  /acunetix/i,
  /netsparker/i,
  /burpsuite/i,
  /openvas/i,
  /blexbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /bytespider/i,
];

// Decoy honeypot field names commonly auto-filled by automated form-spammers
const HONEYPOT_FIELDS = [
  '_hp_token',
  'website_hp',
  'phone_confirm_hp',
  'fax_number',
  'hidden_verification_code',
];

/**
 * Middleware to detect and block malicious bots, automated scanners,
 * and form-spam honeypot triggers.
 */
export const botProtection = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';

  // 1. Inspect User-Agent for known malicious attack tools & scrapers
  for (const pattern of BLOCKED_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      logger.warn(`[BotProtection] Blocked suspicious User-Agent: "${userAgent}" from IP ${req.ip} on ${req.method} ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied: Request blocked by automated security protection.',
      });
    }
  }

  // 2. Reject missing User-Agent on state-mutating requests (POST, PUT, PATCH, DELETE)
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (isMutating && (!userAgent || userAgent.trim().length === 0)) {
    logger.warn(`[BotProtection] Blocked mutating request with missing User-Agent from IP ${req.ip} on ${req.method} ${req.originalUrl}`);
    return res.status(400).json({
      success: false,
      message: 'Bad Request: Missing required client identification header.',
    });
  }

  // 3. Honeypot check for form submissions and JSON bodies
  if (req.body && typeof req.body === 'object') {
    for (const field of HONEYPOT_FIELDS) {
      if (req.body[field] !== undefined && req.body[field] !== null && String(req.body[field]).trim() !== '') {
        logger.warn(`[BotProtection] Honeypot triggered on field "${field}" by IP ${req.ip} on ${req.method} ${req.originalUrl}`);
        return res.status(400).json({
          success: false,
          message: 'Automated submission detected. Request rejected.',
        });
      }
    }
  }

  // Set anti-bot / security response headers
  res.setHeader('X-Robots-Tag', 'noindex, nofollow'); // Prevents API scraping from search indexes
  res.setHeader('X-Content-Type-Options', 'nosniff');

  next();
};

export default botProtection;
