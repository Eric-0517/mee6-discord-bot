const { SlashCommandBuilder } = require('discord.js');
const { fetchAovStatsByUID } = require('../utils/aovStats');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢歷史戰績')
    .setDescription('查詢傳說對決玩家的戰績')
    .addStringOption(option =>
      option.setName('uid')
        .setDescription('玩家的 UID')
        .setRequired(true)
    ),
  async execute(interaction) {
    const uid = interaction.options.getString('uid');
    await interaction.deferReply();

    try {
      const stats = await fetchAovStatsByUID(uid);

      await interaction.editReply({
        content: `🎮 玩家 **${stats.username}** 的戰績如下：
🏆 勝場：${stats.wins}
💀 敗場：${stats.losses}
📊 KDA：${stats.kda}
🎖️ 段位：${stats.rank}
🔥 MVP率：${stats.mvpRate}
⭐ 擅長英雄：${stats.favoriteHero}`,
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ 無法取得玩家戰績，請確認 UID 是否正確。');
    }
  },
};
