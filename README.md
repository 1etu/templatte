# Templatte
A Discord bot that allows you to import and export Discord server templates, making it easy to backup and replicate server configurations.

# Features
 - Export server configuration including:
 - Roles and permissions
 - Categories
 - Channels (text and voice)
 - Permission overwrites
 - Import server templates to quickly recreate server structures

# Installation
1. Clone the repository
```shell
git clone https://github.com/1etu/templatte
```

2. Install the dependecies
```shell
npm install
```

3. Create a .env file with following format:
```js
DISCORD_TOKEN=
CLIENT_ID=
```

4. Run the bot in watch mode:
```shell
npm run watch
```