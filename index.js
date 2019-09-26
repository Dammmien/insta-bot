const { nodeToPost, getPostUserName, shouldLikesPosts, getUserInformation, likeUserPosts } = require('./helpers');
const { MAX_LIKES_PER_SESSION } = require('./contants');
const setup = require('./setup');

(async () => {
  const { browser, page } = await setup('https://www.instagram.com/explore/tags/drawing');
  const nodes = await page.evaluate(() => _sharedData.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges);
  const posts = nodes.map(nodeToPost).filter((post, index, arr) => arr.findIndex(item => item.owner_id === post.owner_id) >= index);

  let usersLikedCount = 0;
  let postsLikedCount = 0;

  while (posts.length) {
    const post = posts.shift();
    const userName = await getPostUserName(post, page);

    if (userName === null) continue;

    const user = await getUserInformation(userName, page);

    if (user === null) continue;

    if (shouldLikesPosts(user)) {
      usersLikedCount += 1;
      postsLikedCount += await likeUserPosts(user, page);

      if (postsLikedCount >= MAX_LIKES_PER_SESSION) break;
    }
  }

  console.log( `Liked ${postsLikedCount} posts from ${usersLikedCount} users` );

  await browser.close();
})();
