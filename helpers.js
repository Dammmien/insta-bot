const { MAX_FOLLOWED_BY, MAX_LIKES_PER_USER, MIN_FOLLOW_RATIO, MIN_SLEEP_DURATION } = require('./contants');

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

const sleep = () => new Promise(res => setTimeout(res, Math.round(MIN_SLEEP_DURATION + Math.random() * MIN_SLEEP_DURATION)));

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
    const url = 'https://www.instagram.com/sketchbook_lee/?__a=1';
    const data = await page.evaluate(x => fetch(x).then(r => r.json()), url);
    console.log( data );
    return data.graphql.user;
    // await page.goto(`https://www.instagram.com/${username}`);
    // await sleep();
    // return await page.evaluate(() => _sharedData.entry_data.ProfilePage[0].graphql.user);
  } catch (e) {
    console.log(`Failed to get user information of: ${username}`);
    return null;
  }
};

const getPostUserName = async (post, page) => {
  try {
    const url = 'https://www.instagram.com/graphql/query/?query_hash=6ff3f5c474a240353993056428fb851e&variables=' + encodeURIComponent(JSON.stringify({ shortcode: post.shortcode, include_reel: true, include_logged_out: false }));
    const { data } = await page.evaluate(x => fetch(x).then(r => r.json()), url);
    return data.shortcode_media.owner.reel.owner.username;
    // await page.goto(post.url);
    // await sleep();
    // return await page.evaluate(() => _sharedData.entry_data.PostPage[0].graphql.shortcode_media.owner.username);
  } catch (err) {
    console.log(`Failed to load or parse _sharedData of ${post.url}`, { err });
    return null;
  }
};

const likeUserPosts = async (user, page) => {
  console.log( `Let's go like ${user.username}` );
  let count = 0;
  const userPosts = user.edge_owner_to_timeline_media.edges.map(nodeToPost).slice(0, MAX_LIKES_PER_USER);

  while(userPosts.length) {
    const userPost = userPosts.shift();

    try {
      await page.goto(userPost.url);
      await sleep();
      await page.click('article > div > section > span > button');
      await sleep();
      count += 1;
      console.log( `Liked ${userPost.url}` );
    } catch (err) {
      console.log( `Failed to like ${userPost.url}` );
      continue;
    }
  }

  return count;
};

const getPostComments = async (post, page) => {
  const url = 'https://www.instagram.com/graphql/query/?query_hash=f0986789a5c5d17c2400faebf16efd0d&variables=' + encodeURIComponent(JSON.stringify({ shortcode: post.shortcode , first: post.comments_count }));
  const { data } = await page.evaluate(x => fetch(x).then(r => r.json()), url);

  return data.shortcode_media.edge_media_to_comment.edges.map(
    nodeToComment
  ).filter( // Keep only one comment by user
    (comment, index, arr) => arr.findIndex(item => item.owner_id === comment.owner_id) >= index
  ).filter( // Remove post owner comments
    (comment) => comment.owner_id !== post.owner_id
  );
};

const formatDuration = duration => {
    const secondes = Math.floor(duration / 1000);
    const h = Math.floor(secondes / 3600);
    const m = Math.floor((secondes - (h * 3600)) / 60);
    const s = secondes - (h * 3600) - (m * 60);

  return `${h < 10 ? '0' + h  : h}:${m < 10 ? '0' + m  : m}:${s < 10 ? '0' + s  : s}`;
};

module.exports = {
  formatDuration,
	nodeToPost,
	getPostUserName,
	shouldLikesPosts,
	getPostComments,
	getUserInformation,
	likeUserPosts
};
