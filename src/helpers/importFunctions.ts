import { 
    Guild, 
    ChannelType, 
    PermissionsBitField,
} from 'discord.js';

/**
 * Represents a channel within a Discord server template
 * @interface TemplateChannel
 */
interface TemplateChannel {
    /** The name of the channel */
    name: string;
    /** The channel type (text, voice, etc.) as defined in Discord.js ChannelType */
    type: number;
    /** The position of the channel in the channel list */
    position: number;
    /** Array of permission overwrites for the channel */
    permissionOverwrites: {
        /** The ID of the role or user */
        id: string;
        /** The type of overwrite (0 for role, 1 for member) */
        type: number;
        /** Array of allowed permissions */
        allow: string[];
        /** Array of denied permissions */
        deny: string[];
    }[];
}

/**
 * Represents a category within a Discord server template
 * @interface TemplateCategory
 */
interface TemplateCategory {
    /** Unique identifier for the category */
    id: string;
    /** The name of the category */
    name: string;
    /** The position of the category in the channel list */
    position: number;
    /** Array of permission overwrites for the category */
    permissionOverwrites: {
        /** The ID of the role or user */
        id: string;
        /** The type of overwrite (0 for role, 1 for member) */
        type: number;
        /** Array of allowed permissions */
        allow: string[];
        /** Array of denied permissions */
        deny: string[];
    }[];
    /** Array of channels within this category */
    channels: TemplateChannel[];
}

/**
 * Represents a role within a Discord server template
 * @interface TemplateRole
 */
interface TemplateRole {
    /** The name of the role */
    name: string;
    /** The color of the role in integer format */
    color: number;
    /** Whether the role is hoisted (displayed separately) */
    hoist: boolean;
    /** The position of the role in the role hierarchy */
    position: number;
    /** The permissions bitfield for the role */
    permissions: string;
    /** Whether the role is mentionable */
    mentionable: boolean;
}

/**
 * Represents a complete Discord server template
 * @interface ServerTemplate
 */
interface ServerTemplate {
    /** The name of the server */
    name: string;
    /** Array of roles to be created */
    roles: TemplateRole[];
    /** Array of categories and their channels */
    categories: TemplateCategory[];
    /** Array of channels not belonging to any category */
    uncategorizedChannels: TemplateChannel[];
    /** Timestamp when the template was exported */
    exportedAt: string;
}

/**
 * Helper class for importing Discord server templates
 * @class ImportHelper
 */
export class ImportHelper {
    private guild: Guild;
    /** Maps role names to their new IDs */
    private roleMap: Map<string, string> = new Map();
    /** Maps category template IDs to their new IDs */
    private categoryMap: Map<string, string> = new Map();

    /**
     * Creates an instance of ImportHelper
     * @param {Guild} guild - The Discord guild to import the template into
     */
    constructor(guild: Guild) {
        this.guild = guild;
    }

    /**
     * Imports a server template into the guild
     * @param {ServerTemplate} template - The server template to import
     * @throws {Error} If the template format is invalid
     * @returns {Promise<void>}
     */
    async importTemplate(template: ServerTemplate): Promise<void> {
        if (!template || !template.roles || !template.categories) {
            throw new Error('Invalid template format');
        }

        await this.createRoles(template.roles);
        await this.createCategories(template.categories);
        await this.createCategoryChannels(template.categories);

        if (template.uncategorizedChannels) {
            await this.createUncategorizedChannels(template.uncategorizedChannels);
        }
    }

    /**
     * Creates roles from the template
     * @param {TemplateRole[]} roles - Array of roles to create
     * @returns {Promise<void>}
     * @private
     */
    private async createRoles(roles: TemplateRole[]): Promise<void> {
        const sortedRoles = [...roles].sort((a, b) => b.position - a.position);

        for (const roleData of sortedRoles) {
            try {
                if (roleData.name === '@everyone') continue;

                const role = await this.guild.roles.create({
                    name: roleData.name,
                    color: roleData.color,
                    hoist: roleData.hoist,
                    position: roleData.position,
                    permissions: roleData.permissions as any,
                    mentionable: roleData.mentionable
                });
                
                this.roleMap.set(roleData.name, role.id);
            } catch (error) {
                console.error(`Error creating role ${roleData.name}:`, error);
            }
        }
    }

    /**
     * Creates categories from the template
     * @param {TemplateCategory[]} categories - Array of categories to create
     * @returns {Promise<void>}
     * @private
     */
    private async createCategories(categories: TemplateCategory[]): Promise<void> {
        for (const categoryData of categories) {
            try {
                const category = await this.guild.channels.create({
                    name: categoryData.name,
                    type: ChannelType.GuildCategory,
                    position: categoryData.position,
                    permissionOverwrites: this.mapPermissionOverwrites(categoryData.permissionOverwrites)
                });

                this.categoryMap.set(categoryData.id, category.id);
            } catch (error) {
                console.error(`Error creating category ${categoryData.name}:`, error);
            }
        }
    }

    /**
     * Creates channels within categories from the template
     * @param {TemplateCategory[]} categories - Array of categories containing channels to create
     * @returns {Promise<void>}
     * @private
     */
    private async createCategoryChannels(categories: TemplateCategory[]): Promise<void> {
        for (const categoryData of categories) {
            const categoryId = this.categoryMap.get(categoryData.id);
            if (!categoryId) continue;

            for (const channelData of categoryData.channels) {
                try {
                    await this.guild.channels.create({
                        name: channelData.name,
                        type: channelData.type,
                        position: channelData.position,
                        parent: categoryId,
                        permissionOverwrites: this.mapPermissionOverwrites(channelData.permissionOverwrites)
                    });
                } catch (error) {
                    console.error(`Error creating channel ${channelData.name}:`, error);
                }
            }
        }
    }

    /**
     * Creates channels that don't belong to any category
     * @param {TemplateChannel[]} channels - Array of channels to create
     * @returns {Promise<void>}
     * @private
     */
    private async createUncategorizedChannels(channels: TemplateChannel[]): Promise<void> {
        for (const channelData of channels) {
            try {
                await this.guild.channels.create({
                    name: channelData.name,
                    type: channelData.type,
                    position: channelData.position,
                    permissionOverwrites: this.mapPermissionOverwrites(channelData.permissionOverwrites)
                });
            } catch (error) {
                console.error(`Error creating channel ${channelData.name}:`, error);
            }
        }
    }

    /**
     * Maps permission overwrites from the template to Discord.js format
     * @param {any[]} permissions - Array of permission overwrites to map
     * @returns {Object[]} Mapped permission overwrites
     * @private
     */
    private mapPermissionOverwrites(permissions: any[]) {
        return permissions.map(perm => ({
            id: this.roleMap.get(perm.id) || perm.id,
            type: perm.type,
            allow: new PermissionsBitField(perm.allow),
            deny: new PermissionsBitField(perm.deny)
        }));
    }
} 