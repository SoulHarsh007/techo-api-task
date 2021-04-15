import {appendFileSync} from 'fs';
import {inspect} from 'util';

/**
 * Custom logger utility, Prettifies, Logs and Stores the data
 * @public
 */
export class Logger {
  public logs: string[];

  constructor() {
    this.logs = [];
  }

  /**
   * Generates a log file
   * @public
   * @sealed
   */
  generateLogFile(): void {
    const date = new Date();
    appendFileSync(
      `${process.cwd()}/logs/${date
        .toLocaleDateString('en-us', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
        .replace(',', '')}.log`,
      `${this.logs.join('\n')}\n`,
      'utf8'
    );
  }

  /**
   * Prettifies, Logs and Stores provided info
   * @public
   * @sealed
   * @param data - log format param [date time `${result}`] [`${type}`] - `${data}`
   * @param type - log format param [date time `${result}`] [`${type}`] - `${data}`
   * @param result - log format param [date time `${result}`] [`${type}`] - `${data}`
   */
  log(data?: unknown, type?: unknown, result?: unknown): void {
    const date = new Date();
    if (typeof data !== 'string') data = inspect(data, true);
    this.logs.push(
      `[${date
        .toLocaleDateString('en-us', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
        .replace(',', '')} ${date.toLocaleTimeString('en-us', {
        hour12: false,
      })} ${result}] [${type}] - ${data}`
    );
    console.log(
      `[${date
        .toLocaleDateString('en-us', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
        .replace(',', '')} ${date.toLocaleTimeString('en-us', {
        hour12: false,
      })} ${result}] [${type}] - ${data}`
    );
  }

  /**
   * Clears logs stored into process's memory and optionally calls gc
   * @public
   * @sealed
   * @param callGC - Pass a truthy value to call gc
   */
  clearLogs(callGC: boolean): void {
    this.logs = [];
    callGC ? global.gc() : null;
  }
}
