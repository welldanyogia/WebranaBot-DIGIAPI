const fetch = require('node-fetch')
const axios = require('axios')
const cfonts = require('cfonts')
const spin = require('spinnies')
const crypto = require('crypto')
const imageToBase64 = require('image-to-base64')
const conf = require('../config/configFile').info

// const ytmp4k = new Set()

// const isYTprocess = (from) => {
//     return !!ytmp4k.has(from)
// }
// const addYTprocess= (from) => {
//     ytmp4k.add(from)
// }
// const delYTprocess= (from) => {
//         return ytmp4k.delete(from)
// }


//spam Non premium
const usedCommandRecently = new Set()

const isSpam = (from) => {
    return !!usedCommandRecently.has(from)
}
const addSpam = (from) => {
    usedCommandRecently.add(from)
    setTimeout(() => {
        return usedCommandRecently.delete(from)
    }, 2000) // 2s detik Delay
}
  
const h2k = (number) => {
    var SI_POSTFIXES = ["", " K", " M", " G", " T", " P", " E"]
    var tier = Math.log10(Math.abs(number)) / 3 | 0
    if(tier == 0) return number
    var postfix = SI_POSTFIXES[tier]
    var scale = Math.pow(10, tier * 3)
    var scaled = number / scale
    var formatted = scaled.toFixed(1) + ''
    if (/\.0$/.test(formatted))
      formatted = formatted.substr(0, formatted.length - 2)
    return formatted + postfix
}

const getBuffer = async (url, options) => {
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (e) {
		console.log(`Error : ${e}`)
	}
}

const Base64 = async (url) => {
	imageToBase64(url) // Path to the image
    .then(
        (response) => {
            console.log('base64 Convert'); // "cGF0aC90by9maWxlLmpwZw=="
            return response
        }
    )
    .catch(
        (error) => {
            console.log(error); // Logs an error if there was one
        }
    )
}

const randomBytes = (length) => {
    return Crypto.randomBytes(length)
}

const generateMessageID = () => {
    return randomBytes(10).toString('hex').toUpperCase()
}

const getGroupAdmins = (participants) => {
	admins = []
	for (let i of participants) {
		i.isAdmin ? admins.push(i.jid) : ''
	}
	return admins
}

const getRandom = (ext) => {
	return `${Math.floor(Math.random() * 10000)}${ext}`
}

const spinner = { 
  "interval": 120,
  "frames": [
    "🕐",
    "🕑",
    "🕒",
    "🕓",
    "🕔",
    "🕕",
    "🕖",
    "🕗",
    "🕘",
    "🕙",
    "🕚",
    "🕛"
  ]}

        let globalSpinner;


        const getGlobalSpinner = (disableSpins = false) => {
        if(!globalSpinner) globalSpinner = new spin({ color: 'blue', succeedColor: 'green', spinner, disableSpins});
        return globalSpinner;
        }

        spins = getGlobalSpinner(false)

        const start = (id, text) => {
	       spins.add(id, {text: text})
		/*setTimeout(() => {
			spins.succeed('load-spin', {text: 'Suksess'})
		}, Number(wait) * 1000)*/
	       }
        const info = (id, text) => {
	       spins.update(id, {text: text})
        }
        const success = (id, text) => {
	       spins.succeed(id, {text: text})

	       }

        const close = (id, text) => {
	       spins.fail(id, {text: text})
        }
 
            const banner = cfonts.render(('zeevalya'), {
                font: 'block',
                color: 'system',
                align: 'left',
                gradient: ["red","white"],
                lineHeight: 2
                });

    
    //DIGIFLAZZ
        
    function createSignature(username, apiKey, action) {
        const hash = crypto.createHash('md5');
        hash.update(username + apiKey + action);
        return hash.digest('hex');
    }
    function generateRefId(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let refId = 'REFID-';
        for (let i = 0; i < length; i++) {
          refId += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return refId;
      }
      
    async function orderDigi(buyer_sku_code, customer_no, ref_id){
        const endpoint = `${conf.endpointDigi}/transaction`;
        const signature = createSignature(conf.username, conf.apiKey, ref_id);
        const priceList = await getPriceList(conf.username, 'pricelist');
        const product = searchPriceByCode(priceList, buyer_sku_code);
        const data = {
          username: conf.username,
          buyer_sku_code,
          customer_no,
          ref_id,
          sign: signature,
        };
      
        try {
          let response = await axios.post(endpoint, data);
            return response.data
        } catch (error) {
          console.error('Error:', error.response.data);
	  return error.response.data
          throw new Error('Failed to order top-up');
        }
    
      }
      async function checkTransaction(buyer_sku_code, customer_no, ref_id){
        const endpoint = `${conf.endpointDigi}/transaction`
        const signature = createSignature(conf.username, conf.apiKey, ref_id);
        const data = {
          username: conf.username,
          buyer_sku_code,
          customer_no,
          ref_id,
          sign: signature,
        };
      
        try {
          let responseCheck = await axios.post(endpoint, data);
            return responseCheck.data
        } catch (error) {
          console.error('Error:', error.responseCheck.data);
          throw new Error('Failed to order top-up');
        }
    
      }
      async function getPriceList(username,cmd) {
        const endpoint = `${conf.endpointDigi}/price-list`;
        const signature = createSignature(username, conf.apiKey, 'pricelist');
      
        const data = {
          cmd,
          username:conf.username,
          sign: signature,
        };
      
        try {
          const response = await axios.post(endpoint, data);
          return response.data;
        } catch (error) {
          // console.error('Error:', error.response.data);
          throw new Error('Failed to get price list');
        }
      }
      function searchPriceByCode(priceList, code) {
        return priceList.data.find((item) => item.buyer_sku_code.toUpperCase() === code.toUpperCase());
      }
      
	//APIGAMES
      function createSignatureAPI(merchantId, secretKey) {
        const hash = crypto.createHash('md5');
        hash.update(merchantId + secretKey );
        return hash.digest('hex');
      }
      async function cekAkun(gameCode,userId){
        if (gameCode=='ml') {
          gameCode = 'mobilelegend'
        }
        if (gameCode=='ff') {
          gameCode = 'freefire'
        }
        if (gameCode=='hd') {
          gameCode = 'higgs'
        }
        const signature = createSignatureAPI(conf.merchantId,conf.secretKey)
        const apiUrl = `${conf.endpointAPIgames}/${conf.merchantId}/cek-username/${gameCode}?user_id=${userId}&signature=${signature}`;
      
        try {
          const response = await axios.get(apiUrl);
          const data = response.data;
      
          if (data.status === 1 && data.rc === 0) {
            const isValid = data.data.is_valid;
            const username = data.data.username;
      
            let responseText = "";
            if (isValid) {
              responseText = `*≽  DETAIL AKUN  ≼*\n\n*› Nickname* : ${username}\n*› Id Akun* : ${userId}`;
            } else {
              responseText = "Akun tidak ditemukan.";
            }
            return responseText;
          } else {
            throw new Error("Gagal melakukan pengecekan akun.");
          }
        } catch (error) {
          console.error(error);
          throw new Error("Terjadi kesalahan saat melakukan pengecekan akun.");
        }
      }
      async function getInfoAkun() {
        const signature = createSignatureAPI(conf.merchantId,conf.secretKey)
        const url = `https://v1.apigames.id/merchant/${conf.merchantId}?signature=${signature}`;
      
        try {
          const response = await axios.get(url);
          const responseData = response.data;
      
          if (responseData.status === 1 && responseData.rc === 200) {
            const data = responseData.data;
            const infoAkun = {
              id: data.id,
              merchant_id: data.merchant_id,
              email: data.email,
              hp: data.hp,
              nama: data.nama,
              saldo: data.saldo
            };
            return infoAkun;
          } else {
            throw new Error(responseData.message);
          }
        } catch (error) {
          throw new Error(`Error: ${error.message}`);
        }
      }
      async function cekKoneksiSmileOne() {
        const engine = 'smileone';
        const signature = createSignatureAPI(conf.merchantId, conf.secretKey)
        const url = `https://v1.apigames.id/merchant/${conf.merchantId}/cek-koneksi?engine=${engine}&signature=${signature}`;
      
        try {
          const response = await axios.get(url);
          const responseData = response.data;
      
          if (responseData.status === 1 && responseData.rc === 50) {
            const data = responseData.data;
            const koneksiSmileOne = {
              loginStatus: data.data.loginStatus,
              favorite: data.data.favorite,
              favorite_product_count: data.data.favorite_product_count,
              customer_name: data.data.customer_name,
              is_valid: data.is_valid
            };
            return koneksiSmileOne;
          } else {
            throw new Error(responseData.error_msg);
          }
        } catch (error) {
          throw new Error(`Error: ${error.message}`);
        }
      }
      async function cekKoneksiKiosgamer() {
        const engine = 'kiosgamer';
        const signature = createSignatureAPI(conf.merchantId, conf.secretKey)
        const url = `https://v1.apigames.id/merchant/${conf.merchantId}/cek-koneksi?engine=${engine}&signature=${signature}`;
      
        try {
          const response = await axios.get(url);
          const responseData = response.data;
      
          if (responseData.status === 1 && responseData.rc === 200) {
            const data = responseData.data;
            const koneksiKiosgamer = {
              garena_id: data.data.garena_id,
              username: data.data.username,
              uuid: data.data.uuid,
              topup_to_friend: data.data.topup_to_friend,
              shell_balance: data.data.shell_balance,
              icon: data.data.icon,
              expiry_time: data.data.expiry_time,
              expiry_date: data.data.expiry_date,
              is_valid: data.is_valid
            };
            return koneksiKiosgamer;
          } else {
            throw new Error(responseData.error_msg);
          }
        } catch (error) {
          throw new Error(`Error: ${error.message}`);
        }
      }
      async function cekKoneksiUnipinBrazil(merchantId, secretKey) {
        const engine = 'unipinbr';
        const signature = createSignatureAPI(conf.merchantId, conf.secretKey)
        const url = `https://v1.apigames.id/merchant/${merchantId}/cek-koneksi?engine=${engine}&signature=${signature}`;
      
        try {
          const response = await axios.get(url);
          const responseData = response.data;
      
          if (responseData.status === 1 && responseData.rc === 200) {
            const data = responseData.data;
            const koneksiUnipinBrazil = {
              name: data[0].name,
              email: data[0].email,
              up_balance: data[0].up_balance,
              uc_balance: data[0].uc_balance
            };
            return koneksiUnipinBrazil;
          } else {
            throw new Error(responseData.error_msg);
          }
        } catch (error) {
          throw new Error(`Error: ${error.message}`);
        }
      }
      async function beliProduk(refId,produk, tujuan, serverId) {
        try {
          const signature = crypto
            .createHash('md5')
            .update(`${conf.merchantId}:${conf.secretKey}:${refId}`)
            .digest('hex');
      
          const url = 'https://v1.apigames.id/v2/transaksi';
          const payload = {
            ref_id: refId,
            merchant_id: conf.merchantId,
            produk: produk,
            tujuan: tujuan,
            server_id: serverId,
            signature: signature
          };
      
          const response = await axios.post(url, payload);
          const responseData = response.data;
      
          if (responseData.status === 1) {
            const hasilPembelian = responseData.data;
            return hasilPembelian;
          } else {
            throw new Error(responseData.error_msg);
          }
        } catch (error) {
          throw new Error(`Error: ${error.message}`);
        }
      }
      async function orderHdi(refId,produk, tujuan) {
        try {
          const signature = crypto
            .createHash('md5')
            .update(`${conf.merchantId}:${conf.secretKey}:${refId}`)
            .digest('hex');
      
          const url = 'https://v1.apigames.id/v2/transaksi';
          const payload = {
            ref_id: refId,
            merchant_id: conf.merchantId,
            produk: produk,
            tujuan: tujuan,
            signature: signature
          };
      
          const response = await axios.post(url, payload);
          const responseData = response.data;
      
          if (responseData.status === 1) {
            const hasilPembelian = responseData.data;
            return hasilPembelian;
          } else {
            throw new Error(responseData.error_msg);
          }
        } catch (error) {
          throw new Error(`Error: ${error.message}`);
        }
      }

      async function cekStatusTransaksi(refId) {
        try {
          const signature = crypto
            .createHash('md5')
            .update(`${conf.merchantId}:${conf.secretKey}:${refId}`)
            .digest('hex');
      
          const url = 'https://v1.apigames.id/v2/transaksi/status';
          const payload = {
            merchant_id: conf.merchantId,
            ref_id: refId,
            signature: signature
          };
      
          const response = await axios.post(url, payload);
          const responseData = response.data;
      
          if (responseData.status === 1) {
            const statusTransaksi = responseData.data;
            return statusTransaksi;
          } else {
            throw new Error(responseData.error_msg);
          }
        } catch (error) {
          throw new Error(`Error: ${error.message}`);
        }
        
      }
	
module.exports = {
  Spam: {
        isSpam,
        addSpam,
    }, getBuffer, h2k, Base64, generateMessageID, getGroupAdmins, getRandom, start, info, success, banner, 
    close,createSignature,checkTransaction,generateRefId,orderDigi,searchPriceByCode,getPriceList,cekAkun,
    createSignatureAPI,placeOrder}