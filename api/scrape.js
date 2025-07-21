const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const API_URL = 'https://uakino.best/filmy/';
  const BASE_URL = 'https://uakino.best';

  try {
    const { data: html } = await axios.get(API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(html);
    const movies = [];
    
    // ✅ ОНОВЛЕНИЙ СЕЛЕКТОР: Тепер шукаємо '.movie-item' всередині '#dle-content'
    $('#dle-content .movie-item').each((i, item) => {
      const linkElement = $(item).find('a.movie-item__poster');
      
      if (linkElement && linkElement.length > 0) {
        const title = $(item).find('.movie-item__title').text()?.trim();
        const posterUrl = linkElement.find('img').attr('src');
        const moviePageUrl = linkElement.attr('href');

        if (title && posterUrl && moviePageUrl) {
          movies.push({
            id: moviePageUrl,
            title: title,
            poster: posterUrl.startsWith('http') ? posterUrl : `${BASE_URL}${posterUrl}`,
            url: moviePageUrl,
          });
        }
      }
    });

    console.log(`[API] Сформовано фільмів: ${movies.length}`);
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(movies);

  } catch (error) {
    console.error('Глобальна помилка у функції:', error.message);
    res.status(500).json({ error: error.message });
  }
};
