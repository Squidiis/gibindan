import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  User,
  GuildMember,
} from "discord.js";
import { loadConfig } from "@config";

export default {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Shows information about a user.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to get info about")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member: GuildMember | null = interaction.guild
      ? await interaction.guild.members.fetch(user.id).catch(() => null)
      : null;

    const embed = new EmbedBuilder()
      .setTitle(`User Info: ${user.tag}`)
      .setThumbnail((user as User).displayAvatarURL({ forceStatic: false }) || "")
      .setColor(loadConfig().color)
      .addFields(
        { name: "User ID", value: user.id, inline: true },
        {
          name: "Created At",
          value: `<t:${Math.floor(user.createdTimestamp! / 1000)}:f> (<t:${Math.floor(
            user.createdTimestamp! / 1000
          )}:R>)`,
          inline: true,
        }
      )
      .setTimestamp();

    if (member) {
      embed.addFields(
        {
          name: "Joined Server At",
          value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:f> (<t:${Math.floor(
            member.joinedTimestamp! / 1000
          )}:R>)`,
          inline: true,
        },
        {
          name: "Roles",
          value:
            member.roles.cache
              .filter(role => role.id !== interaction.guild!.id)
              .map(role => role.toString())
              .join(", ") || "None",
          inline: false,
        },
        {
          name: "Highest Role",
          value: member.roles.highest.toString(),
          inline: true,
        },
        {
          name: "Is Bot",
          value: user.bot ? "Yes 🤖" : "No",
          inline: true,
        }
      );
    } else {
      embed.addFields({
        name: "Note",
        value: "User is not a member of this server.",
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
