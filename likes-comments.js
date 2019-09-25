const { nodeToPost, shouldLikesPosts, getUserInformation, likeUserPosts } = require('./helpers');

(async () => {
  const { browser, page } = await setup('https://www.instagram.com/explore/tags/watercolor');
  const nodes = await page.evaluate(() => _sharedData.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_top_posts.edges);
  const posts = nodes.map(nodeToPost);

  while (posts.length) {
    const post = posts.shift();
    const comments = await getPostComments(post);

    while ( comments.length ) {
      const comment = comments.shift();
      const user = await getUserInformation(comment.username, page);

      if (user === null) continue;

      if (shouldLikesPosts(user)) {
        console.log( `Let's go like ${comment.username}:` );
        await likeUserPosts(user, page);
      }
    }
  }

  await browser.close();
})();
