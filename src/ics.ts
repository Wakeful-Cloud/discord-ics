/**
 * @fileoverview ICS utility
 */

//Imports
import {DateTime} from 'luxon';
import {Event} from './types';
import {async as ical, CalendarComponent, VEvent} from 'node-ical';

/**
 * Filter a calendar component
 * @param component Calendar component
 * @param start Valid window start
 * @param end Valid window end
 * @returns Calendar events occurring durning the window
 */
const componentFilter = (component: CalendarComponent, start: Date, end: Date) =>
  component.type == 'VEVENT' &&
  (component.start as Date) < end && (
    (component.rrule != null && component.rrule.options.until != null && start < component.rrule.options.until) ||
    (start < (component.end as Date))
  );

/**
 * Fetch calendar events during a certain period from a remote ICS file
 * @param url ICS file URL
 * @param start Start date/time
 * @param end End date/time
 * @returns Calendar events
 */
export const fetchEvents = async (url: string, start: Date, end: Date) =>
{
  //Download and parse the ICS file
  const res = await ical.fromURL(url);

  //Filter events
  const filteredEvents = Object.values(res).filter(component => componentFilter(component, start, end)) as VEvent[];

  //Resolve events
  const resolvedEvents: Event[] = [];
  for (const event of filteredEvents)
  {
    //Non-recurring event
    if (event.rrule == null)
    {
      //Append
      resolvedEvents.push({
        name: event.summary,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end
      });
    }
    //Recurring event
    else
    {
      //Convert dates to Luxon DateTimes
      const eventStart = DateTime.fromJSDate(event.start);
      const eventEnd = DateTime.fromJSDate(event.end);

      //Compute recurrence duration
      const duration = eventEnd.diff(eventStart);

      //Cast exceptions and overrides
      const exceptions = event.exdate as Record<string, Date> | undefined;
      const overrides = (event as any)?.recurrences as Record<string, VEvent> | undefined;

      //Get recurrences
      const recurrences = event.rrule.between(start, end);

      //Resolve recurrences
      for (let rawRecurrenceStart of recurrences)
      {
        //Generate date lookup key
        const key = DateTime.fromJSDate(rawRecurrenceStart).toISODate();

        //Skip exceptions
        if (exceptions != null && exceptions[key] != null)
        {
          continue;
        }

        //Get recurrence event
        let recurrenceEvent = event;
        if (overrides != null && overrides[key] != null)
        {
          recurrenceEvent = overrides[key]!;
          rawRecurrenceStart = recurrenceEvent.start;
        }

        //Compute the recurrence start
        let recurrenceStart = DateTime.fromJSDate(rawRecurrenceStart);
        recurrenceStart = recurrenceStart.plus({
          minutes: eventStart.offset - recurrenceStart.offset
        });

        //Append
        resolvedEvents.push({
          name: recurrenceEvent.summary,
          description: recurrenceEvent.description,
          location: recurrenceEvent.location,
          start: recurrenceStart.toJSDate(),
          end: recurrenceStart.plus(duration).toJSDate()
        });
      }
    }
  }

  return resolvedEvents;
};