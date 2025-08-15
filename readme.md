# 🛠️ Discord Utility Bot (TypeScript)

A small, modular Discord bot written in **TypeScript** – just for fun.

## ✨ Features

This bot comes with a set of useful moderation and server commands:

- `/userinfo` – Displays information about a user
- `/serverinfo` – Shows details about the server
- `/ban` – Bans a user
- `/kick` – Kicks a user
- `/clear` – Clears messages in a channel
- `/invites` – Displays how many invites a user has created
- `/lock` – Locks a channel (prevents sending messages)
- `/unlock` – Unlocks a channel
- `/timeout` – Times out a user
- `/untimeout` – Removes timeout from a user
- `/slowmode` – Sets slowmode in a channel
- `/ping` – Measures the bot’s latency
- `/role-add` – Assigns a role to a user
- `/role-remove` – Removes a role from a user

## 🧩 Modular Command System

One of the key features of this bot is its **modular structure**:

> You can freely add, remove, or swap command files in the `commands/` folder.  
> Each command is automatically loaded and registered without needing manual setup.

This makes it easy to customize the bot to your own needs – use only the commands you want.

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/yourbot.git
cd yourbot
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables Create a .env file in the root folder:
```env
TOKEN=your-discord-bot-token
CLIENT_ID=your-bot-client-id
GUILD_ID=optional-for-dev-command-registration
```