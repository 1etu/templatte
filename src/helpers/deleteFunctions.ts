import { 
    ChannelType, 
    Guild, 
    GuildChannel, 
    Role, 
    BaseGuildTextChannel 
} from "discord.js";

/**
 * Generic delete function that handles bulk deletions with error handling
 * @param items Array of items to delete
 * @param itemName Name of the type being deleted (for logging)
 * @returns Promise<void>
 */
async function bulkDelete<T extends GuildChannel | Role>(
    items: T[],
    itemName: string
): Promise<void> {
    for (const item of items) {
        try {
            await item.delete();
            console.log(`Deleted ${itemName}: ${item.name}`);
        } catch (error) {
            console.error(`Failed to delete ${itemName}: ${item.name}`, error);
        }
    }
}

/**
 * Deletes all text channels in a guild
 * @param guild Discord Guild object
 * @returns Promise<void>
 */
async function deleteTextChannels(guild: Guild): Promise<void> {
    const textChannels = [...guild.channels.cache.values()]
        .filter(channel => channel.type === ChannelType.GuildText);
    await bulkDelete(textChannels, 'text channel');
}

/**
 * Deletes all voice channels in a guild
 * @param guild Discord Guild object
 * @returns Promise<void>
 */
async function deleteVoiceChannels(guild: Guild): Promise<void> {
    const voiceChannels = [...guild.channels.cache.values()]
        .filter(channel => channel.type === ChannelType.GuildVoice);
    await bulkDelete(voiceChannels, 'voice channel');
}

async function deleteAllChannels(guild: Guild): Promise<void> {
  const channels: BaseGuildTextChannel[] = [...guild.channels.cache.values()]
      .filter(channel => channel.type !== ChannelType.GuildCategory) as BaseGuildTextChannel[];
  await bulkDelete(channels, 'channel');
}

/**
 * Deletes all roles in a guild
 * @param guild Discord Guild object
 * @returns Promise<void>
 */
async function deleteAllRoles(guild: Guild): Promise<void> {
    const roles = [...guild.roles.cache.values()];
    await bulkDelete(roles, 'role');
}

/**
 * Deletes all category channels in a guild
 * @param guild Discord Guild object
 * @returns Promise<void>
 */
async function deleteCategories(guild: Guild): Promise<void> {
    const categories = [...guild.channels.cache.values()]
        .filter(channel => channel.type === ChannelType.GuildCategory);
    await bulkDelete(categories, 'category');
}

export { deleteAllRoles, deleteCategories, deleteAllChannels };