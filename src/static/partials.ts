import { Partials } from "discord.js";

/**
 * Array of Discord.js Partials used for client configuration.
 * Enables partial structures for messages and channels.
 * @see {@link https://discordjs.dev/docs/packages/discord.js/main/Partials:enum}
 */
export const partials = [
    Partials.Message,
    Partials.Channel,
] as const;
