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

exports.daftarTeks = {
    menuBot(name) {
        let teks = `Hai ${name}, Ada yang bisa Saya Bantu?
Prefik: ( . )
        
*LIST MENU 𝕎𝔼𝔹ℝ𝔸ℕ𝔸 𝔹𝕆𝕋* : 
     
Menu DigiFlazz:
➸ .cekdeposit
➸ .order
➸ .harga
   
Menu Sticker:                     
➸ .sticker
➸ .sticker nobg
        
Menu Grup:
➸ .hidetag
➸ .mute on
➸ .mute off
➸ .cekmlbb
        
Menu Downloader
➸ .tiktok

Random Teks:
➸ .quotes

Other Menu:
➸ .math

Running Time: `+secondtime(process.uptime()) 
        return teks
    }

}