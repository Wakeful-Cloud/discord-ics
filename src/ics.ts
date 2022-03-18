/**
 * @fileoverview ICS utility
 */

//Imports
import IcalExpander from 'ical-expander';
import got from 'got';

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


/**
 * Fetch calendar events during a certain period from a remote ICS file
 * @param url ICS file URL
 * @param start Start date/time
 * @param end End date/time
 * @returns Calendar events
 */
export const fetchEvents = async (url: string, start: Date, end: Date) =>
{
  //Download the ICS file
  const res = await got(url);

  //Initialize the expander
  const expander = new IcalExpander({
    ics: res.body
  });

  //Expand the calendar
  const data = expander.between(start, end);

  //Resolve events
  const events = [
    //Filter and add events
    ...data.events
      .filter(event => start < event.startDate.toJSDate())
      .map(event => ({
        name: event.summary,
        description: event.description,
        location: event.location,
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate()
      } as Event)),

    //Filter and add occurrences
    ...data.occurrences
      .filter(occurrence => start < occurrence.startDate.toJSDate())
      .map(occurrence => ({
        name: occurrence.item.summary,
        description: occurrence.item.description,
        location: occurrence.item.location,
        start: occurrence.startDate.toJSDate(),
        end: occurrence.endDate.toJSDate()
      } as Event))
  ];

  return events;
};