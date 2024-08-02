const { global } = require("./global");
const { daftarTeks } = require("./modules/menu");
const { main } = require("./controller");
const os = require('os');
const conf = require("../config/configFile").info;
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const fs = require("fs");
const { exec } = require('child_process');
const path = require('path');
const list = './lib/modules/list.json';
const { getBuffer, YT, Spam } = require("./functions");
const {
  generateWAMessageFromContent,
  delay,
  proto,
  waUploadToServer,
  prepareWAMessageMedia, downloadContentFromMessage,
} = require("@whiskeysockets/baileys");
const fetch = require("node-fetch");
const zc = require("./api");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
var ytsearch = require("youtube-search");
const imageToBase64 = require("image-to-base64");
const webpConverter = require("./webpconverter");
const axios = require("axios");
const myPrefix = conf.prefix;

exports.core = async (sock, mei) => {
  const from = mei.key.remoteJid;
  var group = from.endsWith("@g.us");
  let sender = group ? mei.key.participant : mei.key.remoteJid;
  let fromPC = group ? (sender.includes(":") ? true : false) : false;
  sender = fromPC ? sender.split(":")[0] + "@s.whatsapp.net" : sender;

  //await sock.readMessages([mei.key])

  const blockNumber = JSON.parse(fs.readFileSync("lib/modules/banned.json"));
  const exGroup = JSON.parse(fs.readFileSync("lib/modules/exclude.json"));
  const premiumNumber = JSON.parse(fs.readFileSync("lib/modules/premium.json"));
  const vipGroup = JSON.parse(fs.readFileSync("lib/modules/vip.json"));
  const filterx = JSON.parse(fs.readFileSync("lib/modules/nsfwfilter.json"));
  const mutegroup = JSON.parse(fs.readFileSync("lib/modules/mutegroup.json"));

  let now = Date.now();

  const objKeys = Object.keys(mei.message);
  let type =
    objKeys[0] == "senderKeyDistributionMessage"
      ? objKeys[1] == "messageContextInfo"
        ? objKeys[2]
        : objKeys[1]
      : objKeys[0];

  let body = global.d.body(type, mei);
  if (mei.message.buttonsResponseMessage) {
    body = mei.message.buttonsResponseMessage.selectedButtonId;
  }

  if (mei.message.listResponseMessage) {
    body = mei.message.listResponseMessage.singleSelectReply.selectedRowId;
  }
  budy = global.d.budy(type, mei);
  bodyLNR = body
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  budyLNR = budy
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // bot
  var number = sock.user.id.split(":")[0] + "@s.whatsapp.net";

  // Message
  const content = JSON.stringify(mei.message);
  const id = mei.key.id;
  var deviceModel =
    (id.startsWith("BAE") || id.startsWith("3EB0") || id.startsWith("XYZ0")) &&
    (id.length === 16 || id.length === 12)
      ? "BOT"
      : id.length > 21
      ? "android"
      : id.substring(0, 2) == "3A"
      ? "ios"
      : "web";

  // Is
  const cmd = body.startsWith(conf.prefix) || body.startsWith(conf.prefix2);
  var group = from.endsWith("@g.us");
  // const owner = conf.owner.numero.includes(sender);
  const owner = conf.owner.some(owner => owner.numero.includes(sender));
  const isPrem = premiumNumber.includes(sender) || vipGroup.includes(from);
  const isbanned = blockNumber.includes(sender);
  const isEx = exGroup.includes(from);
  const isNotFilterx = filterx.includes(from);
  const isMute = group ? mutegroup.includes(from) : false;

  //YTDL
  // if (YT.isYTprocess(sender) && cmd) return sock.sendMessage(from, { text: "Bot sedang memproses video kamu..\n*Proses :* Youtube Download" }, { quoted: mei })
  // messages type
  var media = [
    "imageMessage",
    "videoMessage",
    "audioMessage",
    "stickerMessage",
    "documentMessage",
  ].includes(type);
  var voice = content.includes("audioMessage") && content.includes('ptt":true');
  var music =
    content.includes("audioMessage") && content.includes('ptt":false');
  var img = content.includes("imageMessage");
  var sticker = content.includes("stickerMessage");
  var video = content.includes("videoMessage");
  var giffromwa = content.includes('"gifAttribution":"GIPHY"');
  var gif = content.includes('"gifPlayback":true');
  var quotedM =
    type === "extendedTextMessage" && content.includes("quotedMessage");
  var quoted = type === "extendedTextMessage";
  var vcard = content.includes("contactMessage");
  var multipleVcard = content.includes("contactsArrayMessage");
  var liveLocation = content.includes("liveLocationMessage");
  var location = content.includes("locationMessage");
  var document = content.includes("documentMessage");
  var product = content.includes("productMessage");
  var forwarded = content.includes("forwardingScore");
  var requestPayment = content.includes("requestPaymentMessage");
  var sendPayment = content.includes("sendPaymentMessage");
  var cancelPayment = content.includes("cancelPaymentRequestMessage");
  var templateButtonReplyMessage = content.includes(
    "templateButtonReplyMessage"
  );
  var buttonsResponseMessage = content.includes("buttonsResponseMessage");
  var singleselectlist = content.includes("singleSelectReply");
  var docJS = document && content.includes("text/javascript");
  var docJson = document && content.includes("application/json");
  var docPdf = document && content.includes("application/pdf");
  var docWordDoc =
    document &&
    content.includes(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  var docHTML = document && content.includes("text/html");
  var docIMG = document && content.includes('"mimetype":"image/');

  // Parameter
  let a = body.trim().split(" ");
  let b = "";
  b += a[0].split(" ").slice(1).join(" ");
  b += a.slice(1).join(" ");
  const param = b.trim();
  const commandx = body.slice(conf.prefix.length).trim().split(/ +/).shift();
  const parameter = param.replace(`${commandx} `, "");

  function secondtime(second) {
    var sec_num = parseInt(second, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
  }

  function getList() {
    if (!fs.existsSync(list)) {
      fs.writeFileSync(list, JSON.stringify({}));
    }
    const data = fs.readFileSync(list);
    return JSON.parse(data);
  }
  function saveList(list2) {
    fs.writeFileSync(list, JSON.stringify(list2, null, 2));
  }

  function saveImagePath(newPath) {
    const data = { imagePath: newPath };
    fs.writeFileSync('/lib/modules/qrispath.json', JSON.stringify(data));
  }

  function getImagePath() {
    try {
      const data = fs.readFileSync('./lib/modules/qrispath.json', 'utf8');
      const { imagePath } = JSON.parse(data);
      return imagePath;
    } catch (err) {
      console.error("Error reading image path file:", err);
      return '';
    }
  }


  function getServerIP() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      const interface = networkInterfaces[interfaceName];
      for (const addressInfo of interface) {
        if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
          return addressInfo.address;
        }
      }
    }
    return 'Local IP address not found';
  }
  async function handleUpdateImage(sock, from, body, message) {
    const media = message.imageMessage || message.videoMessage;

    if (!media) {
      await sock.sendMessage(from, { text: 'No image found in the message!' });
      return;
    }

    const buffer = await g.func.downloadMedia(message);
    const imagePath = path.join('assets/qris', 'qris.png');

    try {
      fs.writeFileSync(imagePath, buffer);
      saveImagePath(imagePath);
      await sock.sendMessage(from, { text: 'Image has been successfully updated!' });
    } catch (error) {
      console.error("Error saving new image:", error);
      await sock.sendMessage(from, { text: 'Failed to update image.' });
    }
  }

  function restartBot() {
    // Define the command to restart the bot
    const restartCommand = `pm2 restart webranabot)}`;

    exec('pm2 stop webranabot', (err) => {
      if (err) {
        console.error('Error stopping bot:', err);
        return;
      }

      console.log('Bot stopped. Restarting...');

      // Restart the bot
      exec(restartCommand, (err, stdout, stderr) => {
        if (err) {
          console.error('Error restarting bot:', err);
          return;
        }
        console.log('Bot restarted successfully');
        console.log(stdout);
        console.error(stderr);
      });
    });
  }



  // Group
  const participant = mei.key.participant;

  //Anti Spam
  if (
    !mei.message.buttonsResponseMessage &&
    !mei.message.listResponseMessage &&
    Spam.isSpam(sender)
  )
    return;

  if (cmd) Spam.addSpam(sender);
  // Command
  const command = body
    .slice(conf.prefix.length)
    .trim()
    .split(/ +/)
    .shift()
    .toLowerCase();

  mei.key.participant = sender;



  var g = {
    sock,
    conf,
    global,
    func: {
      async reply(txt) {
        await g.func.sendTyping();
        var response = await sock.sendMessage(
          from,
          { text: txt },
          { quoted: mei }
        );
        return response;
      },
      parameter(body) {
        let a = body.trim().split("\n");
        let b = "";
        b += a[0].split(" ").slice(1).join(" ");
        b += a.slice(1).join("\n");
        const capt = b.trim();
        return capt;
      },

      async report(txt = "ada laporan") {
        return;
      },
      async notPremium(txt) {
        await g.func.sendTyping();
        var response = await sock.sendMessage(
          from,
          { text: "Fitur khusus user premium!" },
          { quoted: mei }
        );
        return response;
      },
      async replyAudio(path) {
        await sock.sendMessage(
          from,
          { audio: { url: path }, mimetype: "audio/mp4", ptt: true },
          { quoted: mei }
        );
      },
      async imgBase64(path) {
        var anu = imageToBase64(path); // Path to the image
        return anu;
      },
      async replyVideo(path) {
        await sock.sendMessage(
          from,
          { video: { url: path }, ptt: true },
          { quoted: mei }
        );
      },
      async replyAudio2(path) {
        await sock.sendMessage(
          from,
          { audio: { url: path }, mimetype: "audio/mp4" },
          { quoted: mei }
        );

        fs.unlinkSync(path);
      },
      async replySticker(path) {
        await sock.sendMessage(
          from,
          { sticker: { url: path } },
          { quoted: mei }
        );
      },
      async imagetosticker(path, teks) {
        const sticker = await new Sticker(path, {
          pack: teks,
          author: conf.bot.shortName,
          type: StickerTypes.FULL,
          quality: 10,
        });
        await sock.sendMessage(from, await sticker.toMessage(), {
          quoted: mei,
        });
        fs.unlinkSync(path);
      },
      async imagetosticker2(path, teks) {
        const sticker = await new Sticker(path, {
          pack: teks,
          author: conf.bot.shortName,
          type: StickerTypes.FULL,
          quality: 30,
        });
        await sticker.toFile(teks + ".webp");
        fs.unlinkSync(path);
      },

      async imageButton(link, caption, next) {
        let buff = await getBuffer(link);

        const buttons = [
          { buttonId: next, buttonText: { displayText: "Next➠" }, type: 1 },
        ];

        const buttonMessage = {
          image: { url: link },
          caption: caption,
          footer: conf.bot.name,
          buttons: buttons,
          headerType: 4,
        };

        await sock.sendMessage(from, buttonMessage, { quoted: mei });
      },
      async replyImage(path, description) {
        await sock.sendMessage(
          from,
          { image: { url: path }, caption: description },
          { quoted: mei }
        );
      },
      async send(to, txt) {
        await sock.sendMessage(to, { text: txt });
      },
      async replyMarked(txt, members) {
        await sock.sendMessage(
          from,
          { text: txt, contextInfo: { mentionedJid: members } },
          { quoted: mei }
        );
      },
      async deleteMessage(messageID, f = from) {
        await sock.sendMessage(f, { delete: messageID });
      },
      async downloadMedia(messageObj = false, metype) {
        const {
          downloadContentFromMessage,
        } = require("@whiskeysockets/baileys");

        if (quoted) {
          var objkeysDown = Object.keys(
            mei.message.extendedTextMessage.contextInfo.quotedMessage
          );
          var typed =
            objkeysDown[0] == "senderKeyDistributionMessage"
              ? objkeysDown[1] == "messageContextInfo"
                ? objkeysDown[2]
                : objkeysDown[1]
              : objkeysDown[0];
        } else if (type == "viewOnceMessage") {
          var objkeysDown = Object.keys(mei.message.viewOnceMessage.message);
          var typed =
            objkeysDown[0] == "senderKeyDistributionMessage"
              ? objkeysDown[1] == "messageContextInfo"
                ? objkeysDown[2]
                : objkeysDown[1]
              : objkeysDown[0];
        } else if (messageObj) {
          var typed = metype;
        } else {
          var typed = type;
        }

        var mety = messageObj
          ? messageObj
          : quoted
          ? mei.message.extendedTextMessage.contextInfo.quotedMessage[typed]
          : type == "viewOnceMessage"
          ? mei.message.viewOnceMessage.message[typed]
          : mei.message[typed];
        const stream = await downloadContentFromMessage(
          mety,
          typed.replace("Message", "")
        );
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        var mediaPath = "./assets/downloads/";
        var mediaName = (Math.random() + 1).toString(36).substring(7);
        var mediaExtension = mety.mimetype.replace("audio/mp4", "audio/mp3");
        var mediaExtension = mediaExtension.replace(
          "vnd.openxmlformats-officedocument.wordprocessingml.document",
          "docx"
        );
        var mediaExtension = mediaExtension.replace("; codecs=opus", "");
        var mediaExtension = "." + mediaExtension.split("/")[1];
        var filePath = mediaPath + mediaName + mediaExtension;

        fs.writeFileSync(filePath, buffer);
        return filePath;
      },
      async downloadQRISMedia(messageObj = false, metype) {
        let typed;
        if (quoted) {
          var objkeysDown = Object.keys(mei.message.extendedTextMessage.contextInfo.quotedMessage);
          typed = objkeysDown[0] === "senderKeyDistributionMessage"
              ? objkeysDown[1] === "messageContextInfo"
                  ? objkeysDown[2]
                  : objkeysDown[1]
              : objkeysDown[0];
        } else if (type === "viewOnceMessage") {
          var objkeysDown = Object.keys(mei.message.viewOnceMessage.message);
          typed = objkeysDown[0] === "senderKeyDistributionMessage"
              ? objkeysDown[1] === "messageContextInfo"
                  ? objkeysDown[2]
                  : objkeysDown[1]
              : objkeysDown[0];
        } else if (messageObj) {
          typed = metype;
        } else {
          typed = type;
        }

        const mety = messageObj
            ? messageObj
            : quoted
                ? mei.message.extendedTextMessage.contextInfo.quotedMessage[typed]
                : type === "viewOnceMessage"
                    ? mei.message.viewOnceMessage.message[typed]
                    : mei.message[typed];

        const stream = await downloadContentFromMessage(mety, typed.replace("Message", ""));
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        const mediaPath = path.join('./assets/qris/');
        const mediaName = 'qris';
        const mediaExtension = 'png'; // Always save as PNG
        const filePath = path.join(mediaPath, `${mediaName}.${mediaExtension}`);

        // Check if file exists and delete it
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        fs.writeFileSync(filePath, buffer);
        return filePath;
      },
      async ban(numeros, grupo, options, f = from) {
        var response = false;
        if (!numeros || !grupo) {
          console.log(numeros, grupo);
          return response;
        }

        const groupMetadata = group ? await sock.groupMetadata(f) : "";
        const groupMembers = group ? groupMetadata.participants : "";
        const groupAdmins = group ? global.d.getGroupAdmins(groupMembers) : "";

        if (
          !JSON.stringify(groupAdmins).includes(g.message.sender) &&
          !options?.any
        )
          return { message: "Você não é adm." };

        if (options?.force) {
          try {
            response = await sock.groupParticipantsUpdate(
              grupo,
              numeros,
              "remove"
            );
          } catch (error) {
            response = error;
          }
          return response;
        }

        var includesAdm = false;

        for (let i = 0; i < numeros.length; i++) {
          const num = numeros[i];
          if (JSON.stringify(groupAdmins).includes(num)) {
            includesAdm = true;
            numeros.splice(i, 1);
          }
        }

        if (includesAdm)
          !options?.any
            ? await g.func.reply("Não posso remover adm")
            : await this.presence("composing");

        if (numeros.length <= 0) return response;

        try {
          response = await sock.groupParticipantsUpdate(
            grupo,
            numeros,
            "remove"
          );
        } catch (error) {
          response = error;
        }

        return response;
      },
      async add(pessoas, f = from) {
        return new Promise(async (resolve, reject) => {
          sock.ws.on(`CB:iq`, (node) => {
            if (!node.content) return;
            if (!node.content[0]?.content) return;

            var jid = node.content[0]?.content[0]?.attrs?.jid;
            var error = node.content[0]?.content[0]?.attrs?.error;
            var content = node.content[0]?.content[0]?.content;

            resolve({ jid, error, content });
          });

          await sock.groupParticipantsUpdate(f, pessoas, "add");
        });
      },
      async sendMessageInviteAdd(num, attrs) {
        const {
          generateWAMessageFromContent,
          proto,
        } = require("@whiskeysockets/baileys");
        const ppUrl = await this.getProfilePicture();
        const groupInfo = await this.getGroupMeta();
        const gId = groupInfo.id;
        const gName = groupInfo.subject;
        const thumbPath = await global.d.downloadFromURL(ppUrl);
        const thumb = fs.readFileSync(thumbPath);

        var template = generateWAMessageFromContent(
          num,
          proto.Message.fromObject({
            groupInviteMessage: {
              groupJid: gId,
              inviteCode: attrs.code,
              inviteExpiration: attrs.expiration,
              groupName: gName,
              jpegThumbnail: thumb,
              caption:
                "Opa! Não consegui te adicionar no grupo. Clique no convite para entrar no grupo.",
            },
          }),
          {}
        );
        await sock.relayMessage(num, template.message, {
          messageId: template.key.id,
        });
      },
      async changeadmto(numbers, type, f = from) {
        var response = await sock.groupParticipantsUpdate(f, numbers, type);
        return response;
      },
      async leave(f = from) {
        await this.reply("Saindo :)");
        await sock.groupLeave(f);
      },
      async leave2(f = from) {
        await this.reply("Minimal anggota grup adalah 10\nSayonara...");
        await sock.groupLeave(f);
      },
      async mutar(time, chat) {
        await sock.chatModify({ mute: time }, chat);
      },
      async enterGroup(message, f = from) {
        let code = message
          .split("https://chat.whatsapp.com/")[1]
          .trim()
          .split(/ +/)
          .shift();
        try {
          var group = await sock.groupAcceptInvite(code);
          await sock.sendMessage(group, {
            text:
              "Opa! Cheguei :) Fui adicionado por wa.me/" +
              f.split("@")[0] +
              " Agora passa o ADM para que eu possa fazer a boa",
          });
          var res = "Show! Acabei de entrar nesse grupo :)";
        } catch (e) {
          console.log(e);
          var res = "Não consegui entrar no grupo.";
        }
        return res;
      },
      async presence(mode, f = from) {
        // 'unavailable' | 'available' | 'composing' | 'recording' | 'paused'
        await sock.sendPresenceUpdate(mode, f);
      },
      async getGroupMeta(f = from) {
        const groupMetadata = group ? await sock.groupMetadata(f) : "";
        return groupMetadata;
      },
      async getGroupCode(f = from) {
        var code;
        try {
          code = group ? await sock.groupInviteCode(f) : "";
        } catch (error) {
          console.log(error);
          code = false;
        }

        return code;
      },
      async sendTyping(f = from) {
        await sock.presenceSubscribe(f);
        await delay(1000);
        await sock.sendPresenceUpdate("composing", f);
        await delay(2500);
        await sock.sendPresenceUpdate("paused", f);
        return;
      },
      async getProfilePicture(f = from) {
        const ppUrl = await sock.profilePictureUrl(f);
        return ppUrl;
      },
      async changeGroupSubject(subject, f = from) {
        await sock.groupUpdateSubject(f, subject);
      },
      async changeGroupDescription(description, f = from) {
        await sock.groupUpdateDescription(f, description);
      },
      async changeProfilePicture(url, f = from) {
        await sock.updateProfilePicture(f, { url: url });
      },
      async isAdmin(number = g.message.sender, f = from) {
        const groupMetadata = group ? await sock.groupMetadata(f) : "";
        const groupMembers = group ? groupMetadata.participants : "";
        const groupAdmins = group ? global.d.getGroupAdmins(groupMembers) : "";
        let response = JSON.stringify(groupAdmins).includes(number)
          ? true
          : false;
        return response;
      },
    },
    bot: {
      numero: number,
      grupo: conf.grupo,
    },
    message: {
      mei,
      type,
      from,
      sender,
      body,
      budy,
      bodyLNR,
      budyLNR,
      id,
      deviceModel,
    },
    group: {
      participant,
    },
    is: {
      cmd,
      body,
      group,
      owner,
      isPrem,
      isbanned,
      isMute,
      isNotFilterx,
      fromPC,
      media,
      voice,
      music,
      img,
      sticker,
      video,
      giffromwa,
      gif,
      quotedM,
      quoted,
      forwarded,
      vcard,
      multipleVcard,
      liveLocation,
      location,
      requestPayment,
      sendPayment,
      cancelPayment,
      product,
      buttonsResponseMessage,
      templateButtonReplyMessage,
      singleselectlist,
      document,
      docJS,
      docJson,
      docPdf,
      docWordDoc,
      docHTML,
      docIMG,
    },
    cmd: {
      command,
    },
    sms: {
      aguarde: "⌛ Por favor, aguarde. Processo em andamento... ⌛",
      sucesso: "✔️ Sucesso ✔️",
      erro: {
        sock: "Por favor, tente novamente mais tarde",
        server: "Ocorreu um erro com o servidor",
        notFound: "Não consegui localizar",
        noadm: "Robô necessita de acesso administrativo no grupo.",
        cmdPrivate: "Comando indisponivel",
      },
      apenas: {
        grupo: `Exclusivo para grupos!`,
        grupoP: `Exclusivo para o grupo proprietário!`,
        owner: `Exclusivo para o ${conf.owner.nome}!`,
        admin: `Exclusivo para os administradores de grupo!`,
        botadm: `Exclusivo para o bot administrador!`,
        cadastrados: `── 「REGISTRE-SE」 ──\nVocê não está registrado no banco de dados. \n\nComando : ${conf.prefix}cadastrar nome|idade\nExemplo : ${conf.prefix}cadastrar Guilherme|18`,
      },
    },
  };

  if (g.is.cmd && !isbanned && !g.is.isMute) {
    switch (command) {
      //ping
      case `p`: {
        g.func.reply("👋👋");
        break;
      }

      case "hidetag": {
        if (!group) return g.func.reply(`Hanya Dapat Digunakan di Dalam Grup!`);
        const groupMetadata = group ? await sock.groupMetadata(from) : "";
        const groupMembers = group ? groupMetadata.participants : "";
        const groupAdmins = group ? global.d.getGroupAdmins(groupMembers) : "";
        if (group && !owner && !JSON.stringify(groupAdmins).includes(sender))
          return g.func.reply(`Admin Only`);
        let parameter = g.func.parameter(body);
        if (!parameter) parameter = "Anda Telah di Tag oleh Admin!";
        try {
          var group = await sock.groupMetadata(from);
          var member = group["participants"];
          var mem = [];
          member.map(async (adm) => {
            mem.push(adm.id.replace("c.us", "s.whatsapp.net"));
          });
          sock.sendMessage(
            from,
            { text: parameter, mentions: mem },
            { quoted: mei }
          );
        } catch (e) {
          g.func.reply("Terjadi Kesalahan \nError:" + e);
        }
        break;
      }

      //banned command
      case "banned": {
        if (!owner) return g.func.reply("Owner Only!");
        try {
          const cekk = blockNumber.includes(
            g.func.parameter(body) + "@s.whatsapp.net"
          );
          if (cekk) {
            g.func.reply("Nomor tersebut telah dibanned!");
          } else {
            await blockNumber.push(g.func.parameter(body) + "@s.whatsapp.net");
            fs.writeFileSync(
              "lib/modules/banned.json",
              JSON.stringify(blockNumber)
            );
            g.func.reply("Banned Berhasil");
          }
        } catch (e) {
          g.func.reply("Terjadi Kesalahan \n" + e);
        }
        break;
      }

      case "unbanned": {
        if (!owner) return g.func.reply("Owner Only!");
        try {
          const cekk = blockNumber.includes(
            g.func.parameter(body) + "@s.whatsapp.net"
          );
          if (cekk) {
            const indexban = await blockNumber.indexOf(
              g.func.parameter(body) + "@s.whatsapp.net"
            );
            await blockNumber.splice(indexban, 1);
            fs.writeFileSync(
              "lib/modules/banned.json",
              JSON.stringify(blockNumber)
            );
            g.func.reply("Unbanned Berhasil");
          } else {
            g.func.reply("Nomor tersebut tidak dibanned!");
          }
        } catch (e) {
          g.func.reply("Terjadi Kesalahan \nError:" + e);
        }
        break;
      }
      case "ownerlist": {
        try {
          const owners = conf.owner.map(owner => `Name: ${owner.name}, Number: ${owner.number}`).join('\n');
          await g.func.reply(`Owner List:\n${owners}`);
        } catch (e) {
          await g.func.reply("Terjadi Kesalahan \nError:" + e);
        }
        break;
      }
      case "addowner": {
        if (!owner) return g.func.reply("Owner Only!");
        const params = g.func.parameter(body).split(',');
        if (params.length < 2) {
          g.func.reply("Format salah! Gunakan: addowner <name>,<number>");
          break;
        }
        let [name, number] = params;
        if (!number.endsWith('@s.whatsapp.net')) {
          number += "@s.whatsapp.net";
          // await g.func.reply("Nomor harus diakhiri dengan @s.whatsapp.net");
          // break;
        }
        try {
          conf.owner.push({ name: name.trim(), number: number.trim(), numero: number.trim() });

          // Manually create the content for the owner section
          const ownerContent = conf.owner.map(owner =>
              `{ name: ${JSON.stringify(owner.name)}, number: ${JSON.stringify(owner.number)}, numero: ${JSON.stringify(owner.numero)} }`
          ).join(',\n    ');

          // Create the full config content
          const configContent = `
exports.info = {
    prefix: "${conf.prefix}",
    prefix2: "${conf.prefix2}",
    owner: [
        ${ownerContent}
    ],
    bot: {
        name: "${conf.bot.name}",
        number: "${conf.bot.number}",
        shortName: "${conf.bot.shortName}",
        bigName: "${conf.bot.bigName}",
    },
    BotName: "${conf.BotName}",
    grup: "${conf.grup}",
    apikeyRemoveBg: "${conf.apikeyRemoveBg}",
    endpointDigi: "${conf.endpointDigi}",
    apiKey: "${conf.apiKey}",
    username: "${conf.username}",
    merchantId: "${conf.merchantId}",
    secretKey: "${conf.secretKey}",
    endpointAPIgames: "${conf.endpointAPIgames}",
};
`;

          fs.writeFileSync('./config/configFile.js', configContent);
          g.func.reply("Owner berhasil ditambahkan!");
        } catch (e) {
          g.func.reply("Terjadi Kesalahan \nError:" + e);
        }
        break;
      }



      case "removeowner": {
        if (!owner) return g.func.reply("Owner Only!");
        const numberToRemove = g.func.parameter(body).trim() + "@s.whatsapp.net";
        try {
          const index = conf.owner.findIndex(owner => owner.numero === numberToRemove);
          if (index !== -1) {
            conf.owner.splice(index, 1);

            // Manually create the content for the owner section
            const ownerContent = conf.owner.map(owner =>
                `{ name: ${JSON.stringify(owner.name)}, number: ${JSON.stringify(owner.number)}, numero: ${JSON.stringify(owner.numero)} }`
            ).join(',\n    ');

            // Create the full config content
            const configContent = `
exports.info = {
    prefix: "${conf.prefix}",
    prefix2: "${conf.prefix2}",
    owner: [
        ${ownerContent}
    ],
    bot: {
        name: "${conf.bot.name}",
        number: "${conf.bot.number}",
        shortName: "${conf.bot.shortName}",
        bigName: "${conf.bot.bigName}",
    },
    BotName: "${conf.BotName}",
    grup: "${conf.grup}",
    apikeyRemoveBg: "${conf.apikeyRemoveBg}",
    endpointDigi: "${conf.endpointDigi}",
    apiKey: "${conf.apiKey}",
    username: "${conf.username}",
    merchantId: "${conf.merchantId}",
    secretKey: "${conf.secretKey}",
    endpointAPIgames: "${conf.endpointAPIgames}",
};
`;

            fs.writeFileSync('./config/configFile.js', configContent);
            g.func.reply("Owner berhasil dihapus!");
          } else {
            g.func.reply("Owner tidak ditemukan!");
          }
        } catch (e) {
          g.func.reply("Terjadi Kesalahan \nError:" + e);
        }
        break;
      }

      case "updatebotnumber": {
        if (!owner) return g.func.reply("Owner Only!");
        let newNumber = g.func.parameter(body).trim() + "@s.whatsapp.net";
        if (!newNumber.endsWith('@s.whatsapp.net')) {
          newNumber += "@s.whatsapp.net";
          // g.func.reply("Nomor harus diakhiri dengan @s.whatsapp.net");
          // break;
        }
        try {
          // Update the bot number in the configuration
          conf.bot.number = newNumber;

          // Manually create the content for the entire config
          const ownerContent = conf.owner.map(owner =>
              `{ name: ${JSON.stringify(owner.name)}, number: ${JSON.stringify(owner.number)}, numero: ${JSON.stringify(owner.numero)} }`
          ).join(',\n    ');

          const configContent = `
exports.info = {
    prefix: "${conf.prefix}",
    prefix2: "${conf.prefix2}",
    owner: [
        ${ownerContent}
    ],
    bot: {
        name: "${conf.bot.name}",
        number: "${conf.bot.number}",
        shortName: "${conf.bot.shortName}",
        bigName: "${conf.bot.bigName}",
    },
    BotName: "${conf.BotName}",
    grup: "${conf.grup}",
    apikeyRemoveBg: "${conf.apikeyRemoveBg}",
    endpointDigi: "${conf.endpointDigi}",
    apiKey: "${conf.apiKey}",
    username: "${conf.username}",
    merchantId: "${conf.merchantId}",
    secretKey: "${conf.secretKey}",
    endpointAPIgames: "${conf.endpointAPIgames}",
};
`;

          fs.writeFileSync('./config/configFile.js', configContent);
          g.func.reply("Nomor bot berhasil diperbarui!");
        } catch (e) {
          g.func.reply("Terjadi Kesalahan \nError:" + e);
        }
        break;
      }

      case "addlist": {
        if (!owner) return g.func.reply("Owner Only!");

        const params = g.func.parameter(body).split(' ');
        if (params.length < 2) {
          g.func.reply("Format salah! Gunakan: addlist <key> <value>");
          break;
        }

        const key = params[0].trim();
        const value = params.slice(1).join(' ');

        let list = getList();
        list[key] = value;

        try {
          saveList(list);
          g.func.reply("Item berhasil ditambahkan ke list!");
        } catch (e) {
          g.func.reply("Terjadi Kesalahan \nError:" + e);
        }
        break;
      }


      case "deletelist": {
        if (!owner) return g.func.reply("Owner Only!");
        const key = g.func.parameter(body).trim();
        let list = getList();
        if (!list[key]) {
          g.func.reply("Item tidak ditemukan di list!");
          break;
        }
        delete list[key];
        try {
          saveList(list);
          g.func.reply("Item berhasil dihapus dari list!");
        } catch (e) {
          g.func.reply("Terjadi Kesalahan \nError:" + e);
        }
        break;
      }

      case "updatelist": {
        if (!owner) return g.func.reply("Owner Only!");
        const params = g.func.parameter(body).split(',');
        if (params.length < 2) {
          g.func.reply("Format salah! Gunakan: updatelist <key>,<new_value>");
          break;
        }
        const [key, newValue] = params;
        let list = getList();
        if (!list[key]) {
          g.func.reply("Item tidak ditemukan di list!");
          break;
        }
        list[key.trim()] = newValue.trim();
        try {
          saveList(list);
          g.func.reply("Item berhasil diupdate di list!");
        } catch (e) {
          g.func.reply("Terjadi Kesalahan \nError:" + e);
        }
        break;
      }


      case "checklist": {
        if (!owner) return g.func.reply("Owner Only!");
        let list = getList();
        if (Object.keys(list).length === 0) {
          g.func.reply("List kosong!");
          break;
        }
        let listContent = "Daftar List:\n";
        for (const [key, value] of Object.entries(list)) {
          listContent += `➸ ${key}\n`;
        }
        listContent += `\nRunning Time: ${secondtime(process.uptime())}`;
        g.func.reply(listContent);
        break;
      }


        //menu
      case `help`:
      case `menu`: {
        let teks = daftarTeks.menuBot(mei.pushName);

        const sendMsg = await sock.sendMessage(from, { text: teks });

        break;
      }
      case `helpowner`:
      case `menuowner`: {
        if (!owner) return g.func.reply("Owner Only!");
        let teks = daftarTeks.menuOwner(mei.pushName);

        const sendMsg = await sock.sendMessage(from, { text: teks });

        break;
      }
      case "mlbb":{
        let teks = daftarTeks.mlbb(mei.pushName);

        const sendMsg = await sock.sendMessage(from, { text: teks });

        break;
      }
      case "fifa mobile":
      case "fifa":{
        let teks = daftarTeks.fm(mei.pushName);

        const sendMsg = await sock.sendMessage(from, { text: teks });

        break;
      }
      case "updatepayimage":
      case "updatepayimg": {
        if (!owner) return g.func.reply("Owner Only!");
        await handleUpdateImage(sock, from, body, message);
        break;
      }
      case "ip":{
        if (!owner) return g.func.reply("Owner Only!");
        const ip = getServerIP();
        await g.func.reply(`Server IP Address: ${ip}`)
        break;
      }
      case "bayar":
      case "pay":
      case "pembayaran": {
        let teks = daftarTeks.bayar(mei.pushName);
        const imagePath = path.join('./assets/qris/','qris.png');

        if (!fs.existsSync(imagePath)) {
          await sock.sendMessage(from, { text: teks });
          break;
        }

        try {
          await sock.sendMessage(
              from,
              {
                image: {url: imagePath},
                caption: teks
              }
              );
        } catch (error) {
          console.error("Error sending message with image:", error);
        }

        break;
      }

      case 'restart': {
        restartBot();
        g.func.reply("Bot Restarted.")
        break;
      }

      case "join reseller":
      case "join":{
        let teks = daftarTeks.ress(mei.pushName);
        const vcard =
          "BEGIN:VCARD\n" + // metadata of the contact card
          "VERSION:3.0\n" +
          "FN:Owner \n" + // full name
          "ORG:Blessing Software;\n" + // the organization of the contact
          "TEL;type=CELL;type=VOICE;waid=6285648622105:+62 856 4862 2105\n" + // WhatsApp ID + phone number
          "END:VCARD";

        const sendMsg = await sock.sendMessage(from, { text: teks });
        const sendVcard = await sock.sendMessage(from, {
          contacts: {
            displayName: "Yae",
            contacts: [{ vcard }],
          },
        });

        break;
      }

      default: {
        let list = getList();
        if (list[command]) {
          await g.func.reply(list[command]);
        }

        break;
      }
    }
  }

  //Mute Group
  if (g.is.body == myPrefix + "mute on") {
    if (!group) return g.func.reply(`Hanya Dapat Digunakan di Dalam Grup!`);
    const groupMetadata = group ? await sock.groupMetadata(from) : "";
    const groupMembers = group ? groupMetadata.participants : "";
    const groupAdmins = group ? global.d.getGroupAdmins(groupMembers) : "";
    if (group && !owner && !JSON.stringify(groupAdmins).includes(sender))
      return g.func.reply(`Admin Only`);

    try {
      const cekk = mutegroup.includes(from);
      if (cekk) {
        g.func.reply("Group Telah di Mute");
      } else {
        await mutegroup.push(from);
        fs.writeFileSync(
          "lib/modules/mutegroup.json",
          JSON.stringify(mutegroup)
        );
        g.func.reply("Berhasil masuk ke mode silent");
      }
    } catch (e) {
      g.func.reply("Terjadi Kesalahan \n" + e);
    }
    return;
  }

  if (g.is.body == myPrefix + "mute off") {
    if (!group) return g.func.reply(`Hanya Dapat Digunakan di Dalam Grup!`);
    const groupMetadata = group ? await sock.groupMetadata(from) : "";
    const groupMembers = group ? groupMetadata.participants : "";
    const groupAdmins = group ? global.d.getGroupAdmins(groupMembers) : "";
    if (group && !owner && !JSON.stringify(groupAdmins).includes(sender))
      return g.func.reply(`Admin Only`);

    try {
      const cekk = mutegroup.includes(from);
      if (cekk) {
        const indexban = await mutegroup.indexOf(from);
        await mutegroup.splice(indexban, 1);
        fs.writeFileSync(
          "lib/modules/mutegroup.json",
          JSON.stringify(mutegroup)
        );
        g.func.reply("Berhasil mematikan mode silent");
      } else {
        g.func.reply("Grup telah Silent!");
      }
    } catch (e) {
      g.func.reply("Terjadi Kesalahan \nError:" + e);
    }
    return;
  }

  module.exports = { g };

  await main();
};
