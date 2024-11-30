import { GatewayIntentBits } from "discord.js";

/**
 * Array of Gateway Intents used for client configuration.
 * Enables specific events and data to be received by the bot.
 * @see {@link https://discordjs.dev/docs/packages/discord.js/main/GatewayIntentBits:enum}
 */
export const gatewayIntentBits = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
] as const;
