import { 
    Client, 
    Collection 
} from 'discord.js';

import { BaseCommand } from '../structures/BaseCommand';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Logger } from '../utils/Logger';

/**
 * Handles the loading and management of Discord slash commands
 */
export class CommandHandler {
    private commands: Collection<string, BaseCommand>;
    private client: Client;

    /**
     * Creates a new CommandHandler instance
     * @param client - The Discord.js client instance
     */
    constructor(client: Client) {
        this.client = client;
        this.commands = new Collection();
    }

    /**
     * Loads all command files from the commands directory and registers them with Discord
     * @throws {Error} When command registration fails
     */
    async loadCommands() {
        const commandsPath = join(__dirname, '..', 'commands');
        const commandFiles = readdirSync(commandsPath).filter(file => 
            file.endsWith('.ts') || file.endsWith('.js')
        );

        for (const file of commandFiles) {
            const filePath = join(commandsPath, file);
            const command = require(filePath);
            const commandInstance: BaseCommand = new command.default();

            this.commands.set(commandInstance.data.name, commandInstance);
        }

        try {
            const commandsData = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());
            await this.client.application?.commands.set(commandsData);
            Logger.info('Successfully registered application commands.');
        } catch (error) {
            Logger.error('Error registering application commands:', error as Error);
        }
    }

    /**
     * Returns the collection of registered commands
     * @returns Collection of commands mapped by their names
     */
    getCommands(): Collection<string, BaseCommand> {
        return this.commands;
    }
} 