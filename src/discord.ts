/**
 * @fileoverview Discord utility
 */

//Imports
import translate from '@wakeful-cloud/html-translator';
import {Client, Guild, Intents} from 'discord.js';
import {Event} from './ics';
import {Presets, SingleBar} from 'cli-progress';

/**
 * Initialize the Discord client
 * @param token Bot token
 * @returns Discord client
 */
export const initializeClient = async (token: string) =>
{
  //Instantiate the client
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILD_SCHEDULED_EVENTS
    ]
  });

  //Authenticate the client
  await client.login(token);

  //Wait for the client to be ready
  await new Promise(resolve => client.once('ready', resolve));

  return client;
};

/**
 * Create Discord events
 * @param server Discord server
 * @param events Calendar events
 */
export const createEvents = async (server: Guild, events: Event[]) =>
{
  //Show the progress bar
  const bar = new SingleBar({
    format: 'Events Created [{bar}] {percentage}% ({value}/{total})'
  }, Presets.rect);
  bar.start(events.length, 0);

  for (const event of events)
  {
    //Translate the description
    let {markdown: description} = translate(event.description, true);
    if (description.length > 1000)
    {
      description = `${description.substring(0, 997)}...`;
    }

    //Create the Discord event
    await server.scheduledEvents.create({
      entityType: 'EXTERNAL',
      name: event.name,
      description,
      scheduledStartTime: event.start,
      scheduledEndTime: event.end,
      privacyLevel: 'GUILD_ONLY',
      entityMetadata: {
        location: event.location != '' ? event.location : 'Unknown'
      }
    });

    //Update the progress bar
    bar.increment();
  }

  //Hide the progress bar
  bar.stop();
};