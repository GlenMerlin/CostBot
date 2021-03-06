import { config } from 'dotenv';
config({ path: './.env' });

import { readdirSync } from 'fs';
import * as Discord from 'discord.js';
import { prefix } from './botconfig';

const intents = new Discord.Intents(['GUILDS', 'GUILD_BANS', 'GUILD_MESSAGES', 'GUILD_PRESENCES', 'DIRECT_MESSAGES']);
const client = new Discord.Client({
    ws: { intents: intents },
    presence: { activity: { name: 'Costpap shout', type: 'LISTENING' }, status: 'online' },
    messageCacheLifetime: 300,
    messageSweepInterval: 600,
});

(async () => {
    client.events = new Discord.Collection();
    /**
     * Date representing when events started being loaded.
     */
    const eventStarted: number = Date.now();
    /**
     * Array containing the names of the files ending with `.js` inside of the
     * `./build/events` directory. Used as part of dynamically loading events.
     */
    const eventFiles: string[] = readdirSync('./build/events').filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
        await import(`./events/${file}`).then(({ default: event }) => {
            const eventName: string = file.split('.')[0];

            client.on(eventName as string | symbol, (...args) => {
                try {
                    event(Discord, client, ...args);
                } catch (error) {
                    console.error(error);
                }
            });

            client.events.set(eventName, event);
        });
    }
    console.log(`Successfully loaded all ${client.events.size} events in ${Date.now() - eventStarted}ms!`);

    client.commands = new Discord.Collection();
    /**
     * Date representing when commands started being loaded.
     */
    const commandStarted: number = Date.now();
    /**
     * Array containing the names of the files ending with `.js` inside of the
     * `./build/commands` directory. Used as part of dynamically loading commands.
     */
    const commandFiles: string[] = readdirSync('./build/commands').filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        await import(`./commands/${file}`).then(({ default: command }) => client.commands.set(command.name, command));
    }
    console.log(`Successfully loaded all ${client.commands.size} commands in ${Date.now() - commandStarted}ms!`);
})();

client.cooldowns = new Discord.Collection();

if (!process.env.TOKEN) {
    console.error('Missing client token. Shutting down...');
    process.exit(1);
}
if (!prefix || prefix.length > 5) {
    console.error('Prefix is either missing or too long. Shutting down...');
    process.exit(1);
}

/* This catches when the process is about to exit
and destroys the discord.js client in order to allow for a graceful shutdown. */
process.on('exit', () => {
    console.log('Destroying discord.js Client...');
    client.destroy();
});

// This caches unhandled promise rejections.
process.on('unhandledRejection', (error) => console.error('Uncaught Promise Rejection', error));

client.login(process.env.TOKEN).catch((err) => console.error('Error logging into Discord', err));
