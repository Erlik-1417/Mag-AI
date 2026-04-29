import express from 'express';
import fs from 'fs/promises';
import 'dotenv/config';

const app = express();
const PORT = 3000;

// API: outputs.json dosyasını okuyup frontend'e gönderir
app.get('/api/content', async (req, res) => {
    try {
        const rawData = await fs.readFile('./outputs.json', 'utf-8');
        const jsonData = JSON.parse(rawData);
        res.json(jsonData);
    } catch (error) {
        console.error("Dosya okuma hatası:", error.message);
        res.json([]); // Hata varsa boş dizi dön ki frontend çökmesin
    }
});

// Frontend: Tek bir HTML sayfasında dashboard
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MagAI Dashboard</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0f0f; color: #e0e0e0; padding: 20px; line-height: 1.6; }
                .container { max-width: 900px; margin: auto; }
                header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; margin-bottom: 30px; padding-bottom: 10px; }
                h1 { margin: 0; font-size: 24px; color: #fff; }
                .card { background: #181818; border: 1px solid #282828; padding: 25px; border-radius: 12px; margin-bottom: 30px; transition: transform 0.2s; }
                .card:hover { border-color: #444; }
                .timestamp { color: #666; font-size: 13px; font-weight: bold; display: block; margin-bottom: 15px; }
                .platform-section { margin-top: 20px; }
                .platform-tag { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
                .linkedin-tag { background: #0077b5; color: white; }
                .x-tag { background: #ffffff; color: #000; }
                .content-box { background: #222; border-left: 4px solid #444; padding: 15px; border-radius: 4px; margin-top: 10px; white-space: pre-wrap; font-size: 15px; }
                .refresh-btn { background: #2ea44f; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
                .refresh-btn:hover { background: #2c974b; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>🚀 MagAI Dashboard</h1>
                    <button class="refresh-btn" onclick="loadContent()">Yenile</button>
                </header>
                <div id="dashboard">Veriler yükleniyor...</div>
            </div>

            <script>
                async function loadContent() {
                    try {
                        const res = await fetch('/api/content');
                        const data = await res.json();
                        const dashboard = document.getElementById('dashboard');
                        
                        if (data.length === 0) {
                            dashboard.innerHTML = '<p style="text-align:center; color:#666;">Henüz içerik üretilmemiş. MagAI motorunu çalıştırın!</p>';
                            return;
                        }

                        dashboard.innerHTML = '';
                        // En yeni içeriği en üstte göster (Reverse)
                        [...data].reverse().forEach(item => {
                            const card = document.createElement('div');
                            card.className = 'card';
                            card.innerHTML = \`
                                <span class="timestamp">🕒 \${item.timestamp}</span>
                                
                                <div class="platform-section">
                                    <span class="platform-tag linkedin-tag">LinkedIn</span>
                                    <div class="content-box">\${item.linkedin.tr}</div>
                                </div>
                                
                                <div class="platform-section">
                                    <span class="platform-tag x-tag">X / Twitter</span>
                                    <div class="content-box">\${item.x_twitter.tr}</div>
                                </div>
                            \`;
                            dashboard.appendChild(card);
                        });
                    } catch (err) {
                        document.getElementById('dashboard').innerHTML = 'Veri çekilirken bir hata oluştu.';
                    }
                }
                loadContent();
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Dashboard ateşlendi: http://localhost:${PORT}`);
});