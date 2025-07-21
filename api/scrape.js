const axios = require('axios');
const cheerio = require('cheerio');

// Ця функція буде викликатись Vercel
module.exports = async (req, res) => {
  const API_URL = 'https://uakino.best/filmy/';

  try {
    // Робимо GET-запит на сторінку каталогу
    const { data: html } = await axios.get(API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!html) {
      return res.status(500).json({ error: "Не отримано HTML зі сторінки" });
    }

    const $ = cheerio.load(html);
    const movies = [];
    
    // Шукаємо кожен елемент фільму в списку
    $('.short-list .short-item').each((i, item) => {
      const linkElement = $(item).find('a.short-poster');
      
      // Перевіряємо, чи існує елемент, щоб уникнути помилок
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
    });

    console.log(`[API] Сформовано фільмів: ${movies.length}`);
    
    // Встановлюємо правильний заголовок і повертаємо дані
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(movies);

  } catch (error) {
    console.error('Глобальна помилка у функції:', error.message);
    res.status(500).json({ error: error.message });
  }
};
