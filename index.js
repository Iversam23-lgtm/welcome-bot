require('dotenv').config();

const path = require('node:path');
const {
  Client,
  GatewayIntentBits,
  AttachmentBuilder,
  Events
} = require('discord.js');

const { Canvas, loadImage } = require('skia-canvas');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.DISCORD_TOKEN;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;

const BACKGROUND = path.join(__dirname, 'assets', 'prevail.png');

async function createCard(member) {

  const width = 1050;
  const height = 500;

  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext("2d");

  const bg = await loadImage(BACKGROUND);
  ctx.drawImage(bg, 0, 0, width, height);

  const avatarSize = 170;
  const avatarX = width/2 - avatarSize/2;
  const avatarY = 90;

  const avatar = await loadImage(member.user.displayAvatarURL({extension:"png", size:512}));

  const centerX = avatarX + avatarSize/2;
  const centerY = avatarY + avatarSize/2;

  ctx.beginPath();
  ctx.arc(centerX, centerY, avatarSize/2 + 12, 0, Math.PI*2);
  ctx.shadowColor = "rgba(150,200,255,0.9)";
  ctx.shadowBlur = 40;
  ctx.fillStyle = "rgba(150,200,255,0.2)";
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(centerX, centerY, avatarSize/2, 0, Math.PI*2);
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

  ctx.font = "42px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  ctx.fillText(
    `${member.user.username} just joined the server`,
    width/2,
    330
  );

  ctx.font = "26px Arial";
  ctx.fillStyle = "#dddddd";

  ctx.fillText(
    `Member #${member.guild.memberCount}`,
    width/2,
    370
  );

  return canvas.png;
}

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.GuildMemberAdd, async member => {

  const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);

  const buffer = await createCard(member);

  const file = new AttachmentBuilder(buffer, { name: "welcome.png" });

  await channel.send({
    content: `Welcome to prevail :dance: ${member}`,
    files: [file]
  });

});

client.login(TOKEN);