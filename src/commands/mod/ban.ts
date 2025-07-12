import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { loadConfig } from "../../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to ban.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("The reason for the ban.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    if (!user) {
      return interaction.reply({
        content: "User not found.",
        ephemeral: true,
      });
    }

    const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: "That user is not a member of this server.",
        ephemeral: true,
      });
    }

    if (!member.bannable) {
      return interaction.reply({
        content: "I cannot ban this user. They may have a higher role or I lack permissions.",
        ephemeral: true,
      });
    }

    try {
      await member.ban({ reason });

      const embed = new EmbedBuilder()
        .setTitle("User Banned")
        .setColor(loadConfig().color)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Reason", value: reason, inline: true }
        )
        .setFooter({
          text: `Action performed by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error banning user:", error);
      return interaction.reply({
        content: "An error occurred while trying to ban the user.",
        ephemeral: true,
      });
    }
  },
};
