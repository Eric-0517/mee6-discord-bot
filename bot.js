require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

// 載入 Slash 指令
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// 載入事件（如：guildMemberAdd、messageCreate）
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// 登入成功後註冊 Slash 指令
client.once("ready", async () => {
  const guilds = await client.guilds.fetch();
  for (const [guildId] of guilds) {
    const guild = await client.guilds.fetch(guildId);
    await guild.commands.set(client.commands.map(cmd => cmd.data));
  }
  console.log(`✅ ${client.user.tag} 已上線！`);
});

// 處理指令執行
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "❌ 指令執行時發生錯誤！", ephemeral: true });
  }
});

// 連接 MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ 已連接 MongoDB");
}).catch(err => {
  console.error("❌ MongoDB 連接失敗", err);
});

// 登入 Discord
client.login(process.env.TOKEN);
