const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const API_URL = 'https://uakino.best/filmy/'; // Беремо з каталогу

  try {
    const { data: html } = await axios.get(API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!html) {
      console.log('Не отримано HTML зі сторінки');
      return res.status(500).json({ error: "Не отримано HTML" });
    }

    const $ = cheerio.load(html);
    const movies = [];
    
    // Новий, більш надійний селектор для пошуку
    $('.short-list .short-item').each((i, item) => {
      try {
        const linkElement = $(item).find('a.short-poster');
        const title = $(item).find('div.short-title').text()?.trim();
        const posterUrl = $(item).find('img').attr('src');
        const moviePageUrl = linkElement.attr('href');

        if (title && posterUrl && moviePageUrl) {
          movies.push({
            id: moviePageUrl,
            title: title,
            poster: posterUrl.startsWith('http') ? posterUrl : `https://uakino.best${posterUrl}`,
            url: moviePageUrl,
          });
        }
      } catch (e) {
          // Якщо виникне помилка на одній картці, ми її залогуємо, але не зупинимо весь процес
          console.error('Помилка парсингу одного елемента:', e.message);
      }
    });

    console.log(`[API] Сформовано фільмів: ${movies.length}`);
    
    // Встановлюємо заголовок, щоб браузер розумів, що це JSON
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(movies);

  } catch (error) {
    console.error('Глобальна помилка у функції:', error.message);
    res.status(500).json({ error: error.message });
  }
};
