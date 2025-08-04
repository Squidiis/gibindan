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
    .setName("lock")
    .setDescription("Lock a text channel, preventing users from sending messages.")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("The channel to lock (default: current channel)")
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
        SendMessages: false,
      });

      const embed = new EmbedBuilder()
        .setTitle("Channel Locked 🔒")
        .setDescription(
          `Channel ${targetChannel} has been locked. Users cannot send messages now.`
        )
        .setColor(loadConfig().color)
        .setFooter({
          text: `Action performed by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error locking channel:", error);
      return interaction.reply({
        content: "An error occurred while trying to lock the channel.",
        flags: 64,
      });
    }
  },
};
