const puppeteer = require('puppeteer');
const { nodeToPost, sleep, shouldLikesPosts, getUserInformations, likePostsUser } = require('./helpers');
const SLEEP_DURATION = 1500;


(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const pages = await browser.pages();
  const page = pages[0];

  await page.setCookie({
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
  });

  console.log( 'Go to www.instagram.com' );

  await page.goto('https://www.instagram.com');

  console.log( 'Go to www.instagram.com/explore/tags/drawing' );

  await page.goto('https://www.instagram.com/explore/tags/drawing');

  const posts = await page.evaluate(() => _sharedData.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges);

  const postsToLike = posts.map(nodeToPost);

  const likedUsers = {};

  while (postsToLike.length) {
    const post = postsToLike.shift();

    try {
      await page.goto(post.url);
    } catch (e) {
      console.log(`Failed to load ${post.url}`);
      continue;
    }

    await sleep(SLEEP_DURATION);

    let username = '';

    try {
      username = await page.evaluate(() => _sharedData.entry_data.PostPage[0].graphql.shortcode_media.owner.username);
    } catch (e) {
      console.log(`Failed to parse _sharedData of ${post.url}`);
      continue;
    }

    if (likedUsers[username]) { // avoid multiple posts of the same users
      console.log( `Skip ${username}: already liked` );
      continue;
    } else {
      likedUsers[username] = true;
    }

    const user = await getUserInformations(username, page);

    if (shouldLikesPosts(user)) {
      console.log( `Let's go like ${username}:` );
      await likePostsUser(user, page);
    }
  }

  await browser.close();
})();
