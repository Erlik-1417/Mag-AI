import { GoogleGenerativeAI } from "@google/generative-ai";
import { magAiSystemPrompt } from "./prompt.js";
import { fetchNews } from "./fetcher.js"; 
import 'dotenv/config'; 
import fs from 'fs/promises'; // Dosya yazma işlemleri için

const API_KEY = process.env.GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

// --- YENİ EKLENEN ARŞİVLEME FONKSİYONU ---
async function saveToLibrary(newData) {
    const filePath = './outputs.json';
    let library = [];

    try {
        // Önce eski dosyayı okumaya çalışıyoruz (varsa)
        const existingData = await fs.readFile(filePath, 'utf-8');
        library = JSON.parse(existingData);
    } catch (error) {
        // Dosya henüz yoksa sorun değil, boş bir diziyle başlar
    }

    // Yeni içeriğe ne zaman üretildiğini bilmek için tarih damgası ekliyoruz
    const contentToSave = {
        timestamp: new Date().toLocaleString('tr-TR'),
        ...newData
    };

    library.push(contentToSave);

    // Güncel listeyi dosyaya geri yazıyoruz
    await fs.writeFile(filePath, JSON.stringify(library, null, 2), 'utf-8');
    console.log("💾 İçerikler başarıyla 'outputs.json' dosyasına arşivlendi!");
}
// -----------------------------------------

async function runMagAI() {
  console.log("🚀 MagAI motoru ateşleniyor...");

  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview", // Başarıyla çalışan modeliniz
    systemInstruction: magAiSystemPrompt,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  try {
    // 1. ADIM: Hacker News'ten gerçek veriyi çekiyoruz
    const newsArray = await fetchNews();
    
    if (!newsArray || newsArray.length === 0) {
      return console.log("⚠️ Haber bulunamadı, RSS akışını kontrol et.");
    }

    // 2. ADIM: Dinamik input oluşturuyoruz
    const currentNews = newsArray[0];
    const dynamicInput = `Haber Başlığı: ${currentNews.title}\nKaynak Link: ${currentNews.link}`;

    console.log(`📡 Analiz edilen taze haber: ${currentNews.title}`);

    // 3. ADIM: Dinamik veriyi modele gönderiyoruz
    const result = await model.generateContent(dynamicInput);
    const responseText = result.response.text();
    
    const finalData = JSON.parse(responseText);
    
    console.log("✅ MagAI İçerikleri Üretti:\n");
    console.table(finalData); // Konsolda gösteriyoruz

    // 4. ADIM: Üretilen veriyi kalıcı olarak JSON dosyasına kaydediyoruz
    await saveToLibrary(finalData);

  } catch (error) {
    console.error("❌ Bir hata oluştu dostum:", error.message);
  }
}

runMagAI();