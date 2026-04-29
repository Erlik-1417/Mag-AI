// Gerekli paketleri ve yazdığımız prompt'u içeri alıyoruz
import { GoogleGenerativeAI } from "@google/generative-ai";
import { magAiSystemPrompt } from "./prompt.js";

// TODO: Kendi API anahtarını buraya eklemelisin (.env kullanmak en sağlıklısı)
const API_KEY = "SENIN_GEMINI_API_ANAHTARIN"; 
const genAI = new GoogleGenerativeAI(API_KEY);

async function runMagAI() {
  console.log("MagAI motoru ısınıyor...");

  // Modeli ve kurallarımızı tanımlıyoruz
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Hızlı ve JSON dönmekte çok başarılı bir model
    systemInstruction: magAiSystemPrompt,
    generationConfig: {
      responseMimeType: "application/json", // MagAI'yı JSON dışına çıkmaması için kilitliyoruz
    }
  });

  // Burası senin veya uygulamanın MagAI'ya fırlatacağı ham veriler:
  const rawNotes = `
    Bugün projede çok yorulduk. Prompt yapısını kurduk. 
    Node.js üzerinden API'yi bağladık. 
    JSON formatında çıktı almayı başardık. Çirkin ama çalışıyor işte.
  `;

  try {
    // Veriyi modele gönderiyoruz
    const result = await model.generateContent(rawNotes);
    const responseText = result.response.text();
    
    // Gelen JSON string'ini JavaScript objesine çeviriyoruz
    const finalData = JSON.parse(responseText);
    
    console.log("✅ MagAI İçerikleri Üretti:\n");
    console.log(JSON.stringify(finalData, null, 2));

  } catch (error) {
    console.error("❌ Bir hata oluştu dostum:", error);
  }
}

// Fonksiyonu çalıştırıyoruz
runMagAI();