import { GoogleGenerativeAI } from "@google/generative-ai";
import { magAiSystemPrompt } from "./prompt.js";
import { fetchNews } from "./fetcher.js"; 
import { memory } from "./database.js"; // HAFIZAYI İÇERİ ALDIK
import 'dotenv/config'; 

const API_KEY = process.env.GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

async function runMagAI() {
  console.log("🚀 MagAI motoru ateşleniyor...");

  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: magAiSystemPrompt,
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const newsArray = await fetchNews();
    if (!newsArray || newsArray.length === 0) return console.log("⚠️ Haber bulunamadı.");

    let isNewContentProcessed = false;

    // Haberleri sırayla dönüp hafızayı kontrol ediyoruz
    for (const currentNews of newsArray) {
      const alreadySeen = await memory.isSeen(currentNews.link);

      if (alreadySeen) {
        console.log(`⏩ Atlıyoruz (Zaten Okundu): ${currentNews.title}`);
        continue; // Bu haberi geç, sıradakine bak
      }

      // EĞER BURAYA GELDİYSE HABER YENİDİR!
      console.log(`📡 YENİ HAMMADDE İŞLENİYOR: ${currentNews.title}`);
      
      const dynamicInput = `Haber Başlığı: ${currentNews.title}\nKaynak Link: ${currentNews.link}`;
      const result = await model.generateContent(dynamicInput);
      const finalData = JSON.parse(result.response.text());
      
      console.log("\n✅ MagAI İçerikleri Üretti:\n");
      console.table(finalData);

      // İşimiz bitti, haberi hafızaya kazı ki bir daha sormasın
      await memory.save(currentNews.link, currentNews.title);
      console.log("💾 Veritabanına kaydedildi.");
      
      isNewContentProcessed = true;
      break; // Şimdilik sadece 1 tane YENİ haber işleyip motoru durduruyoruz (Test için)
    }

    if (!isNewContentProcessed) {
      console.log("😴 Tüm haberler zaten işlenmiş, MagAI yatmaya devam ediyor.");
    }

  } catch (error) {
    console.error("❌ Motor arıza yaptı:", error.message);
  }
}

runMagAI();