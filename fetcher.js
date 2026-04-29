import RSSParser from 'rss-parser'; // require yerine import
const parser = new RSSParser();

// Fonksiyonun adını 'fetchNews' olarak güncelliyoruz ki index.js onu tanısın
// Başına 'export' ekleyerek dış dünyaya açıyoruz
export async function fetchNews() {
    console.log("🕵️ MagAI rotayı Hacker News mahallesine kırdı...");
    
    const url = 'https://news.ycombinator.com/rss';
    
    try {
        const feed = await parser.parseURL(url);
        
        // Veriyi sadece konsola yazmıyoruz, index.js'e bir dizi (array) olarak döndürüyoruz
        // .map kullanarak sadece ihtiyacımız olan başlık ve linki paketliyoruz
        const newsItems = feed.items.slice(0, 5).map(item => ({
            title: item.title,
            link: item.link
        }));

        console.log(`✅ Zafer! ${newsItems.length} taze haber hammadde olarak alındı.`);
        
        return newsItems; // Hammaddeyi merkeze gönderiyoruz

    } catch (error) {
        console.error("❌ Hacker News mahallesinde sorun çıktı:", error.message);
        return []; // Hata olursa boş dizi dön ki sistem çökmesin
    }
}