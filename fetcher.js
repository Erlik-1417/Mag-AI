const RSSParser = require('rss-parser');
const parser = new RSSParser();

async function ajanSokagaIndi() {
    console.log("🕵️ MagAI rotayı Hacker News mahallesine kırdı...");
    
    // Hacker News her zaman daha misafirperverdir
    const url = 'https://news.ycombinator.com/rss';
    
    try {
        const feed = await parser.parseURL(url);
        
        console.log("\n--- 🔥 HACKER NEWS RADARINA TAKILANLAR ---");
        
        feed.items.slice(0, 3).forEach((item, index) => {
            console.log(`\n[HABER ${index + 1}]`);
            console.log(`📌 BAŞLIK: ${item.title}`);
            console.log(`🔗 LİNK: ${item.link}`);
            console.log("------------------------------------");
        });

        console.log("\n✅ Zafer! Hammadde elimizde patron.");

    } catch (error) {
        console.error("❌ Burası da mı kapalı?:", error.message);
    }
}

ajanSokagaIndi();