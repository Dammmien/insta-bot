const puppeteer = require('puppeteer');

module.exports = class Test {

	async init() {
		this.browser = await puppeteer.launch({
			headless: false,
			args: [
				'--use-fake-ui-for-media-stream',
				'--disable-notifications',
				'--use-fake-device-for-media-stream'
			]
		});

		const pages = await this.browser.pages();

		return pages[0];
	}

}
