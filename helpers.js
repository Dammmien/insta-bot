const MAX_FOLLOWED_BY = 1000;
const SLEEP_DURATION = 1750;

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

const sleep = ms => new Promise(res => setTimeout(res, ms));

const shouldLikesPosts = (user) => {
  const followedBy = user.edge_followed_by.count;
  const follows = user.edge_follow.count;
  const followRatio = follows / followedBy;

  if (followedBy > MAX_FOLLOWED_BY) {
    console.log(`Skip user ${user.username}: more than ${MAX_FOLLOWED_BY} followers.`);
    return false;
  }

  if (followRatio < 0.4) {
    console.log(`Skip user ${user.username}: followed by ${followedBy}, follows ${follows}`);
    return false;
  }

  return true;
};

const getUserInformations = async (username, page) => {
  await page.goto(`https://www.instagram.com/${username}`);

  await sleep(SLEEP_DURATION);

  let user = {};

  try {
    user = await page.evaluate(() => _sharedData.entry_data.ProfilePage[0].graphql.user);
  } catch (e) {
    console.log(`Failed to parse _sharedData of user: ${username}`);
  }

  return user;
};


const likePostsUser = async (user, page) => {
  const userPosts = user.edge_owner_to_timeline_media.edges.map(nodeToPost);

  for (var i = 0; i < 3; i++) {
    const userPost = userPosts[i];

    if (userPost) {
      try {
        await page.goto(userPost.url);
      } catch (err) {
        console.log( `Failed to go to ${userPost.url}` );
        continue;
      }

      await sleep(SLEEP_DURATION);

      try {
        await page.click('article > div > section > span > button');
      } catch (err) {
        console.log( `Failed to like ${userPost.url}` );
        continue;
      }

      console.log( `Liked ${userPost.url}` );

      await sleep(SLEEP_DURATION);
    }
  }
};

module.exports = {
	nodeToPost,
	sleep,
	shouldLikesPosts,
	nodeToComment,
	getUserInformations,
	likePostsUser
};
