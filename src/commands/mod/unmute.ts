import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { loadConfig } from "../../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmute a user in the server.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to unmute.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");

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
        content: "I can't unmute this user. They may have a higher role or I lack permissions.",
        flags: 64,
      });
    }

    try {
      await member.timeout(null);

      const embed = new EmbedBuilder()
        .setTitle("User Unmuted")
        .setColor(loadConfig().color)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true }
        )
        .setFooter({
          text: `Action performed by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error unmuting user:", error);
      return interaction.reply({
        content: "An error occurred while trying to unmute the user.",
        flags: 64,
      });
    }
  },
};
