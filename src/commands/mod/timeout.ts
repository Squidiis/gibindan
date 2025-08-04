import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    time,
} from "discord.js";
import { loadConfig } from "@config";

export default {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Temporarily mute a user.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to timeout.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("duration")
                .setDescription("Timeout duration in minutes (1–43200).")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for timeout.")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // Rights for timeout usage

    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user");
        const duration = interaction.options.getInteger("duration");
        const reason = interaction.options.getString("reason") || "No reason provided";

        if (!user || !duration || duration < 1 || duration > 43200) {
            return interaction.reply({
                content: "Invalid user or duration. Duration must be between 1 and 43200 minutes (30 days).",
                ephemeral: true,
            });
        }

        const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({
                content: "User is not on this server.",
                ephemeral: true,
            });
        }

        if (!member.moderatable) {
            return interaction.reply({
                content: "I can't timeout this user. They may have a higher role or I lack permissions.",
                ephemeral: true,
            });
        }

        try {
            const durationMs = duration * 60 * 1000; // Convert to milliseconds
            const timeoutUntil = new Date(Date.now() + durationMs); // End time
            await member.timeout(durationMs, reason);

            const embed = new EmbedBuilder()
                .setTitle("User Timed Out")
                .setColor(loadConfig().color)
                .addFields(
                    { name: "User", value: `${user.tag} (${user.id})`, inline: true },
                    { name: "Duration", value: `${duration} minutes`, inline: true },
                    { name: "Until", value: time(timeoutUntil, 'R'), inline: true },
                    { name: "Reason", value: reason, inline: false }
                )
                .setFooter({
                    text: `Timed out by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Timeout error:", error);
            return interaction.reply({
                content: "Failed to timeout the user.",
                ephemeral: true,
            });
        }
    },
};