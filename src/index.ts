/**
 * @fileoverview Entry file
 */

//Imports
import {DateTime} from 'luxon';
import {fetchEvents} from './ics';
import {createEvents, initializeClient} from './discord';
import 'dotenv/config';

const main = async () =>
{
  //Compute start and end
  const start = DateTime.now();
  const end = start.plus({
    seconds: parseInt(process.env.SYNCHRONIZATION_LIMIT || '604800', 10)
  });

  //Fetch events
  const events = await fetchEvents(process.env.ICS_URL as string, start.toJSDate(), end.toJSDate());

  //Initialize the client
  const client = await initializeClient(process.env.DISCORD_TOKEN as string);

  //Fetch the server
  const server = await client.guilds.fetch(process.env.DISCORD_SERVER as string);

  //Create the events
  await createEvents(server, events);

  //Destroy the client
  client.destroy();
};

main();