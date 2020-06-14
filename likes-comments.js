const { nodeToPost, shouldLikesPosts, getPostComments, getUserInformation, likeUserPosts } = require('./helpers');
const { MAX_LIKES_PER_SESSION } = require('./contants');
const setup = require('./setup');

(async () => {
  const { browser, page } = await setup('https://www.instagram.com/explore/tags/watercolor');
  const nodes = await page.evaluate(() => _sharedData.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_top_posts.edges);
  const posts = nodes.map(nodeToPost);

  let usersLikedCount = 0;
  let postsLikedCount = 0;

  while (posts.length) {
    const post = posts.shift();
    const comments = await getPostComments(post, page);

    while ( comments.length ) {
      const comment = comments.shift();
      const user = await getUserInformation(comment.username, page);

      if (user === null) continue;

      if (shouldLikesPosts(user)) {
        usersLikedCount += 1;
        postsLikedCount += await likeUserPosts(user, page);
      }

      if (postsLikedCount >= MAX_LIKES_PER_SESSION) break;
    }

    if (postsLikedCount >= MAX_LIKES_PER_SESSION) break;
  }

  console.log( `Liked ${postsLikedCount} posts from ${usersLikedCount} users` );

  await browser.close();
})();
