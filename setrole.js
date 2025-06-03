const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../models/guildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setrole')
    .setDescription('設定新成員加入時自動賦予的身分組')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('要自動分配的身分組')
        .setRequired(true)),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ 你沒有權限執行這個指令。', ephemeral: true });
    }

    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { autoRoleId: role.id },
      { upsert: true }
    );

    await interaction.reply(`✅ 已設定新成員自動分配身分組為：${role.name}`);
  }
};
