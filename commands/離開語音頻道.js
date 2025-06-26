const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('離開語音頻道')
    .setDescription('讓機器人離開語音頻道'),
  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      return interaction.reply('❌ 我目前沒有在語音頻道中。');
    }

    connection.destroy();
    await interaction.reply('👋 已離開語音頻道。');
  },
};
