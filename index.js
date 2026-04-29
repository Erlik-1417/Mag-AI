import { GoogleGenerativeAI } from "@google/generative-ai";
import { magAiSystemPrompt } from "./prompt.js";
import { fetchNews } from "./fetcher.js"; // Senin fetcher'ı ekledik
import 'dotenv/config'; 

// API Anahtarını .env'den alıyoruz (Güvenlik!)
const API_KEY = process.env.GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

async function runMagAI() {
  console.log("🚀 MagAI motoru ateşleniyor...");

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: magAiSystemPrompt,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  try {
    // 1. ADIM: Senin fetcher ile Hacker News'ten gerçek veriyi çekiyoruz
    const newsArray = await fetchNews();
    
    if (!newsArray || newsArray.length === 0) {
      return console.log("⚠️ Haber bulunamadı, RSS akışını kontrol et.");
    }

    // 2. ADIM: Ortağının 'rawNotes' mantığını dinamik yapıyoruz
    // Şimdilik sadece ilk haberi göndererek sistemi test ediyoruz
    const currentNews = newsArray[0];
    const dynamicInput = `Haber Başlığı: ${currentNews.title}\nKaynak Link: ${currentNews.link}`;

    console.log(`📡 Analiz edilen taze haber: ${currentNews.title}`);

    // 3. ADIM: Dinamik veriyi modele gönderiyoruz
    const result = await model.generateContent(dynamicInput);
    const responseText = result.response.text();
    
    const finalData = JSON.parse(responseText);
    
    console.log("✅ MagAI İçerikleri Üretti:\n");
    console.table(finalData); // Konsolda daha şık durur

  } catch (error) {
    console.error("❌ Bir hata oluştu dostum:", error.message);
  }
}

runMagAI();