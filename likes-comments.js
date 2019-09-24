const puppeteer = require('puppeteer');
const { nodeToPost, sleep, shouldLikesPosts, getUserInformations, likePostsUser, nodeToComment } = require('./helpers');
const { args } = require('./contants');
const preventDetection = require('./prevent-detection');
const SLEEP_DURATION = 2000;

(async () => {
  const browser = await puppeteer.launch({ args, headless: false });
  const pages = await browser.pages();
  const page = pages[0];

  preventDetection(page);

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

  console.log( 'Go to www.instagram.com/explore/tags/watercolor' );

  await page.goto('https://www.instagram.com/explore/tags/watercolor');

  const nodes = await page.evaluate(() => _sharedData.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_top_posts.edges);

  const posts = nodes.map(nodeToPost);

  const likedUsers = {};

  while (posts.length) {
    const post = posts.shift();
    const url = 'https://www.instagram.com/graphql/query/?query_hash=f0986789a5c5d17c2400faebf16efd0d&variables=' + encodeURIComponent(JSON.stringify({ shortcode: post.shortcode , first: post.comments_count }));
    const { data } = await page.evaluate(x => fetch(x).then(r => r.json()), url);
    const comments = data.shortcode_media.edge_media_to_comment.edges.map(nodeToComment);

    while ( comments.length ) {
      const comment = comments.shift();

      if (comment.owner_id !== post.owner_id) { // filter comments of the post author

        if (likedUsers[comment.owner_id]) { // avoid multiple comments of the same users
          console.log( `Skip ${comment.username}: already liked` );
          continue;
        } else {
          likedUsers[comment.owner_id] = true;
        }

        const user = await getUserInformations(comment.username, page);

        if (shouldLikesPosts(user)) {
          console.log( `Let's go like ${comment.username}:` );
          await likePostsUser(user, page);
        }
      }
    }
  }

  await browser.close();
})();
