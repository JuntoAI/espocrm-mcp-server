import winston from 'winston';

/**
 * When running in schema-only mode (spawned as a child process for
 * tools/list), all logging MUST go to stderr, not stdout. The stdio
 * MCP transport uses stdout exclusively for JSON-RPC messages.
 */
const useStderr = process.env.SCHEMA_ONLY === 'true';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
    })
  ),
  defaultMeta: { service: 'espocrm-mcp-server' },
  transports: [
    new winston.transports.Console({
      stderrLevels: useStderr ? ['error', 'warn', 'info', 'debug'] : [],
      format: winston.format.combine(
        ...(useStderr ? [] : [winston.format.colorize()]),
        winston.format.simple()
      )
    })
  ],
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
  
  logger.add(new winston.transports.File({ 
    filename: 'logs/combined.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
}

export default logger;