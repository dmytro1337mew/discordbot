const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Канал, куди надсилати вікно заявки
const TICKET_CHANNEL_ID = '1408038158746124309';
const DATA_FILE = './ticket.json';

// Коли бот запустився
client.once("ready", async () => {
  console.log(`✅ Бот запущений як ${client.user.tag}`);

  const channel = await client.channels.fetch(TICKET_CHANNEL_ID);
  if (!channel) return console.error('Канал не знайдено!');

  let messageId;

  // Перевіряємо, чи є збережене повідомлення
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    messageId = data.messageId;
  }
const owner = "348766365282467841";

  const embed = new EmbedBuilder()
    .setColor('#0059ff')
    .setTitle('Подати заявку')
    .setDescription(`# Шаблон заявки
### Будь ласка, скопіюйте та заповніть наступну форму:
\`\`\`


1. Ім'я:
2. Звідки ви:
3. Вік (від 16 років):
4. Середній онлайн на день:
5. Кількість годин в Rust:
6. Досвід гри в кланах:
7. Скільки ELO на UKN та стабільних кілівв на FFA AK:
8. Посилання на Steam профіль:
9. Звідки дізнались про клан:
10. Напрямок у Rust (будівельник тощо):
\`\`\`
### Вимоги до кандидатів:
• Від 3 000 годин (можливі винятки за наявності таланту або рекомендацій)
• Вік 16+ (без винятків)
• Від FFA 30+ AK /Walls (стабільних)
• Серйозне ставлення і повна віддача в перші дні вайпу (онлайн не менше 8 годин)
• Граємо на серйозних проєктах, потрібно буде купувати VIP (10 USD)
• Гарний ПК
• Високий рівень стрільби з усіх типів зброї

Роль яка вас може перевірити: <@&${owner}>.
Заповніть форму вище та очікуйте на відповідь від адміністрації.
`);


  const button = new ButtonBuilder()
    .setCustomId('create_ticket')
    .setLabel('Створити тікет')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  if (messageId) {
    // Якщо повідомлення є, спробуємо його отримати та оновити
    try {
      const msg = await channel.messages.fetch(messageId);
      await msg.edit({ embeds: [embed], components: [row] });
      console.log('Повідомлення оновлено.');
    } catch (err) {
      const msg = await channel.send({ embeds: [embed], components: [row] });
      fs.writeFileSync(DATA_FILE, JSON.stringify({ messageId: msg.id }));
      console.log('Повідомлення створено заново.');
    }
  } else {
    const msg = await channel.send({ embeds: [embed], components: [row] });
    fs.writeFileSync(DATA_FILE, JSON.stringify({ messageId: msg.id }));
    console.log('Повідомлення створено.');
  }
});

// Повтор команди !say
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!say") || message.author.bot) return;

  const text = message.content.slice(4).trim();
  if (text.length > 0) {
    message.channel.send(text);
  }
});

// Обробка натискання кнопки для створення тікету
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'create_ticket') {
    const guild = interaction.guild;
    const user = interaction.user;
    const owner = "348766365282467841";
  
    const existing = guild.channels.cache.find(ch => ch.name === `ticket-${user.username}`);
    if (existing) {
      return interaction.reply({ 
        content: "❌ У вас вже є відкритий тікет!", 
        ephemeral: true 
      });
    }
    // Створюємо канал у категорії
    const channel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: 0, // текстовий канал
      parent: '1408057084725039165', // категорія
      permissionOverwrites: [
        {
          id: guild.id,
          deny: ['ViewChannel'],
        },
        {
          id: user.id,
          allow: ['ViewChannel', 'SendMessages'],
        },
        {
          id: owner,
          allow: ['ViewChannel', 'SendMessages'],
        }
      ]
    });

    // Відправляємо **звичайне повідомлення зверху**
    await channel.send(`Привіт, ${user}, адміністратори скоро з тобою зв'яжуться, а поки скористайся шаблоном нижче!`);

    // Створюємо Embed із формою заявки
    const embed = new EmbedBuilder()
      .setColor('#0059ff')
      .setTitle('Шаблон заявки')
      .setDescription(`
\`\`\`
1. Ім'я:
2. Звідки ви:
3. Вік (від 16 років):
4. Середній онлайн на день:
5. Кількість годин в Rust:
6. Досвід гри в кланах:
7. Скільки ELO на UKN та стабільних кілів на FFA AK:
8. Посилання на Steam профіль:
9. Звідки дізнались про клан:
10. Напрямок у Rust (будівельник тощо):
\`\`\`
Роль яка вас може перевірити: <@&${owner}>.
`);
   const closeButton = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Закрити тікет')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeButton);
    // Відправляємо Embed у канал
   await channel.send({ embeds: [embed], components: [row] });

    // Відповідь користувачу, що тікет створено
    await interaction.reply({ content: `Тікет створено: ${channel}`, ephemeral: true });

  }
   if (interaction.customId === 'close_ticket') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "❌ Лише адміністратори можуть закривати тікети!", ephemeral: true });
    }

    await interaction.reply({ content: "🔒 Тікет буде закритий через 5 секунд..." });

    setTimeout(() => {
      interaction.channel.delete().catch(err => console.error("Помилка при видаленні каналу:", err));
    }, 5000);
  }
});


client.login("MTQwODAyNjMwMDU2Mzg0OTMzNw.GRs9Em.V4WcKOA6Aiy5gcIB9BnbM1U-S_pocMG5kFkF9A");
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(3000, () => {
  console.log("🌐 Web server запущено на порті 3000");
});