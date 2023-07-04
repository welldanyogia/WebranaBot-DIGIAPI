const fs = require('fs')
const { delay } = require("@whiskeysockets/baileys")
const { json } = require('express/lib/response')
const quotesList = JSON.parse(fs.readFileSync("lib/modules/quotes.json", "utf-8"));
const factList = JSON.parse(fs.readFileSync("lib/modules/fact.json", "utf-8"));
const mathjs = require("mathjs")
const { ttdl } = require('./modules/ttdl')
const fetch = require("node-fetch")
const axios = require('axios')
const { createSignature,orderDigi,searchPriceByCode,getPriceList,generateRefId,checkTransaction,cekAkun,createSignatureAPI,getInfoAkun,cekKoneksiSmileOne, cekKoneksiKiosgamer,cekKoneksiUnipinID,cekKoneksiUnipinBrazil,cekKoneksiUnipinMY,beliProduk,cekStatusTransaksi, depositRequest, cekKoneksiHiggs, cekKoneksiUnipinPH} = require('./functions')
const { RemoveBgResult, RemoveBgError, removeBackgroundFromImageFile } = require("remove.bg")
const { TraceMoe } = require("trace.moe.ts")
const anilist = require('anilist-node');
const { text } = require('cheerio');
const { response } = require('express');
const conf = require('../config/configFile').info
const myPrefix = conf.prefix
exports.main = async () => {
  const { grupo, privado } = require('./modules')
  var { g } = require('./')

  const x = g.func;
  const body = g.message.body
  if (g.is.cmd && !g.is.isbanned && !g.is.isMute) {
    let parameter = g.func.parameter(body)

    switch (g.cmd.command) {

      //Quotes		
      case "quotes": {
        const quotes = quotesList[Math.floor(Math.random() * quotesList.length)];
        const text = `_"${quotes.quote}"_\n\n - ${quotes.by}`;
        x.reply(text);
        break
      }
      //Kalkulator
      case "math":
      case "calc":
      case "kalkulator": {
        if (!parameter) {
          x.reply("Gunakan input yang benar!! , contoh _.math 10+10*10/10_")
          break;
        }
        try {
          const text = `*Hasil Dari:*\n${parameter} = ${mathjs.evaluate(parameter)}`
          x.reply(text)
          break;
        } catch {
          x.reply(`Hanya dapat melakukan operasi perkalian (*), pembagian(/), tambah(+) dan kurang(-)\nContoh: .math 10*2+2-1/9`)
        }
        break;
      }
	
	    case "cekdeposit": {
          const checkComands = parameter.split(" ")
          if (!g.is.owner) return x.reply("Fitur khusus Owner! format salah")
          const endpoint = `${conf.endpointDigi}/cek-saldo`;
          const signature = createSignature(conf.username, conf.apiKey, 'depo');
          const data = {
            cmd: 'deposit',
            username: conf.username,
            sign: signature,
          };
          axios.post(endpoint,data)
          .then(async (response) =>{
              const responseData = response.data.data
              
              console.log(responseData)
              const formattedPrice = `Rp. ${responseData.deposit.toLocaleString(
                  "id-ID",
                  { minimumFractionDigits: 2 }
                )}`
              x.reply(`Saldo Anda adalah : ${formattedPrice}`);
              return responseData          
          })
          break
        }
        case 'digi':
        case 'order':
          {
            if (!parameter) return x.reply(`Format anda salah : .perintah kodeproduk tujuan`)
            if (!g.is.owner) return x.reply(`Fitur ini hanya dapat diakses oleh Owner`)
            
            
            try{
            const productCode = parameter.split(" ")[0]
            const number = parameter.split(" ")[1]
            console.log("produk"+productCode)
            console.log("nomor"+number)
            const ref_id = generateRefId(9);
            let response = await orderDigi(productCode, number,ref_id);
            const priceList = await getPriceList(conf.username,'pricelist')
            const product = searchPriceByCode(priceList, productCode);
            const DateTime = new Date();
            const date = DateTime.toLocaleDateString("id-ID",{
		  timeZone : 'Asia/Jakarta',
		  dateStyle : 'full',
		});
            const time = DateTime.toLocaleTimeString({
		  timeZone : 'Asia/Jakarta',
		  //timeStyle : 'short',
		  hour: '2-digit',
    		  minute: '2-digit',
    		  second: '2-digit',
		  hour12 : true,
		});
            let responseText = `*≽  DETAIL TRANSAKSI  ≼*\n\n`;
            if(response.data.rc != '03' && response.data.rc != '02' && response.data.rc != '00'){
               let responseTextFailed = `*≽  DETAIL TRANSAKSI  ≼*\n\n`;

		            responseTextFailed += `_⭔ *Status* :  *${response.data.status}*_\n`;
                responseTextFailed += `_⭔ *Produk* : ${response.data.buyer_sku_code.toUpperCase()}_\n`;
                responseTextFailed += `_⭔ *Nomor Tujuan* : ${response.data.customer_no}_\n`
                responseTextFailed += `_⭔ *Ref ID* : ${response.data.ref_id}_\n`;
                responseTextFailed += `_⭔ *Waktu* : ${date} | ${time}_\n`
		            responseTextFailed += `_⭔ *Pesan* : ${response.data.message}_\n`
                responseTextFailed +=`\n\n*Transaksi anda _${response.data.status}_*\n`
                responseTextFailed+=`*Terima Kasih*`
                
                x.reply(responseTextFailed)
		            return responseTextFailed

		}
            	responseText += `_⭔ *Status* :  *${response.data.status}*_\n`;
                responseText += `_⭔ *Produk* : ${product.product_name}_\n`;
                responseText += `_⭔ *Nomor Tujuan* : ${response.data.customer_no}_\n`
                responseText += `_⭔ *Ref ID* : ${response.data.ref_id}_\n`;
                responseText += `_⭔ *Waktu* : ${date} | ${time}_\n`
		            responseText += `_⭔ *Pesan* : ${response.data.message}_\n`
                if (response.data.rc=='03') {
                  responseText+=`\n\n*Transaksi anda sedang _Pending_ mohon ditungu...*`
                }else{
                  responseText+=`\n\n*Transaksi anda _${response.data.status}_*\n`
                  responseText+=`*Terima Kasih*`
                }
                x.reply(responseText)
                    //console.log(response.data)
                    //console.log(response.data)
                    console.log('ini pending lagi'+response.data.status)
		            if (response.data.rc=='03') {
                    await delay(3000)
                    let cek = await checkTransaction(productCode,number,ref_id)
                    do {
                        await delay(3000)
                        cek = await checkTransaction(productCode,number,ref_id)
                    } while (cek.data.rc=='03');
                    let responseTextCheck = `*≽  DETAIL TRANSAKSI  ≼*\n\n`;
                        responseTextCheck += `_⭔ *Status* :  *${cek.data.status}*_\n`;
                        responseTextCheck += `_⭔ *Produk* : ${product.product_name}_\n`;
                        responseTextCheck += `_⭔ *Nomor Tujuan* : ${cek.data.customer_no}_\n`
                        responseTextCheck += `_⭔ *Ref ID* : ${cek.data.ref_id}_\n`;
			                  responseTextCheck += `_⭔ *Pesan* : ${cek.data.message}_\n`
                        responseTextCheck += `_⭔ *Waktu* : ${date} | ${time}_\n`
			                  responseTextCheck += `_⭔ *SN* 	: ${cek.data.sn}_\n`
                        responseTextCheck+=`\n\n*Transaksi anda _${cek.data.status}_*\n`
                        responseTextCheck+=`*Terima Kasih*`
                        x.reply(responseTextCheck)
                    console.log('ini setelah dicek'+cek.data.rc)
		}
                }catch(err){
                  console.log(err)
		              console.log(err)
                  //x.reply(err)
                }
                break
              }

        case 'harga':
        case 'detail':
          {
            if (!parameter) return x.reply(`Format anda salah : .perintah kodeproduk`)
            if (!g.is.owner) return x.reply(`Fitur ini hanya dapat diakses oleh Owner`)
            try {
              const productCode = parameter.split(' ')[0]
              const priceList = await getPriceList(conf.username, 'pricelist');
              const product = searchPriceByCode(priceList, productCode);
              if (product) {
                const formattedPrice = `Rp. ${product.price.toLocaleString("id-ID", {
                  minimumFractionDigits: 2,
                })}`;
                let responseText = '*DETAIL PRODUK DIGIFLAZZ*\n\n';
                responseText+= `Nama\t\t\t: ${product.product_name}\n`
                responseText += `Product Code\t\t: ${product.buyer_sku_code}\n`;
                responseText += `Kategori\t\t\t: ${product.category}\n`;
                responseText += `Brand\t\t\t: ${product.brand}\n`;
                responseText += `Harga\t\t\t: ${formattedPrice}\n`;
                responseText += `Seller\t\t\t: ${product.seller_name}\n`;
                responseText += `Status Produk Seller\t: ${product.seller_product_status}`;
                responseText += `\nCut Off\t\t\t: ${product.start_cut_off}-${product.end_cut_off}\n`;
                responseText += `Deskribsi\t\t\t: ${product.desc}`
                x.reply(responseText)
              } else {
                x.reply(`Produk dengan kode ${productCode} tidak ditemukan.`)
              }
            } catch (error) {
              console.error(error);
                x.reply('Terjadi kesalahan saat mencari harga produk.')
            }
            break
          }

      //APIGAMES
          
      case 'cekakun':
      case 'akunmlbb':
        {
          if (!parameter) return x.reply(`Format anda salah : .perintah ID+SERVER`)
          if (!g.is.owner) return x.reply(`Fitur ini hanya dapat diakses oleh Owner`)
          const gameCode = parameter.split(' ')[0];
          const user_id = parameter.split(' ')[1];
          const signature = createSignatureAPI(conf.merchantId,conf.secretKey)
          const apiUrl = `${conf.endpointAPIgames}/${conf.merchantId}/cek-username/${gameCode}?user_id=${user_id}&signature=${signature}`;
          

          let response = await cekAkun(gameCode,user_id);
          response += `\n\n*⚡${conf.BotName}⚡*`
          console.log(response.data);
          x.reply(response)
          break
        }
      case 'infoakun':
        {
          const response = await getInfoAkun()
          const formattedPrice = `Rp. ${response.saldo.toLocaleString(
                            "id-ID",
                            { minimumFractionDigits: 2 }
                          )}`
          let responseText =`*≽  DETAIL AKUN APIGAMES  ≼*\n\n`
              responseText += `⭔ *NAMA*     : ${response.nama}\n`
              responseText += `⭔ *No HP*    : ${response.hp}\n`
              responseText += `⭔ *E-Mail*   : ${response.email}\n`
              responseText += `⭔ *Saldo*    : ${formattedPrice}\n`
              
          x.reply(responseText)

          console.log(response)

          break
        }
        case 'depoapi':
          {
            const nominal = parameter.split(' ')[0]
            try {
              let formattedPrice = ""; // Declare and assign a default value

              const response = await depositRequest(nominal);
              if (response.data && response.data.total_transfer !== undefined && response.data.total_transfer !== null) {
                formattedPrice = `Rp. ${response.data.total_transfer.toLocaleString("id-ID", { minimumFractionDigits: 2 })}`;
                console.log(formattedPrice);
              } else {
                console.error("Invalid total transfer value.");
              }

              let responseText = `*≽  DETAIL DEPOSIT APIGAMES  ≼*\n\n`;
              responseText += `⭔ *ID DEPOSIT*     : ${response.data.id}\n`;
              responseText += `⭔ *ADMIN*    : ${response.data.admin}\n`;
              responseText += `⭔ *Kode Unik*   : ${response.data.kode_unik}\n`;
              responseText += `⭔ *Nominal*    : ${formattedPrice}\n`; // Use the updated value of formattedPrice
              responseText += `⭔ *Rekening*    : ${response.data.rekening}\n`;
              responseText += `⭔ *Expired*    : ${response.data.expired}\n`;

              if (response.data.status !== 1) {
                const responseTextFailed = `Permintaan deposit gagal: *${response.data.error_msg}*`;
                x.reply(responseTextFailed);
              }
              if (response.data.status === 1) {
                x.reply(responseText);
              console.log(response);
              }
            } catch (error) {
              console.log(error)
            }
            
            break
          }
        case 'ceksmileone':
          {
            try {
              const response = await cekKoneksiSmileOne()
            
              let responseText =`*≽  DETAIL KONEKSI SMILEONE  ≼*`
                  responseText +=`\n\n⭔ *NAMA*     : ${response.customer_name}`
                  responseText +=`\n⭔ *Login Status*     : ${response.loginStatus}`
              console.log(response)
              x.reply(responseText)
            } catch (error) {
              console.error(error)
              x.reply(`${error.message}\n\n----------------\n*Silahkan diperiksa terlebih dahulu koneksi di website apigames.id*`)
            }
            break
          }
        case 'cekhiggs':
          {
            try {
              const response = await cekKoneksiHiggs()
              let responseText =`*≽  DETAIL KONEKSI HIGGS  ≼*`
                  responseText +=`\n\n⭔ *Status*     : _${response.message}_`
                  responseText +=`\n⭔ *1M*    : ${response.coin_1m}`
                  responseText +=`\n⭔ *60M*   : ${response.coin_60m}`
                  responseText +=`\n⭔ *200M*  : ${response.coin_200m}`
                  responseText +=`\n⭔ *400M*  : ${response.coin_400m}`
                  responseText +=`\n⭔ *1B*    : ${response.coin_1b}`
                  responseText +=`\n⭔ *2B*    : ${response.coin_2b}`
                  x.reply(responseText)
            } catch (error) {
              console.error(error)
              x.reply(`${error.message}\n\n----------------\n*Silahkan diperiksa terlebih dahulu koneksi di website apigames.id*`)
            }
            break
          }
        case 'cekkiosgamer':
          {
            try {
              const response = await cekKoneksiKiosgamer()
            
              let responseText =`*≽  DETAIL KONEKSI KIOSGAMER  ≼*`
                  responseText +=`\n\n⭔ *Garena ID*     : ${response.garena_id}`
                  responseText +=`\n⭔ *Username*     : ${response.username}`
                  responseText +=`\n⭔ *Shell Balance*    : ${response.shell_balance}`
              console.log(response)
              x.reply(responseText)
            } catch (error) {
              console.error(error)
              x.reply(`${error.message}\n\n----------------\n*Silahkan diperiksa terlebih dahulu koneksi di website apigames.id*`)
            }
            break
          }
          case 'cekuniid':
          {
            try {
              const response = await cekKoneksiUnipinID()
            
              let responseText =`*≽  DETAIL KONEKSI UNIPIN ID  ≼*`
                  responseText +=`\n\n⭔ *NAMA*     : ${response.name}`
                  responseText +=`\n⭔ *E-mail*     : ${response.email}`
                  responseText +=`\n⭔ *Uni Point*    : ${response.up_balance}`
                  responseText +=`\n⭔ *Uni Credit*    : ${response.uc_balance}`
              console.log(response)
              x.reply(responseText)
            } catch (error) {
              console.error(error)
              x.reply(`${error.message}\n\n----------------\n*Silahkan diperiksa terlebih dahulu koneksi di website apigames.id*`)
            }
            break
          }
          case 'cekunimy':
          {
            try {
              const response = await cekKoneksiUnipinMY()
            
              let responseText =`*≽  DETAIL KONEKSI UNIPIN MY  ≼*`
                  responseText +=`\n\n⭔ *NAMA*     : ${response.name}`
                  responseText +=`\n⭔ *E-mail*     : ${response.email}`
                  responseText +=`\n⭔ *Uni Point*    : ${response.up_balance}`
                  responseText +=`\n⭔ *Uni Credit*    : ${response.uc_balance}`
              console.log(response)
              x.reply(responseText)
            } catch (error) {
              console.error(error)
              x.reply(`${error.message}\n\n----------------\n*Silahkan diperiksa terlebih dahulu koneksi di website apigames.id*`)
            }
            break
          }
          case 'cekunibr':
          {
            try {
              const response = await cekKoneksiUnipinBrazil()
            
              let responseText =`*≽  DETAIL KONEKSI UNIPIN BR  ≼*`
                  responseText +=`\n\n⭔ *NAMA*     : ${response.name}`
                  responseText +=`\n⭔ *E-mail*     : ${response.email}`
                  responseText +=`\n⭔ *Uni Point*    : ${response.up_balance}`
                  responseText +=`\n⭔ *Uni Credit*    : ${response.uc_balance}`
              console.log(response)
              x.reply(responseText)
            } catch (error) {
              console.error(error)
              x.reply(`${error.message}\n\n----------------\n*Silahkan diperiksa terlebih dahulu koneksi di website apigames.id*`)
            }
            break
          }
          case 'cekunibr':
          {
            try {
              const response = await cekKoneksiUnipinPH()
            
              let responseText =`*≽  DETAIL KONEKSI UNIPIN PH  ≼*`
                  responseText +=`\n\n⭔ *NAMA*     : ${response.name}`
                  responseText +=`\n⭔ *E-mail*     : ${response.email}`
                  responseText +=`\n⭔ *Uni Point*    : ${response.up_balance}`
                  responseText +=`\n⭔ *Uni Credit*    : ${response.uc_balance}`
              console.log(response)
              x.reply(responseText)
            } catch (error) {
              console.error(error)
              x.reply(`${error.message}\n\n----------------\n*Silahkan diperiksa terlebih dahulu koneksi di website apigames.id*`)
            }
            break
          }
          case 'api': 
          {
            const refId = generateRefId(10);
            const produk = parameter.split(' ')[0];
            const tujuan = parameter.split(' ')[1];
            console.log(parameter.split(' ').length)
            let serverId
            if (parameter.split(' ').length>2) {
              serverId = parameter.split(' ')[2];
            }else{
              serverId =""
            }
              beliProduk(refId, produk, tujuan, serverId)
              .then(async hasil => {
                console.log('Hasil Pembelian Produk:');
                console.log(`trx id : ${hasil.trx_id}`)
                let responseText = `*≽  DETAIL TRANSAKSI ≼*\n\n`
                    responseText += `_*⭔TRX ID : ${hasil.trx_id}*_\n`
                    responseText += `_*⭔REF ID : ${hasil.ref_id}*_\n`
                    responseText += `_*⭔Produk : ${hasil.product_detail.name}*_\n`
                    responseText += `_*⭔Tujuan : ${hasil.destination}*_\n`
                    responseText += `_*⭔Pesan  : ${hasil.message}*_\n`
                    responseText += `_*⭔Status : ${hasil.status}*_\n`
                x.reply(responseText)
                if (hasil.status == 'Pending') {
                  await delay(3000)
                  let cek = await cekStatusTransaksi(refId)
                  console.log(cek)
                  do {
                    await delay(3000)
                    cek = await cekStatusTransaksi(refId)
                  } while (cek.status == 'Pending' || cek.status == 'Proses');
                  let responseTextChecked = `*≽  DETAIL TRANSAKSI ≼*\n\n`
                    responseTextChecked += `_*⭔TRX ID : ${cek.trx_id}*_\n`
                    responseTextChecked += `_*⭔REF ID : ${cek.ref_id}*_\n`
                    responseTextChecked += `_*⭔Produk : ${cek.product_detail.name}*_\n`
                    responseTextChecked += `_*⭔Tujuan : ${cek.destination}*_\n`
                    responseTextChecked += `_*⭔Pesan  : ${cek.message}*_\n`
                    responseTextChecked += `_*⭔Status : ${cek.status}*_\n`
                    x.reply(responseTextChecked)
                }
                console.log(hasil);
              })
              .catch(error => {
                console.log('Error:', error.message);
              });
            break
          }
      
      case 'status':
      {
        const refId = parameter.split(' ')[0]
          cekStatusTransaksi(refId)
            .then(status => {
              console.log('Status Transaksi:');
              console.log(status);
            })
            .catch(error => {
              console.log('Error:', error.message);
            });
        break
      }
      //sticker	
      case `s`:
      case `sticker`:
      case `stiker`:
        {

          if (!g.is.img && !g.is.gif && !g.is.video) return x.reply("Format Salah! \nKirim gambar atau gif dengan caption *.sticker*")
          if (g.func.parameter(body) == 'nobg') {
            if (!g.is.owner && !g.is.isPrem) return x.reply("Fitur khusus user premium!")
            const path = await x.downloadMedia();
            let teks = "Your Sticker"
            //nobg

            const outputFile = `img(${g.message.sender}).png`;

            const result = await removeBackgroundFromImageFile({
              path: path,
              apiKey: conf.apikeyRemoveBg,
              size: "regular",
              type: "auto",
              scale: "100%",
              outputFile
            })
            fs.unlinkSync(path)
            x.imagetosticker(outputFile)
            return
          }
          const path = await x.downloadMedia();
          let teks = "Your Sticker"
          if (g.func.parameter(body)) {
            teks = g.func.parameter(body)
          }

          x.imagetosticker(path, teks)

          break;
        }

      case `stikerxxx228`:
        {

          if (!g.is.img && !g.is.gif && !g.is.video) return x.reply("Format Salah! \nKirim gambar atau gif dengan g.func.parameter(body)ion *.sticker*")
          const path = await x.downloadMedia();
          let teks = "Your Sticker"
          if (g.func.parameter(body)) {
            teks = g.func.parameter(body)
          }

          x.imagetosticker2(path, teks)

          break;
        }

      //Tiktok Downloader
      //Tiktok Downloader
      case "tiktok":
      case "tiktokdl":
        {
          if (!parameter) return x.reply("Format Salah! \nContoh: .tiktok https://www.tiktok.com/@kyusako/video/7064913329122250011")
          try {
            const anu = await ttdl(parameter)
            console.log(anu)
            if (anu.nowm) {
              await x.replyVideo(anu.nowm)
            } else {
              await x.reply("Tidak ditemukan!")
            }
          } catch (e) {
            x.reply("Video tidak ditemukan atau link tidak valid!")
          }
          break
        }
    }
  } else {

    if (g.is.body == 'assalamualaikum' || g.is.body == 'Assalamualaikum') {
      x.reply("Wa'alaikumussalam")
    } else if (g.is.body == 'p' || g.is.body == 'P' || g.is.body == 'bot' || g.is.body == 'Bot') {
      x.reply('👋👋')
    } 
//else if (!g.is.group && !g.is.cmd) {
  //    x.reply('Ketik *.help* Untuk Membuka Menu!')
    //}

    const bd = g.is.body.toLowerCase()
    const z = bd.search(/\bkontol\b/)
    const z1 = bd.search(/\bmemek\b/)
    const z2 = bd.search(/\basu\b/)
    const z3 = bd.search(/\bkntl\b/)
    const z4 = bd.search(/\bbgsd\b/)
    const x3 = bd.search(conf.bot.shortName.toLowerCase())
    const x2 = bd.search(/\bohayo/)
    const x1 = bd.search(/\bbot\b/)


    if (!g.is.isbanned && (z !== -1 || z1 !== -1 || z2 !== -1 || z3 !== -1 || z4 !== -1) && !g.is.group) {
      x.reply("⚠️ Chat telah dilaporkan ke Owner!")
      const report = "*Kata Kasar terdeteksi!*\nJID: " + g.message.sender + "\nChat: _" + body + "_"
      x.report(report)
    } else if (!g.is.isbanned && (z !== -1 || z1 !== -1 || z2 !== -1 || z3 !== -1 || z4 !== -1) && (x2 !== -1 || x1 !== -1)) {
      x.reply("⚠️ Chat telah dilaporkan ke Owner!")
      const report = "*Kata Kasar terdeteksi!*\nJID: " + g.message.sender + "\nGrup ID: " + g.message.from + "\nChat: _" + body + "_"

      x.report(report)
    } else if (!g.is.isbanned && (z !== -1 || z1 !== -1 || z2 !== -1 || z3 !== -1 || z4 !== -1)) {
      x.replySticker('./Angry!.webp')
    } else if (!g.is.isbanned && (x2 !== -1 || x3 !== -1)) {
      x.replySticker('./^_^.webp')
    } else if (bd.search(/\baksal\b/) !== -1) {
      x.replySticker('./Angry!2.webp')
    }
  }
}
