const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const API_URL = 'https://uakino.best/filmy/';

  try {
    const { data: html } = await axios.get(API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(html);
    const movies = [];
    
    $('.short-list .short-item').each((i, item) => {
      const linkElement = $(item).find('a.short-poster');
      
      // ✅ ГОЛОВНЕ ВИПРАВЛЕННЯ:
      // Перевіряємо, чи існує linkElement, ПЕРЕД тим, як 
      // звертатися до його властивостей (наприклад, .length)
      if (linkElement && linkElement.length > 0) {
        const title = $(item).find('div.short-title').text()?.trim();
        const posterUrl = linkElement.find('img').attr('src');
        const moviePageUrl = linkElement.attr('href');

        if (title && posterUrl && moviePageUrl) {
          movies.push({
            id: moviePageUrl,
            title: title,
            poster: posterUrl.startsWith('http') ? posterUrl : `https://uakino.best${posterUrl}`,
            url: moviePageUrl,
          });
        }
      }
      // Якщо linkElement не знайдено, ми просто ігноруємо цей елемент і йдемо далі.
    });

    console.log(`[API] Сформовано фільмів: ${movies.length}`);
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(movies);

  } catch (error) {
    console.error('Глобальна помилка у функції:', error.message);
    res.status(500).json({ error: error.message });
  }
};
