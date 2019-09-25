const { MAX_FOLLOWED_BY, MIN_FOLLOW_RATIO, MIN_SLEEP_DURATION } = require('./contants');

const nodeToPost = ({ node }) => ({
  caption: ((node.edge_media_to_caption.edges[0] || {}).node ||  {}).text || '',
  id: node.id,
  is_video: node.is_video,
  comments_count: (node.edge_media_to_comment || { count: 0 }).count,
  likes: (node.edge_liked_by || { count: 0 }).count,
  owner_id: node.owner.id,
  comments_disabled: node.comments_disabled,
  shortcode: node.shortcode,
  url: `https://www.instagram.com/p/${node.shortcode}/`
});

const nodeToComment = ({ node }) => ({
  id: node.id,
  owner_id: node.owner.id,
  username: node.owner.username
});

const sleep = () => {
  console.log( 'SLEEP' );
  return new Promise(res => setTimeout(res, Math.round(MIN_SLEEP_DURATION + Math.random() * 500)))
};

const shouldLikesPosts = (user) => {
  const followedBy = user.edge_followed_by.count;
  const follows = user.edge_follow.count;
  const followRatio = follows / followedBy;

  if (followedBy > MAX_FOLLOWED_BY) {
    console.log(`Skip user ${user.username}: more than ${MAX_FOLLOWED_BY} followers.`);
    return false;
  }

  if (followRatio < MIN_FOLLOW_RATIO) {
    console.log(`Skip user ${user.username}: followed by ${followedBy}, follows ${follows}`);
    return false;
  }

  return true;
};

const getUserInformation = async (username, page) => {
  try {
    await page.goto(`https://www.instagram.com/${username}`);
    await sleep();
    return await page.evaluate(() => _sharedData.entry_data.ProfilePage[0].graphql.user);
  } catch (e) {
    console.log(`Failed to get user information of: ${username}`);
    return {};
  }
};

const getPostUserName = async (post, page) => {
  try {
    await page.goto(post.url);
    await sleep();
    return await page.evaluate(() => _sharedData.entry_data.PostPage[0].graphql.shortcode_media.owner.username);
  } catch (err) {
    console.log(`Failed to load or parse _sharedData of ${post.url}`, { err });
    return null;
  }
};

const likeUserPosts = async (user, page) => {
  console.log( `Let's go like ${user.username}:` );
  const userPosts = user.edge_owner_to_timeline_media.edges.map(nodeToPost).slice(0, 3);

  while(userPost.length) {
    const userPost = userPosts.shift();

    try {
      await page.goto(userPost.url);
      await sleep();
      await page.click('article > div > section > span > button');
      await sleep();
      console.log( `Liked ${userPost.url}` );
    } catch (err) {
      console.log( `Failed to like ${userPost.url}` );
      continue;
    }
  }
};

const getPostComments = async (post) => {
  const url = 'https://www.instagram.com/graphql/query/?query_hash=f0986789a5c5d17c2400faebf16efd0d&variables=' + encodeURIComponent(JSON.stringify({ shortcode: post.shortcode , first: post.comments_count }));
  const { data } = await page.evaluate(x => fetch(x).then(r => r.json()), url);
  return data.shortcode_media.edge_media_to_comment.edges.map(
    nodeToComment
  ).filter(
    (comment, index, arr) => arr.findIndex(item => item.owner_id === comment.owner_id) >= index
  ).filter(
    (comment) => comment.owner_id !== post.owner_id
  );
}

module.exports = {
	nodeToPost,
	getPostUserName,
	shouldLikesPosts,
	getPostComments,
	getUserInformation,
	likeUserPosts
};
