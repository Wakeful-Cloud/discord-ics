/**
 * @fileoverview ical-expander type augmentation
 * @license MIT
 * @see https://github.com/mifi/ical-expander/blob/master/README.md
 */

declare module 'ical-expander'
{
  //Imports
  import {Event, Time} from 'ical.js';

  /**
   * IcalExpander class constructor options
   */
  interface IcalExpanderConstructorOptions
  {
    /**
     * String containing ICS data to parse
     */
    ics?: string;

    /**
     * Max iterations on each RRULE.
     * 
     * `0` means never stop (**Be careful!**)
     * @default 1000 When `undefined` or `null`
     */
    maxIterations?: number;
  }

  /**
   * IcalExpander event data
   */
  interface IcalExpanderData
  {
    events: Event[];
    occurrences: {
      recurrenceId: Time;
      item: Event;
      startDate: Time;
      endDate: Time;
    }[];
  }

  /**
   * ICS / iCal / iCalendar parser / expander.
   * 
   * Wrapper around [ical.js](https://github.com/mozilla-comm/ical.js) that
   * automatically handles `EXDATE` (excluded recursive occurrences), `RRULE`
   * and recurring events overridden by `RECURRENCE-ID`.
   * 
   * Also handles timezones, and includes timezones from the [IANA Time Zone Database](https://www.iana.org/time-zones),
   * so that it parses correctly when a timezone definition is not available
   * in the ICS file itself. `zones.json` can be found [here](https://hg.mozilla.org/comm-central/file/tip/calendar/timezones/zones.json)
   * and compiled by running `compile-zones.js`.
   * 
   * Be careful as the processing done in this library is synchronous and will
   * block the JS event loop while processing. Especially when processing large
   * ICS files and with high maxIterations values.
   */
  class IcalExpander
  {
    /**
     * @param options Constructor options
     */
    constructor(options?: IcalExpanderConstructorOptions)

    /**
     * Include all events occurring between `after` and `before`.
     * 
     * i.e. with a start time before `before` JS Date and an end time `after` JS Date.
     * @param after Start of range. Default: No start limit.
     * @param before End of range. Default: No end limit. **Do not run with no end limit and maxIterations: `0`**
     */
    public between(after?: Date, before?: Date): IcalExpanderData

    /**
     * `icalExpander.before(before)` is an alias for `icalExpander.between(undefined, before)`
     * @param before End of range. Default: No end limit. **Do not run with no end limit and maxIterations: `0`**
     */
    public before(before?: Date): IcalExpanderData

    /**
     * `icalExpander.after()` is an alias for `icalExpander.between(after)`
     * @param after Start of range. Default: No start limit.
     */
    public after(after?: Date): IcalExpanderData

    /**
     * `icalExpander.all()` is an alias for `icalExpander.between()`
     * 
     * **Do not run this with maxIterations: `0`**
     */
    public all(): IcalExpander
  }

  //Export
  export default IcalExpander;
}