import { Client, Collection, GatewayIntentBits, REST, Routes, Interaction } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.TOKEN!;
const clientId = process.env.CLIENT_ID!;
const guildId = process.env.GUILD_ID!;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

interface Command {
  data: any;
  execute: (interaction: Interaction) => Promise<void>;
  handleInteraction?: (interaction: Interaction) => Promise<void>;
}

const commands = new Collection<string, Command>();
const commandsArray: any[] = [];

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

async function loadCommands() {
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command: Command = await import(filePath).then(m => m.default);
    if (!command?.data || !command?.execute) continue;
    commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON());
  }
}

(async () => {
  try {
    await loadCommands();

    client.once("ready", () => {
      console.log(`✅ Logged in as ${client.user?.tag}`);
    });

    client.on("interactionCreate", async (interaction: Interaction) => {
      if (interaction.isChatInputCommand()) {
        const command = commands.get(interaction.commandName);
        if (!command) return;

        try {
          await command.execute(interaction);
        } catch (error) {
          console.error("❌ Command error:", error);
          await interaction.reply({ content: "There was an error executing this command.", ephemeral: true });
        }
      }
      else if (
        interaction.isModalSubmit() ||
        interaction.isStringSelectMenu() ||
        interaction.isChannelSelectMenu()
      ) {
        for (const command of commands.values()) {
          if (typeof command.handleInteraction === "function") {
            try {
              await command.handleInteraction(interaction);
            } catch (error) {
              console.error("❌ Handler error:", error);
            }
          }
        }
      }
    });

    const rest = new REST({ version: "10" }).setToken(token);

    console.log("🔁 Refreshing slash commands...");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandsArray });
    console.log("✅ Slash commands loaded.");

    await client.login(token);
  } catch (error) {
    console.error("❌ Startup error:", error);
  }
})();
