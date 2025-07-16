import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  GuildMember,
  User,
} from "discord.js";
import { loadConfig } from "../../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("invites")
    .setDescription("Check how many users someone has invited to the server.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to check.")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser: User = interaction.options.getUser("user") || interaction.user;
    const guild = interaction.guild;

    if (!guild) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
    }

    const invites = await guild.invites.fetch().catch(() => null);

    if (!invites) {
      return interaction.reply({
        content: "I was unable to fetch invites. Do I have the required permissions?",
        ephemeral: true,
      });
    }

    const userInvites = invites.filter(invite => invite.inviter?.id === targetUser.id);
    const totalUses = userInvites.reduce((acc, invite) => acc + (invite.uses ?? 0), 0);

    const embed = new EmbedBuilder()
      .setTitle("Invite Stats")
      .setColor(loadConfig().color)
      .setThumbnail(targetUser.displayAvatarURL({ size: 128 }))
      .addFields(
        { name: "User", value: `${targetUser.tag}`, inline: true },
        { name: "Total Invites", value: `${totalUses}`, inline: true },
        { name: "Invite Links", value: userInvites.size > 0 ? userInvites.map(i => `[\`${i.code}\`](https://discord.gg/${i.code})`).join(", ") : "Keine aktiven Einladungen." }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
