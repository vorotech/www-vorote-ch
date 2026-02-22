/**
 * Server-side Logger Utility
 *
 * Provides configurable logging with different severity levels.
 * Log level can be controlled via LOG_LEVEL environment variable.
 *
 * Levels (in order of severity):
 * - DEBUG: Detailed diagnostic information
 * - INFO: General informational messages
 * - WARN: Warning messages for potentially harmful situations
 * - ERROR: Error messages for error events
 *
 * Default level: WARN
 *
 * @example
 * ```ts
 * import { logger } from '@/lib/logger';
 *
 * logger.debug('Detailed debug info', { data });
 * logger.info('Informational message');
 * logger.warn('Warning message');
 * logger.error('Error occurred', error);
 * ```
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

class Logger {
  private level: LogLevel;

  constructor() {
    // Get log level from environment variable, default to WARN
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();

    switch (envLevel) {
      case 'DEBUG':
        this.level = LogLevel.DEBUG;
        break;
      case 'INFO':
        this.level = LogLevel.INFO;
        break;
      case 'WARN':
      case 'WARNING':
        this.level = LogLevel.WARN;
        break;
      case 'ERROR':
        this.level = LogLevel.ERROR;
        break;
      default:
        this.level = LogLevel.WARN;
    }
  }

  /**
   * Check if a log level should be logged based on current configuration
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  /**
   * Format log message with timestamp and level
   */
  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${levelName} ${contextStr} ${message}`;
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: unknown, context?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, context);
      if (data !== undefined) {
        console.log(formattedMessage, data);
      } else {
        console.log(formattedMessage);
      }
    }
  }

  /**
   * Log an info message
   */
  info(message: string, data?: unknown, context?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage(LogLevel.INFO, message, context);
      if (data !== undefined) {
        console.log(formattedMessage, data);
      } else {
        console.log(formattedMessage);
      }
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: unknown, context?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage(LogLevel.WARN, message, context);
      if (data !== undefined) {
        console.warn(formattedMessage, data);
      } else {
        console.warn(formattedMessage);
      }
    }
  }

  /**
   * Log an error message
   */
  error(message: string, error?: unknown, context?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage(LogLevel.ERROR, message, context);

      if (error !== undefined) {
        if (error instanceof Error) {
          console.error(formattedMessage, {
            errorMessage: error.message,
            stack: error.stack,
            name: error.name,
          });
        } else {
          console.error(formattedMessage, error);
        }
      } else {
        console.error(formattedMessage);
      }
    }
  }

  /**
   * Get current log level name
   */
  getCurrentLevel(): string {
    return LOG_LEVEL_NAMES[this.level];
  }
}

// Export singleton instance
export const logger = new Logger();
