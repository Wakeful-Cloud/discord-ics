/**
 * @fileoverview TypeScript types
 */

/**
 * Common event interface
 */
export interface Event
{
  name: string;
  description: string;
  location?: string;
  start: Date;
  end: Date;
}