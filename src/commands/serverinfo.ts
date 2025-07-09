import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, Guild } from "discord.js";

function formatDate(timestamp: number) {
  return `<t:${Math.floor(timestamp / 1000)}:D> (<t:${Math.floor(timestamp / 1000)}:R>)`;
}

function countChannelTypes(guild: Guild) {
  const textChannels = guild.channels.cache.filter(c => c.type === 0).size; 
  const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
  const newsChannels = guild.channels.cache.filter(c => c.type === 5).size; 
  const categories = guild.channels.cache.filter(c => c.type === 4).size;
  return { textChannels, voiceChannels, newsChannels, categories };
}

export default {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Detailed info about the server"),

  async execute(interaction: ChatInputCommandInteraction) {
    const { guild, guildId } = interaction;
    if (!guild) {
      await interaction.reply({ content: "❌ This command can only be used in a server.", ephemeral: true });
      return;
    }

    const iconURL = guild.iconURL({ size: 512 }); 
    const owner = await guild.fetchOwner();
    const members = guild.members.cache;
    const humans = members.filter(m => !m.user.bot).size;
    const bots = members.filter(m => m.user.bot).size;
    const rolesCount = guild.roles.cache.size;
    const channelsCount = guild.channels.cache.size;
    const { textChannels, voiceChannels, newsChannels, categories } = countChannelTypes(guild);

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("Server Information")
      .setThumbnail(iconURL)
      .addFields(
        { name: "🆔 Server ID", value: guildId!, inline: true },
        { name: "👑 Owner", value: `<@${owner.id}>`, inline: true },
        { name: "🌍 Region", value: guild.preferredLocale.toUpperCase(), inline: true },

        { name: "👥 Members", value: `**${guild.memberCount} Members**\n🙂 Humans: ${humans}\n🤖 Bots: ${bots}`, inline: true },
        { name: "👤 Role Count", value: `${rolesCount}`, inline: true },

        { name: "📚 Channels", value: `**${channelsCount} Channels**\n#️⃣ Text: ${textChannels}\n🔊 Voice: ${voiceChannels}\n📰 News: ${newsChannels}\n📂 Categories: ${categories}`, inline: true },

        { name: "⏰ Server Created", value: formatDate(guild.createdTimestamp), inline: false }
      )
      .setFooter({ text: "Powered by your cool bot" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
