/**
 * @fileoverview Entry file
 */

//Imports
import 'dotenv/config';
import {createEvents, initializeClient} from './discord';
import {fetchEvents} from './ics';

const main = async () =>
{
  //Fetch events
  const events = await fetchEvents(process.env.ICS_URL as string);

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