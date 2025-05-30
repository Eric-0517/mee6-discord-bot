const { Client, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
});

// 載入環境變數
require('dotenv').config();

// 🔽 載入 config.json 設定
const configPath = path.join(__dirname, '../config.json');
function loadConfig(guildId) {
  if (!fs.existsSync(configPath)) return {};
  const config = JSON.parse(fs.readFileSync(configPath));
  return config[guildId] || {};
}

// 🔔 新成員加入
client.on(Events.GuildMemberAdd, async member => {
  const cfg = loadConfig(member.guild.id);
  const welcomeChannel = member.guild.channels.cache.get(cfg.welcomeChannelId);
  const defaultRole = member.guild.roles.cache.get(cfg.defaultRoleId);

  try {
    if (defaultRole) {
      await member.roles.add(defaultRole);
      console.log(`✅ 已為 ${member.user.tag} 指派預設身分組`);
    }
    if (welcomeChannel) {
      await welcomeChannel.send(`🎉 歡迎 <@${member.id}> 加入伺服器！`);
    }
  } catch (err) {
    console.error('🚨 成員加入處理錯誤:', err);
  }
});

// 👋 成員離開
client.on(Events.GuildMemberRemove, async member => {
  const cfg = loadConfig(member.guild.id);
  const leaveChannel = member.guild.channels.cache.get(cfg.leaveChannelId);

  try {
    if (leaveChannel) {
      await leaveChannel.send(`👋 ${member.user.tag} 離開了伺服器。`);
    }
  } catch (err) {
    console.error('🚨 成員離開處理錯誤:', err);
  }
});

// 🟢 Bot 上線
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot 已上線：${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
