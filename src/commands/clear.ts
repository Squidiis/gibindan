import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
  TextChannel,
  Interaction,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import { loadConfig } from "../../config";

const config = loadConfig();
const ENABLE_ERROR_LOG = process.env.ENABLE_ERROR_LOG === "true";

export default {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete messages with custom amount and channel"),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId("clear_modal")
        .setTitle("Clear Messages");

      const amountInput = new TextInputBuilder()
        .setCustomId("clear_amount")
        .setLabel("How many messages to delete?")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Enter a number between 1 and 100")
        .setRequired(true);

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(amountInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
    } catch (error) {
      if (ENABLE_ERROR_LOG) console.error("Error showing modal:", error);
    }
  },

  async handleInteraction(interaction: Interaction) {
    try {
      if (interaction.isModalSubmit() && interaction.customId === "clear_modal") {
        const amountRaw = interaction.fields.getTextInputValue("clear_amount");
        const amount = parseInt(amountRaw);

        if (isNaN(amount) || amount < 1 || amount > 100) {
          const embed = new EmbedBuilder()
            .setColor(config.color)
            .setDescription("Please enter a valid number between 1 and 100.");

          await interaction.reply({ embeds: [embed], ephemeral: true });
          return;
        }

        const selectMenu = new ChannelSelectMenuBuilder()
          .setCustomId(`clear_channel_select_${amount}`)
          .setPlaceholder("Select a text channel")
          .setChannelTypes(ChannelType.GuildText)
          .setMinValues(1)
          .setMaxValues(1);

        const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(selectMenu);

        const embed = new EmbedBuilder()
          .setColor(config.color)
          .setDescription("Select the channel to delete messages from:");

        await interaction.reply({
          embeds: [embed],
          components: [row],
          ephemeral: true,
        });

        return;
      }

      if (interaction.isChannelSelectMenu() && interaction.customId.startsWith("clear_channel_select_")) {
        const amount = parseInt(interaction.customId.split("_").pop()!);
        const channelId = interaction.values[0];
        const channel = interaction.guild?.channels.cache.get(channelId) as TextChannel;

        if (!channel || channel.type !== ChannelType.GuildText) {
          const embed = new EmbedBuilder()
            .setColor(config.color)
            .setDescription("Invalid channel selected.");

          await interaction.reply({ embeds: [embed], ephemeral: true });
          return;
        }

        try {
          const messages = await channel.messages.fetch({ limit: amount });
          const deleted = await channel.bulkDelete(messages, true);

          const embed = new EmbedBuilder()
            .setColor(config.color)
            .setDescription(`Deleted ${deleted.size} messages from <#${channel.id}>.`);

          await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
          if (ENABLE_ERROR_LOG) console.error("Error deleting messages:", error);

          const embed = new EmbedBuilder()
            .setColor(config.color)
            .setDescription("Failed to delete messages. Messages older than 14 days cannot be deleted.");

          await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        return;
      }
    } catch (error) {
      if (ENABLE_ERROR_LOG) console.error("Unexpected error in handleInteraction:", error);

      if (interaction.isRepliable()) {
        const embed = new EmbedBuilder()
          .setColor(config.color)
          .setDescription("An unexpected error occurred while handling the interaction.");

        await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
      }
    }
  },
};
