const puppeteer = require('puppeteer');

const SLEEP_DURATION = 1500;
const MAX_FOLLOWERS = 400;
let likesCounter = 0;

const sleep = ms => new Promise(res => setTimeout(res, ms));

const nodeToPost = ({ node }) => ({
  caption: ((node.edge_media_to_caption.edges[0] || {}).node ||  {}).text || '',
  id: node.id,
  is_video: node.is_video,
  comments: (node.edge_media_to_comment || { count: 0 }).count,
  likes: (node.edge_liked_by || { count: 0 }).count,
  owner_id: node.owner.id,
  comments_disabled: node.comments_disabled,
  shortcode: node.shortcode,
  url: `https://www.instagram.com/p/${node.shortcode}/`
});

(async () => {
  const browser = await puppeteer.launch({ headless: true });
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

    await page.goto(post.url);
    await sleep(SLEEP_DURATION);

    let username = '';

    try {
      username = await page.evaluate(() => _sharedData.entry_data.PostPage[0].graphql.shortcode_media.owner.username);
    } catch (e) {
      console.log(`Failed to parse _sharedData of ${post.url}`);
      continue;
    }

    if (likedUsers[username]) continue;
    else likedUsers[username] = true;

    await page.goto(`https://www.instagram.com/${username}`);

    await sleep(SLEEP_DURATION);

    let user = {};

    try {
      user = await page.evaluate(() => _sharedData.entry_data.ProfilePage[0].graphql.user);
    } catch (e) {
      console.log(`Failed to parse _sharedData of user: ${username}`);
      continue;
    }

    const followBy = user.edge_followed_by.count;
    const userPosts = user.edge_owner_to_timeline_media.edges.map(nodeToPost);

    if (followBy > MAX_FOLLOWERS) {
      console.log(`Skip user ${username}: more than ${MAX_FOLLOWERS} followers.`);
      continue;
    }

    for (var i = 0; i < 3; i++) {
      const userPost = userPosts[i];

      if (userPost) {
        await page.goto(userPost.url);

        await sleep(SLEEP_DURATION);

        try {
          await page.click('article > div > section > span > button');
        } catch (err) {
          console.log( `Failed to like ${userPost.url}` );
          continue;
        }

        console.log( `Liked ${userPost.url}` );
        likesCounter += 1;
        await sleep(SLEEP_DURATION);
      }
    }
  }

  console.log(`Like ${likesCounter} posts.`);

  await browser.close();
})();
