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
  ChannelType
} from "discord.js";

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
        .setPlaceholder("e.g. 10")
        .setRequired(true);

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(amountInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
    } catch (err) {
    }
  },

  async handleInteraction(interaction: Interaction) {
    try {

      if (interaction.isModalSubmit() && interaction.customId === "clear_modal") {

        const amountRaw = interaction.fields.getTextInputValue("clear_amount");
        const amount = parseInt(amountRaw);

        if (isNaN(amount) || amount < 1 || amount > 100) {
          await interaction.reply({ content: "❌ Please enter a number between 1 and 100.", ephemeral: true });
          return;
        }

        const selectMenu = new ChannelSelectMenuBuilder()
          .setCustomId(`clear_channel_select_${amount}`)
          .setPlaceholder("Select a text channel")
          .setChannelTypes(ChannelType.GuildText)
          .setMinValues(1)
          .setMaxValues(1);

        const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(selectMenu);

        await interaction.reply({
          content: "Now select the channel to delete messages from:",
          components: [row],
          ephemeral: true
        });

        return;
      }

      if (interaction.isChannelSelectMenu() && interaction.customId.startsWith("clear_channel_select_")) {

        const amount = parseInt(interaction.customId.split("_").pop()!);
        const channelId = interaction.values[0];
        const channel = interaction.guild?.channels.cache.get(channelId) as TextChannel;

        if (!channel || channel.type !== ChannelType.GuildText) {
          await interaction.reply({ content: "❌ Invalid channel selected.", ephemeral: true });
          return;
        }

        try {
          const messages = await channel.messages.fetch({ limit: amount });
          const deleted = await channel.bulkDelete(messages, true);


          await interaction.reply({
            content: `✅ Deleted ${deleted.size} messages from <#${channel.id}>.`,
            ephemeral: true
          });
        } catch (error) {
          await interaction.reply({
            content: "❌ Failed to delete messages. Messages older than 14 days can't be deleted.",
            ephemeral: true
          });
        }

        return;
      }

    } catch (err) {
      if (interaction.isRepliable()) {
        await interaction.reply({
          content: "❌ An unexpected error occurred while handling the interaction.",
          ephemeral: true
        }).catch(() => {});
      }
    }
  }
};
