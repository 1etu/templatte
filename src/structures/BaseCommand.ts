import { 
    ChatInputCommandInteraction, 
    SlashCommandBuilder 
} from 'discord.js';

/**
 * Base class for all slash commands in the bot.
 * @abstract
 */
export abstract class BaseCommand {
    /**
     * The slash command builder containing command configuration.
     * @abstract
     * @public
     */
    public abstract data: SlashCommandBuilder;
    
    /**
     * Executes the command logic.
     * @abstract
     * @param {ChatInputCommandInteraction} interaction - The interaction that triggered this command
     * @returns {Promise<void>}
     */
    abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
} 