import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
} from "discord.js";
import { loadConfig } from "@config";

export default {
    data: new SlashCommandBuilder()
        .setName("untimeout")
        .setDescription("Remove a user's timeout.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to remove the timeout from.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for removing timeout.")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

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

        if (!member.moderatable) {
            return interaction.reply({
                content: "I cannot remove timeout from this user.",
                ephemeral: true,
            });
        }

        try {
            await member.timeout(null, reason); // null = remove timeout

            const embed = new EmbedBuilder()
                .setTitle("Timeout Removed")
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
            console.error("Error removing timeout:", error);
            return interaction.reply({
                content: "An error occurred while removing the timeout.",
                ephemeral: true,
            });
        }
    },
};
