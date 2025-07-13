import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { loadConfig } from "../../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a user in the server.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to mute.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("The reason for muting.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    if (!user) {
      return interaction.reply({
        content: "User not found.",
        flags: 64,
      });
    }

    const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: "That user is not a member of this server.",
        flags: 64,
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: "I can't mute this user. They may have a higher role or I lack permissions.",
        flags: 64,
      });
    }

    try {
      await member.timeout(10 * 60 * 1000, reason);
      
      const embed = new EmbedBuilder()
        .setTitle("User Muted")
        .setColor(loadConfig().color)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Reason", value: reason, inline: true },
          { name: "Duration", value: "10 minutes", inline: true }
        )
        .setFooter({
          text: `Action performed by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error muting user:", error);
      return interaction.reply({
        content: "An error occurred while trying to mute the user.",
        flags: 64,
      });
    }
  },
};
