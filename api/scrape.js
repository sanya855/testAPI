// Файл: api/scrape.js

const axios = require('axios');
const cheerio = require('cheerio');

// Це головна функція, яку буде викликати Vercel
module.exports = async (req, res) => {
  const API_URL = 'https://uakino.best/engine/ajax/dle_filter.php';
  const BASE_URL = 'https://uakino.best';

  try {
    const formData = new URLSearchParams();
    formData.append('cstart', '1');
    formData.append('pr', '30');
    formData.append('dle_skin', 'uakino');

    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const html = response.data.content;
    if (!html) {
      return res.status(500).json({ error: "Відповідь не містить поля 'content'" });
    }

    const $ = cheerio.load(html);
    const movies = [];

    $('.short-item').each((i, item) => {
      const linkElement = $(item).find('a.short-poster');
      const title = $(item).find('div.short-title').text();
      const posterUrl = $(item).find('img').attr('src');
      const moviePageUrl = linkElement.attr('href');

      if (title && posterUrl && moviePageUrl) {
        movies.push({
          id: moviePageUrl,
          title: title.trim(),
          poster: posterUrl.startsWith('http') ? posterUrl : `${BASE_URL}${posterUrl}`,
          url: moviePageUrl,
        });
      }
    });

    // Відправляємо успішну відповідь із чистими даними
    res.status(200).json(movies);

  } catch (error) {
    // Відправляємо відповідь з помилкою
    res.status(500).json({ error: error.message });
  }
};
