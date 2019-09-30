module.exports = {
	args: [
		'--disable-infobars',
		'--disable-setuid-sandbox',
		'--ignore-certifcate-errors',
		'--ignore-certifcate-errors-spki-list',
		'--no-sandbox',
		'--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36"',
		'--window-position=0,0'
	],

	cookie: {
    domain: 'www.instagram.com',
    expirationDate: 1597288045,
    hostOnly: true,
    httpOnly: true,
    name: 'sessionid',
    path: '/',
    secure: true,
    session: false,
    value: process.env.SESSION_ID,
    id: 1
  },

  MIN_SLEEP_DURATION: 4000,

  MAX_FOLLOWED_BY: 1000,

  MIN_FOLLOW_RATIO: 0.5,

  MAX_LIKES_PER_SESSION: 15,

  MAX_LIKES_PER_USER: 3
}
