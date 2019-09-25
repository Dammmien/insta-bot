const puppeteer = require('puppeteer');
const { args, cookie } = require('./contants');
const preventDetection = require('./prevent-detection');

module.exports = async url => {
  const browser = await puppeteer.launch({ args, headless: false });
  const pages = await browser.pages();
  const page = pages[0];
  await preventDetection(page);
  await page.setCookie(cookie);
  console.log( 'Go to www.instagram.com' );
  await page.goto('https://www.instagram.com');
  console.log( `Go to ${url}` );
  await page.goto(url);
  return { browser, page };
};
