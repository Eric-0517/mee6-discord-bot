require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 連接 MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ 成功連接 MongoDB'))
.catch((err) => console.error('❌ MongoDB 連線失敗:', err));

// 載入資料模型
const GuildConfig = require('./models/GuildConfig');

// 初始化 Discord Bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel]
});

// 載入指令處理
client.commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// 處理互動事件
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ 執行指令時發生錯誤！', ephemeral: true });
  }
});

// 新成員加入事件
client.on(Events.GuildMemberAdd, async (member) => {
  const config = await GuildConfig.findOne({ guildId: member.guild.id });
  if (!config) return;

  // 加身分組
  if (config.defaultRoleId) {
    try {
      await member.roles.add(config.defaultRoleId);
    } catch (err) {
      console.error(`❌ 加身分組錯誤: ${err}`);
    }
  }

  // 發送歡迎訊息
  if (config.welcomeChannelId) {
    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (channel) {
      channel.send(`🎉 歡迎 <@${member.id}> 加入伺服器！`);
    }
  }
});

// 成員離開事件
client.on(Events.GuildMemberRemove, async (member) => {
  const config = await GuildConfig.findOne({ guildId: member.guild.id });
  if (!config || !config.leaveChannelId) return;

  const channel = member.guild.channels.cache.get(config.leaveChannelId);
  if (channel) {
    channel.send(`👋 <@${member.id}> 已離開伺服器。`);
  }
});

// 上線
client.once(Events.ClientReady, () => {
  console.log(`✅ ${client.user.tag} 已上線！`);
});

client.login(process.env.DISCORD_TOKEN);
