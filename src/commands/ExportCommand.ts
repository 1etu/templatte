import { 
    ChatInputCommandInteraction, 
    SlashCommandBuilder 
} from 'discord.js';

import { BaseCommand } from '../structures/BaseCommand';

/**
 * Command to export a Discord server's configuration as a JSON template.
 * This includes roles, categories, channels, and their respective permissions.
 * @extends {BaseCommand}
 */
export default class ExportCommand extends BaseCommand {
    /**
     * Slash command builder configuration
     * @public
     */
    public data = new SlashCommandBuilder()
        .setName('export')
        .setDescription('Export the server template as a JSON file');

    /**
     * Executes the export command
     * @param {ChatInputCommandInteraction} interaction - The interaction object representing the command execution
     * @returns {Promise<void>} A promise that resolves when the command execution is complete
     * @throws {Error} When there's an issue accessing guild data or creating the export
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();

        if (!interaction.memberPermissions?.has('Administrator')) {
            await interaction.editReply({ content: 'You need Administrator permission to use this command!' });
            return;
        }

        try {
            const guild = interaction.guild;
            if (!guild) {
                await interaction.editReply({ content: 'This command can only be used in a server!' });
                return;
            }

            const roles = await guild.roles.fetch();
            const rolesData = roles.map(role => ({
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                position: role.position,
                permissions: role.permissions.toJSON(),
                mentionable: role.mentionable
            }));

            const channels = await guild.channels.fetch();
            
            const categories = channels
                .filter(channel => channel?.type === 4)
                .map(category => ({
                    id: category?.id,
                    name: category?.name,
                    position: category?.position,
                    permissionOverwrites: [...category!.permissionOverwrites.cache.values()].map(perm => ({
                        id: perm.id,
                        type: perm.type,
                        allow: perm.allow.toJSON(),
                        deny: perm.deny.toJSON()
                    })),
                    channels: channels
                        .filter(ch => ch?.parentId === category?.id)
                        .map(channel => ({
                            name: channel?.name,
                            type: channel?.type,
                            position: channel?.position,
                            permissionOverwrites: [...channel!.permissionOverwrites.cache.values()].map(perm => ({
                                id: perm.id,
                                type: perm.type,
                                allow: perm.allow.toJSON(),
                                deny: perm.deny.toJSON()
                            }))
                        }))
                }));

            const uncategorizedChannels = channels
                .filter(channel => !channel?.parentId && channel?.type !== 4)
                .map(channel => ({
                    name: channel?.name,
                    type: channel?.type,
                    position: channel?.position,
                    permissionOverwrites: [...channel!.permissionOverwrites.cache.values()].map(perm => ({
                        id: perm.id,
                        type: perm.type,
                        allow: perm.allow.toJSON(),
                        deny: perm.deny.toJSON()
                    }))
                }));

            /**
             * Template object containing the server configuration
             * @type {{
             *   name: string,
             *   roles: Array<{
             *     name: string,
             *     color: number,
             *     hoist: boolean,
             *     position: number,
             *     permissions: string[],
             *     mentionable: boolean
             *   }>,
             *   categories: Array<{
             *     id: string,
             *     name: string,
             *     position: number,
             *     permissionOverwrites: Array<{
             *       id: string,
             *       type: number,
             *       allow: string[],
             *       deny: string[]
             *     }>,
             *     channels: Array<{
             *       name: string,
             *       type: number,
             *       position: number,
             *       permissionOverwrites: Array<{
             *         id: string,
             *         type: number,
             *         allow: string[],
             *         deny: string[]
             *       }>
             *     }>
             *   }>,
             *   uncategorizedChannels: Array<{
             *     name: string,
             *     type: number,
             *     position: number,
             *     permissionOverwrites: Array<{
             *       id: string,
             *       type: number,
             *       allow: string[],
             *       deny: string[]
             *     }>
             *   }>,
             *   exportedAt: string
             * }}
             */
            const template = {
                name: guild.name,
                roles: rolesData,
                categories: categories,
                uncategorizedChannels: uncategorizedChannels,
                exportedAt: new Date().toISOString()
            };

            const jsonData = JSON.stringify(template, null, 2);
            const buffer = Buffer.from(jsonData, 'utf-8');

            await interaction.editReply({
                content: 'Server template exported successfully!',
                files: [{
                    attachment: buffer,
                    name: `${guild.name}-template.json`
                }]
            });
        } catch (error) {
            console.error('Error exporting server template:', error);
            await interaction.editReply({
                content: 'An error occurred while exporting the server template. Please try again later.'
            });
        }
    }
} 