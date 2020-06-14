module.exports = {
	args: [
		'--disable-infobars',
		'--disable-setuid-sandbox',
		'--ignore-certifcate-errors',
		'--ignore-certifcate-errors-spki-list',
		'--no-sandbox',
		'--user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 123.0.0.24.115 (iPhone10,2; iOS 12_4_1; en_US; en-US; scale=2.61; 1080x1920; 188362626)"',
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

  MIN_FOLLOW_RATIO: 0.3,

  MAX_LIKES_PER_SESSION: 50,

  MAX_LIKES_PER_USER: 3
}
