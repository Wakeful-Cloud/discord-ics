/**
 * @fileoverview ICS utility
 */

//Imports
import translate from '@wakeful-cloud/html-translator';
import {DateTime} from 'luxon';
import {Event} from './types';
import {async as ical, VEvent} from 'node-ical';

/**
 * Fetch future calendar events from a remote ICS file
 * @param url ICS file URL
 * @returns Future calendar events
 */
export const fetchEvents = async (url: string) =>
{
  //Download and parse the ICS file
  const res = await ical.fromURL(url);

  //Get current date/time
  const now = new Date(Date.now());

  //Filter events
  const futureEvents = Object.values(res).filter(event => event.type == 'VEVENT' && (event.start as Date) > now) as VEvent[];

  //Resolve events
  const resolvedEvents = futureEvents.flatMap(event =>
  {
    //Translate the description
    let {markdown: description} = translate(event.description, true);
    if (description.length > 1000)
    {
      description = `${description.substring(0, 997)}...`;
    }

    //Convert dates to Luxon DateTimes
    const start = DateTime.fromJSDate(event.start);
    const end = DateTime.fromJSDate(event.end);

    if (event.rrule == null)
    {
      return {
        name: event.summary,
        description,
        location: event.location,
        start: start.toJSDate(),
        end: end.toJSDate()
      } as Event;
    }
    else
    {
      //Compute recurrence duration
      const duration = end.diff(start);

      return event.rrule.all().map(raw =>
      {
        //Convert recurrence to Luxon DateTime and adjust for daylight savings time
        let recurrence = DateTime.fromJSDate(raw);
        recurrence = recurrence.plus({
          minutes: start.offset - recurrence.offset
        });

        return {
          name: event.summary,
          description,
          location: event.location,
          start: recurrence.toJSDate(),
          end: recurrence.plus(duration).toJSDate()
        } as Event;
      });
    }
  });

  return resolvedEvents;
};