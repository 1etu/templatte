import chalk from 'chalk';

/** Logger utility class for consistent console output formatting */
export class Logger {
    /**
     * Formats the current date as ISO string without milliseconds
     * @returns {string} Formatted date string in "YYYY-MM-DD HH:mm:ss" format
     * @private
     */
    private static formatDate(): string {
        return new Date().toISOString().replace('T', ' ').split('.')[0];
    }

    /**
     * Formats an error stack trace for cleaner output
     * @param {string} stack - The error stack trace to format
     * @returns {string} Indented and cleaned stack trace
     * @private
     */
    private static formatStack(stack: string): string {
        return stack
            .split('\n')
            .slice(1)
            .map(line => '  ' + line.trim())
            .join('\n');
    }

    /**
     * Logs an info message with timestamp and green indicator
     * @param {string} message - The message to log
     */
    static info(message: string): void {
        console.log(`${chalk.green('●')} ${chalk.white(`${this.formatDate()}: ${message}`)}`);
    }

    /**
     * Logs an error message with timestamp, red indicator, and optional stack trace
     * @param {string} message - The error message to log
     * @param {Error} [error] - Optional Error object to display stack trace
     */
    static error(message: string, error?: Error): void {
        console.error(`${chalk.red('●')} ${chalk.white(`${this.formatDate()}: ${message}`)}`);
        if (error?.stack) {
            console.error(chalk.white(this.formatStack(error.stack)));
        }
    }

    /**
     * Logs a debug message with timestamp and blue indicator
     * @param {string} message - The debug message to log
     */
    static debug(message: string): void {
        console.debug(`${chalk.blue('●')} ${chalk.white(`${this.formatDate()}: ${message}`)}`);
    }
} 