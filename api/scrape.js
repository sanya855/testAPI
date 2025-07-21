const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  let browser = null;

  try {
    // Запускаємо браузер
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Йдемо на сторінку
    await page.goto('https://uakino.best/filmy/');

    // Чекаємо, поки на сторінці з'являться картки з фільмами
    const movieItemSelector = '.movie-item';
    await page.waitForSelector(movieItemSelector, { timeout: 15000 }); // Чекаємо до 15 секунд

    // Витягуємо дані прямо зі сторінки
    const movies = await page.$$eval(movieItemSelector, (items) => {
      // Цей код виконується всередині браузера
      return items.map(item => {
        const titleEl = item.querySelector('.movie-item__title');
        const posterLinkEl = item.querySelector('a.movie-item__poster');
        const imgEl = posterLinkEl ? posterLinkEl.querySelector('img') : null;
        
        // Переконуємось, що всі елементи існують
        if (titleEl && posterLinkEl && imgEl) {
          const posterUrl = imgEl.getAttribute('src');
          const moviePageUrl = posterLinkEl.getAttribute('href');
          const title = titleEl.innerText.trim();
          
          return {
            id: moviePageUrl,
            title: title,
            // Додаємо повний шлях до постера
            poster: posterUrl.startsWith('http') ? posterUrl : `https://uakino.best${posterUrl}`,
            url: moviePageUrl,
          };
        }
        return null;
      }).filter(Boolean); // Видаляємо всі null результати
    });

    console.log(`[API] Puppeteer сформував фільмів: ${movies.length}`);

    // Відправляємо успішну відповідь
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(movies);

  } catch (error) {
    console.error('Помилка у Puppeteer функції:', error.message);
    res.status(500).json({ error: error.message });
  } finally {
    // Завжди закриваємо браузер
    if (browser !== null) {
      await browser.close();
    }
  }
};
