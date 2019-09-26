const puppeteer = require('puppeteer');
const { args, cookie } = require('./contants');
const preventDetection = require('./prevent-detection');

module.exports = async url => {
  const browser = await puppeteer.launch({ args, headless: false });
  const pages = await browser.pages();
  const page = pages[0];
  await preventDetection(page);
  await page.setCookie(cookie);

  page.on('response', async response => {
    if (response.status() === 400 && response.url().includes('like')) {
      console.error( `Received a status 400`, { url: response.url() });
      await browser.close();
      process.exit(1);
    }
  });

  console.log( 'Go to www.instagram.com' );
  await page.goto('https://www.instagram.com');
  console.log( `Go to ${url}` );
  await page.goto(url);
  return { browser, page };
};
