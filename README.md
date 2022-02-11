# Discord ICS
Discord bot to import an ICS file

## Documentation

### Environment Variables
Name | Description
--- | ---
`DISCORD_TOKEN` | Discord bot token
`DISCORD_SERVER` | Discord server ID
`ICS_URL` | Publicly accessible ICS file URL

### Use
1. Create an application in the [Discord Developer portal](https://discord.com/developers/applications)
2. Enable bot functionality
3. Go to `https://discord.com/api/oauth2/authorize?client_id=[Application ID]&permissions=8589934592&scope=bot` (Replace `[Application ID]` with the value in the portal)
4. Create a `.env` file or update your environment (See the [Environment Variables documentation](#environment-variables))
5. Install all modules with:
```bash
npm install
```
6. Run the bot:
```bash
npm run start
```