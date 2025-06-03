// commands/查詢歷史戰績_uid.js
const { SlashCommandBuilder } = require('discord.js');
const { fetchStatsByUID } = require('../utils/aovStats');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢歷史戰績_uid')
    .setDescription('輸入 UID 查詢《傳說對決》的歷史戰績')
    .addStringOption(option =>
      option.setName('uid')
        .setDescription('玩家的 UID')
        .setRequired(true)
    ),

  async execute(interaction) {
    const uid = interaction.options.getString('uid');

    await interaction.deferReply();

    const result = await fetchStatsByUID(uid);
    if (!result.success) {
      return interaction.editReply(result.message);
    }

    const summary = result.matches.map((m, i) => 
      `**第 ${i + 1} 場**｜${m.date}\n英雄：${m.hero}｜KDA：${m.kda}｜結果：${m.result}`
    ).join('\n\n');

    await interaction.editReply(`📊 玩家 UID：\`${uid}\`\n近期戰績：\n\n${summary}`);
  }
};
