import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { loadConfig } from "@config";

export default {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock a text channel, allowing users to send messages again.")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("The channel to unlock (default: current channel)")
        .addChannelTypes(0)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction: ChatInputCommandInteraction) {
    const targetChannel = interaction.options.getChannel("channel") || interaction.channel;

    if (!targetChannel || targetChannel.type !== 0) {
      return interaction.reply({
        content: "Please specify a valid text channel.",
        flags: 64,
      });
    }

    if (
      !interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageChannels)
    ) {
      return interaction.reply({
        content: "I need the Manage Channels permission to do this.",
        flags: 64,
      });
    }

    try {
      const everyoneRole = interaction.guild.roles.everyone;

      await (targetChannel as TextChannel).permissionOverwrites.edit(everyoneRole, {
        SendMessages: null,
      });

      const embed = new EmbedBuilder()
        .setTitle("Channel Unlocked 🔓")
        .setDescription(
          `Channel ${targetChannel} has been unlocked. Users can send messages now.`
        )
        .setColor(loadConfig().color)
        .setFooter({
          text: `Action performed by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error unlocking channel:", error);
      return interaction.reply({
        content: "An error occurred while trying to unlock the channel.",
        flags: 64,
      });
    }
  },
};
