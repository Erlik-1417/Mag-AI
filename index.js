import { GoogleGenerativeAI } from "@google/generative-ai";
import { magAiSystemPrompt } from "./prompt.js";
import { fetchNews } from "./fetcher.js"; 
import { memory } from "./database.js"; // Senin SQLite hafızan
import fs from 'fs/promises'; // Yengenin JSON dosya sistemi
import 'dotenv/config'; 

const API_KEY = process.env.GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

// --- Yengenin Dashboard Arşivleme Fonksiyonu ---
async function saveToLibrary(newData) {
    const filePath = './outputs.json';
    let library = [];
    try {
        const existingData = await fs.readFile(filePath, 'utf-8');
        library = JSON.parse(existingData);
    } catch (error) {
        // Dosya yoksa sorun değil
    }
    const contentToSave = {
        timestamp: new Date().toLocaleString('tr-TR'),
        ...newData
    };
    library.push(contentToSave);
    await fs.writeFile(filePath, JSON.stringify(library, null, 2), 'utf-8');
    console.log("💾 İçerikler Dashboard için 'outputs.json' dosyasına arşivlendi!");
}

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

    for (const currentNews of newsArray) {
      // 1. KONTROL: Senin SQLite Hafızan
      const alreadySeen = await memory.isSeen(currentNews.link);

      if (alreadySeen) {
        console.log(`⏩ Atlıyoruz (Zaten Okundu): ${currentNews.title}`);
        continue;
      }

      // 2. İŞLEME: Gemini Analizi
      console.log(`📡 YENİ HAMMADDE İŞLENİYOR: ${currentNews.title}`);
      const dynamicInput = `Haber Başlığı: ${currentNews.title}\nKaynak Link: ${currentNews.link}`;
      const result = await model.generateContent(dynamicInput);
      const finalData = JSON.parse(result.response.text());
      
      console.log("\n✅ MagAI İçerikleri Üretti:\n");
      console.table(finalData);

      // 3. KAYIT: Hem Senin SQLite Hafızana hem Yengenin JSON Arşivine
      await memory.save(currentNews.link, currentNews.title);
      await saveToLibrary(finalData); // Dashboard burayı okuyor
      
      console.log("💾 Hafıza ve Arşiv güncellendi.");
      
      isNewContentProcessed = true;
      break; 
    }

    if (!isNewContentProcessed) {
      console.log("😴 Tüm haberler zaten işlenmiş, MagAI dinleniyor.");
    }

  } catch (error) {
    console.error("❌ Motor arıza yaptı:", error.message);
  }
}

runMagAI();