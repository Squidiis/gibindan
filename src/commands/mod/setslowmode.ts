import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { loadConfig } from "../../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set or remove slowmode for a text channel.")
    .addIntegerOption(option =>
      option
        .setName("duration")
        .setDescription("Slowmode duration in seconds (0–21600). Leave empty to remove slowmode.")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(false)
    )
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("Channel to set slowmode for (default: current channel)")
        .addChannelTypes(0) 
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction: ChatInputCommandInteraction) {
    const duration = interaction.options.getInteger("duration");
    const targetChannel = interaction.options.getChannel("channel") || interaction.channel;

    if (!targetChannel || targetChannel.type !== 0) {
      return interaction.reply({
        content: "Please specify a valid text channel.",
        flags: 64,
      });
    }

    if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "I need the Manage Channels permission to do this.",
        flags: 64,
      });
    }

    try {
      const newDuration = duration ?? 0;
      await (targetChannel as TextChannel).setRateLimitPerUser(newDuration);

      const embed = new EmbedBuilder()
        .setTitle(newDuration > 0 ? "Slowmode Set" : "Slowmode Removed")
        .setDescription(
          newDuration > 0
            ? `Slowmode for ${targetChannel} set to **${newDuration} seconds**.`
            : `Slowmode for ${targetChannel} has been removed.`
        )
        .setColor(loadConfig().color)
        .setFooter({
          text: `Action performed by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error setting/removing slowmode:", error);
      return interaction.reply({
        content: "An error occurred while updating slowmode.",
        flags: 64,
      });
    }
  },
};
