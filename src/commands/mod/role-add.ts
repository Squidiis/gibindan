import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { loadConfig } from "@config";

export default {
  data: new SlashCommandBuilder()
    .setName("role-add")
    .setDescription("Assign a role to a user.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user who should receive the role.")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("role")
        .setDescription("The role to assign.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");
    const roleOption = interaction.options.getRole("role");

    if (!user || !roleOption) {
      return interaction.reply({
        content: "Could not find the user or the role.",
        ephemeral: true,
      });
    }

    const guild = interaction.guild;
    if (!guild) return;

    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        content: "That user is not a member of this server.",
        ephemeral: true,
      });
    }

    const role = await guild.roles.fetch(roleOption.id).catch(() => null);
    if (!role) {
      return interaction.reply({
        content: "Could not find that role in this server.",
        ephemeral: true,
      });
    }

    if (member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: "This user already has that role.",
        ephemeral: true,
      });
    }

    try {
      await member.roles.add(role);

      const embed = new EmbedBuilder()
        .setTitle("Role Assigned ✅")
        .setColor(loadConfig().color)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Role", value: `${role.name}`, inline: true }
        )
        .setFooter({
          text: `Action performed by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error assigning role:", error);
      return interaction.reply({
        content: "Something went wrong while trying to assign the role.",
        ephemeral: true,
      });
    }
  },
};
