const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  // Новий сайт для скрейпінгу
  const TARGET_URL = 'https://uaserials.pro/';

  try {
    const { data: html } = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!html) {
      return res.status(500).json({ error: "Не отримано HTML зі сторінки" });
    }

    const $ = cheerio.load(html);
    const series = [];
    
    // Селектори, специфічні для uaserials.pro
    $('.short-item').each((i, item) => {
      const linkElement = $(item).find('a');
      const title = $(item).find('.short-title').text()?.trim();
      const posterUrl = $(item).find('img').attr('src');
      const seriesPageUrl = linkElement.attr('href');

      if (title && posterUrl && seriesPageUrl) {
        series.push({
          id: seriesPageUrl,
          title: title,
          poster: posterUrl.startsWith('http') ? posterUrl : `${TARGET_URL}${posterUrl}`,
          url: seriesPageUrl,
        });
      }
    });

    console.log(`[API] uaserials.pro: Сформовано серіалів: ${series.length}`);
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(series);

  } catch (error) {
    console.error('Глобальна помилка у функції:', error.message);
    res.status(500).json({ error: error.message });
  }
};
