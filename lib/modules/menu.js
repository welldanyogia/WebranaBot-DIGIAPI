const {readFileSync} = require("node:fs");
const conf = require('../../config/configFile').info
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
    try {
        const data = readFileSync('./lib/modules/list.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading list file:", err);
        return {};
    }
}

function generateListMenu() {
    const list = getList();
    let keys = Object.keys(list);
    let listMenu = keys.map((key, index) => `➸ .${key}${index < keys.length - 1 ? '\n' : ''}`).join('');
    return listMenu;
}

const dynamicListMenu = generateListMenu();

exports.daftarTeks = {
    menuBot(name) {
        let teks = `Hai ${name}, Ada yang bisa Saya Bantu?
Prefik: ( . )
        
*LIST MENU ${conf.BotName}* : 

Menu :                     
${dynamicListMenu}
➸ .Pembayaran/PAY

Menu Sticker:                     
➸ .sticker
➸ .sticker nobg
        
Menu Grup:
➸ .hidetag
➸ .cekmlbb
        
Menu Downloader
➸ .tiktok

Random Teks:
➸ .quotes

Other Menu:
➸ .math

Running Time: `+secondtime(process.uptime()) 
        return teks
    },
    menuOwner(name) {
        let teks = `Hai ${name}, Ada yang bisa Saya Bantu?
Prefik: ( . )
        
*LIST MENU ${conf.BotName}* : 

List Menu Group :
${dynamicListMenu}
➸ .Pembayaran/PAY
     
Menu Khusus Owner:
➸ .cekdeposit
➸ .order
➸ .harga
➸ .infoakun
➸ .api

Menu Cek Koneksi:
➸ .cekhiggs
➸ .cekkiosgamer
➸ .ceksmileone
➸ .cekuniid
➸ .cekunimy
➸ .cekunibr
➸ .cekuniph
   
Menu Sticker:                     
➸ .sticker
➸ .sticker nobg
        
Menu Grup:
➸ .hidetag
➸ .addlist
➸ .deletelist
➸ .updatelist
➸ .cekmlbb
        
Menu Downloader
➸ .tiktok

Random Teks:
➸ .quotes

Other Menu:
➸ .math

Running Time: `+secondtime(process.uptime()) 
        return teks
    },
    mlbb(name) {
        let teks = `Hai ${name}, Ada yang bisa Saya Bantu?
Prefik: ( . )
        
*LIST Harga MLBB VIA ID & Server ${conf.BotName}* : 

➸ Weekly Diamond     Rp. 25.500
  Pass

➸ 86DM     Rp. 19.900
➸ 172DM    Rp. 39.900
➸ 257DM    Rp. 59.500
➸ 344DM    Rp. 79.500
➸ 429DM    Rp. 99.500
➸ 514DM    Rp. 119.000
➸ 600DM    Rp. 139.000
➸ 706DM    Rp. 159.000
➸ 878DM    Rp. 178.500
➸ 963DM    Rp. 198.500
➸ 1050DM    Rp. 238.500
➸ 1220DM    Rp. 278.000
➸ 1412DM    Rp. 318.000
➸ 2195DM    Rp. 478.000
➸ 2901DM    Rp. 638.000
➸ 3688DM    Rp. 795.000
➸ 5532DM    Rp. 1.200.000
➸ 9288DM    Rp. 1.985.500


Running Time: `+secondtime(process.uptime()) 
        return teks
    },
    fm(name) {
        let teks = `Hai ${name}, Ada yang bisa Saya Bantu?
Prefik: ( . )
        
*LIST Harga FIFA MOBILE VIA LOGIN ${conf.BotName}* : 
 
➸ 150 Points     Rp. 14.000
➸ 500 Points     Rp. 35.000
➸ 1050 Points    Rp. 60.000
➸ 2200 Points    Rp. 120.000
➸ 5750 Points    Rp. 285.000
➸ 12000 Points    Rp. 570.000

Running Time: `+secondtime(process.uptime()) 
        return teks
    },
    bayar(name) {
        let teks = `Hai ${name},
        
⚡WEBRANA STORE⚡

*PEMBAYARAN VIA E-WALLET*
DANA     | 085648622105
GOPAY    | 085648622105
OVO      | 085648622105
SHOPEPAY | 085648622105
QRIS     

*PEMBAYARAN VIA BANK*
BCA  | 1132118790
BRI  | 226701007227508
MANDIRI  | 1440025728202
        
⚠ PERHATIAN ⚠
•Dari Bank isi ke Ovo/Gopay +1.000
•Semua metode pembayaran Atas Nama *Welldan Yogia Hwan Egiyaksa* & WEBRANA`

        return teks
    },
    ress(name) {
        let teks = `Hai ${name},

Hubungi Admin Untuk Info mengenai reseller
Running Time: `+secondtime(process.uptime())
        return teks
    }
    
}