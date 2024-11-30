import { 
    ChatInputCommandInteraction,
    SlashCommandBuilder, 
    PermissionFlagsBits 
} from 'discord.js';

import { BaseCommand } from '../structures/BaseCommand';
import { ImportHelper } from '../helpers/importFunctions';

/**
 * Command to import a server template from a JSON file.
 * This command allows administrators to completely rebuild a server's structure
 * based on a provided template file.
 * 
 * @extends BaseCommand
 */
export default class ImportCommand extends BaseCommand {
    /**
     * Slash command configuration for the import command.
     * Requires Administrator permissions to use.
     */
    public data = new SlashCommandBuilder()
        .setName('import')
        .setDescription('Import a server template from a JSON file')
        .addAttachmentOption(option => 
            option
                .setName('template')
                .setDescription('The template JSON file to import')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) as SlashCommandBuilder

    /**
     * Executes the import command.
     * This method performs the following steps:
     * 1. Validates the command can be executed in the current context
     * 2. Cleans up existing server channels and roles
     * 3. Imports the new template configuration
     * 
     * @param {ChatInputCommandInteraction} interaction - The interaction object representing the command execution
     * @throws {Error} When the template file is invalid or when lacking required permissions
     * @returns {Promise<void>} A promise that resolves when the import is complete
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();

        try {
            const guild = interaction.guild;
            if (!guild) {
                await interaction.editReply({ content: 'This command can only be used in a server!' });
                return;
            }

            if (!interaction.memberPermissions?.has('Administrator')) {
                await interaction.editReply({ content: 'You need Administrator permission to use this command!' });
                return;
            }

            const attachment = interaction.options.getAttachment('template');
            if (!attachment) {
                await interaction.editReply({ content: 'Please provide a template file!' });
                return;
            }

            await interaction.editReply({ content: 'Starting server cleanup...' });

            const channels = await guild.channels.fetch();
            const systemChannelId = guild.systemChannelId;
            
            for (const [_, channel] of channels) {
                if (channel && channel.id !== systemChannelId && channel.deletable) {
                    await channel.delete().catch(console.error);
                }
            }

            const roles = await guild.roles.fetch();
            const everyoneRole = guild.roles.everyone;
            const botRole = guild.members.me?.roles.highest;
            
            for (const [_, role] of roles) {
                if (role && 
                    role.id !== everyoneRole.id && 
                    role.id !== botRole?.id &&
                    role.position < (botRole?.position || 0) &&
                    role.editable) {
                    await role.delete().catch(console.error);
                }
            }

            const response = await fetch(attachment.url);
            const templateData = await response.json();
            
            await interaction.editReply({ 
                content: 'Server cleanup completed! Starting template import...' 
            });

            const importHelper = new ImportHelper(guild);
            await importHelper.importTemplate(templateData);

            await interaction.editReply({ 
                content: 'Server template has been successfully imported!' 
            });

        } catch (error) {
            console.error('Error during import process:', error);
            await interaction.editReply({
                content: 'An error occurred during the import process. Please make sure you uploaded a valid template file and the bot has the necessary permissions.'
            });
        }
    }
}
