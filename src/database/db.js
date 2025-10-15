import mysql2 from "mysql2/promise";

const pool = mysql2.createPool({
  host: process.env.db_host,
  database: process.env.database,
  user: process.env.db_user,
  password: process.env.db_password,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
});

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
  } catch (error) {
    throw error;
  }
};

export const closePool = async (err) => {
  pool.end((err) => {
    if (err) throw err;
    console.log("Pool cerrado");
    process.exit();
  });
};

export const getUser = async (userId, currentUserID) => {
  const [queryResult] = await pool.query(
    `
    SELECT u.*, 
    COALESCE(followed_count.a, 0) AS followers, 
    COALESCE(follower_count.b, 0) AS followed,
    EXISTS (select 1 from following f where f.followedID = :userID and f.followerID = :currentUserID) as currentUserFollows
    FROM users u
    LEFT JOIN (
     SELECT followedID, COUNT(*) AS a
     FROM following
     GROUP BY followedID
    ) AS followed_count ON u.userID = followed_count.followedID
    LEFT JOIN (
     SELECT followerID, COUNT(*) AS b
     FROM following
     GROUP BY followerID
    ) AS follower_count ON u.userID = follower_count.followerID
    WHERE u.userID = :userID`,
    {
      userID: userId,
      currentUserID: currentUserID,
    }
  );
  formatQuery(queryResult);
  return queryResult;
};

export const getUserFeed = async (userId) => {
  const [queryResult] = await pool.query(
    `
    WITH FollowedUsersTweets AS (
      SELECT 
          t.tweetID, 
          t.tweetContent, 
          t.tweetDate,
          t.tweetImage,
          t.userID AS authorID,
          u.userName AS authorName,
          u.userNickname AS authorNickname,
          u.userPFP AS authorPFP,
          t.parentTweetID,
          null as retweetedByUsername,
          NULL AS retweetDate,
          t.tweetID AS originalTweetID
      FROM tweets t
      JOIN users u ON t.userID = u.userID
      JOIN following f ON t.userID = f.followedID
      WHERE f.followerID = :currentUser and t.parentTweetID is null 
      UNION
      SELECT 
          t.tweetID,
          t.tweetContent,
          t.tweetDate,
          t.tweetImage,
          t.userID AS authorID,
          u.userName AS authorName,
          u.userNickname AS authorNickname,
          u.userPFP AS authorPFP,
          t.parentTweetID,
          urt.userName as retweetedByUsername,
          rt.retweetDate,
          rt.tweetID AS originalTweetID
      FROM retweets rt
      JOIN tweets t ON rt.tweetID = t.tweetID
      JOIN users u ON t.userID = u.userID
      join users urt on urt.userID = rt.userID
      JOIN following f ON rt.userID = f.followedID
      WHERE f.followerID = :currentUser
    )
    SELECT 
        ft.tweetID,
        ft.tweetContent,
        ft.tweetImage,
        ft.authorID as user,
        ft.authorName as userName,
        ft.authorNickname as userNickname,
        ft.authorPFP as userPFP,
        ft.parentTweetID,
        ft.retweetedByUsername,
        ft.tweetDate,
        ft.retweetDate,
        (SELECT COUNT(*) FROM likes l WHERE l.tweetID = ft.tweetID) AS likes,
        (SELECT COUNT(*) FROM retweets rt2 WHERE rt2.tweetID = ft.tweetID) AS retweets,
        (SELECT COUNT(*) FROM tweets t2 where t2.parentTweetID = ft.tweetID) AS replies,
        (SELECT COUNT(*) FROM likes l WHERE l.tweetID = ft.tweetID AND l.userID = :currentUser) AS currentUserHasLiked,
        (SELECT COUNT(*) FROM retweets rt2 WHERE rt2.tweetID = ft.tweetID AND rt2.userID = :currentUser) AS currentUserHasRetweeted,
        rtu.userID AS replyUserID,
        rtu.userName AS replyUserName
    FROM FollowedUsersTweets ft
    LEFT JOIN tweets pt ON ft.parentTweetID = pt.tweetID
    LEFT JOIN users rtu ON pt.userID = rtu.userID
    ORDER BY COALESCE(ft.retweetDate, ft.tweetDate) DESC;
    `,
    {
      currentUser: userId,
    }
  );
  formatQuery(queryResult);
  return queryResult;
};

export const getUserProfileTweets = async (userID, currentUserID) => {
  const [queryResult] = await pool.query(
    `
    WITH UserTweetsAndRetweets AS (
      SELECT 
          t.tweetID, 
          t.tweetContent, 
          t.tweetDate,
          t.tweetImage,
          t.userID AS authorID,
          u.userName AS authorName,
          u.userNickname AS authorNickname,
          u.userPFP AS authorPFP,
          t.parentTweetID,
          null as retweetedByUsername,
          NULL AS retweetDate,
          t.tweetID AS originalTweetID
      FROM tweets t
      JOIN users u ON t.userID = u.userID
      WHERE t.userID = :userID and t.parentTweetID is null 
      UNION
      SELECT 
          t.tweetID,
          t.tweetContent,
          t.tweetDate,
          t.tweetImage,
          t.userID AS authorID,
          u.userName AS authorName,
          u.userNickname AS authorNickname,
          u.userPFP AS authorPFP,
          t.parentTweetID,
          urt.userName as retweetedByUsername,
          rt.retweetDate,
          rt.tweetID AS originalTweetID
      FROM retweets rt
      JOIN tweets t ON rt.tweetID = t.tweetID
      JOIN users u ON t.userID = u.userID
      join users urt on urt.userID = rt.userID
      WHERE rt.userID = :userID
    )
    SELECT 
        utrt.tweetID,
        utrt.tweetContent,
        utrt.tweetImage,
        utrt.authorID as user,
        utrt.authorName as userName,
        utrt.authorNickname as userNickname,
        utrt.authorPFP as userPFP,
        utrt.parentTweetID,
        utrt.retweetedByUsername,
        utrt.tweetDate,
        utrt.retweetDate,
        (SELECT COUNT(*) FROM likes l WHERE l.tweetID = utrt.tweetID) AS likes,
        (SELECT COUNT(*) FROM retweets rt2 WHERE rt2.tweetID = utrt.tweetID) AS retweets,
        (SELECT COUNT(*) FROM tweets t2 where t2.parentTweetID = utrt.tweetID) AS replies,
        (SELECT COUNT(*) FROM likes l WHERE l.tweetID = utrt.tweetID AND l.userID = :currentUserID) AS currentUserHasLiked,
        (SELECT COUNT(*) FROM retweets rt2 WHERE rt2.tweetID = utrt.tweetID AND rt2.userID = :currentUserID) AS currentUserHasRetweeted,
        rtu.userID AS replyUserID,
        rtu.userName AS replyUserName
    FROM UserTweetsAndRetweets utrt
    LEFT JOIN tweets pt ON utrt.parentTweetID = pt.tweetID
    LEFT JOIN users rtu ON pt.userID = rtu.userID
    ORDER BY COALESCE(utrt.retweetDate, utrt.tweetDate) DESC;
    `,
    {
      userID: userID,
      currentUserID: currentUserID,
    }
  );
  formatQuery(queryResult);
  return queryResult;
};

export const getThreadFromTweet = async (tweetID, currentUserID) => {
  const [queryResult] = await pool.query(
    `
    SELECT 
      t.tweetID, 
      t.tweetContent, 
      t.tweetDate, 
      t.tweetImage, 
      t.parentTweetID, 
      u.userID AS user, 
      u.userName, 
      u.userNickname,
      u.userID = :currentUserID as tweetFromCurrentUser,
      COALESCE(l.likesCount, 0) AS likes, 
      EXISTS (SELECT 1 FROM likes WHERE userID = :currentUserID AND tweetID = t.tweetID) AS currentUserHasLiked,
      COALESCE(rt.retweetsCount, 0) AS retweets,
      EXISTS (SELECT 1 FROM retweets WHERE userID = :currentUserID AND tweetID = t.tweetID) AS currentUserHasRetweeted,
      COALESCE(rc.repliesCount, 0) AS replies 
    FROM tweets t 
    INNER JOIN users u ON t.userID = u.userID 
    LEFT JOIN (
    SELECT tweetID, COUNT(*) AS likesCount FROM likes GROUP BY tweetID
    ) l ON t.tweetID = l.tweetID
    LEFT JOIN (
        SELECT tweetID, COUNT(*) AS retweetsCount FROM retweets GROUP BY tweetID
    ) rt ON t.tweetID = rt.tweetID
    LEFT JOIN (
    SELECT parentTweetID, COUNT(*) AS repliesCount FROM tweets WHERE parentTweetID IS NOT NULL GROUP BY parentTweetID
    ) rc ON t.tweetID = rc.parentTweetID
    inner join 
    ( with recursive cte(tweetID, parentTweetId) as (
	  select	tweetId,
	  	parentTweetId
	  from	tweets
	  where	tweetID = :tweetID
	  union all
	  select	p.tweetID,
	  	p.parentTweetId
	  from 	tweets p
	  inner join cte
	  	on p.tweetID = cte.parentTweetId
    )
    select * from cte 
    ) as thread
    on t.tweetID = thread.tweetID
    order by tweetId;
    `,
    {
      tweetID: tweetID,
      currentUserID: currentUserID,
    }
  );
  formatQuery(queryResult);
  return queryResult;
};

export const getRepliesFromTweet = async (tweetID, currentUserID) => {
  const [queryResult] = await pool.query(
    `
    SELECT 
      t.tweetID, 
      t.tweetContent, 
      t.tweetDate, 
      t.tweetImage, 
      t.parentTweetID, 
      u.userID AS user, 
      u.userName,
      u.userNickname,
      u.userID = :currentUserID as tweetFromCurrentUser,
      COALESCE(l.likesCount, 0) AS likes, 
      EXISTS (SELECT 1 FROM likes WHERE userID = :currentUserID AND tweetID = t.tweetID) AS currentUserHasLiked,
      COALESCE(rt.retweetsCount, 0) AS retweets,
      EXISTS (SELECT 1 FROM retweets WHERE userID = :currentUserID AND tweetID = t.tweetID) AS currentUserHasRetweeted,
      COALESCE(rc.repliesCount, 0) AS replies 
    FROM tweets t 
    INNER JOIN users u ON t.userID = u.userID 
    LEFT JOIN (
        SELECT tweetID, COUNT(*) AS likesCount FROM likes GROUP BY tweetID
    ) l ON t.tweetID = l.tweetID
    LEFT JOIN (
        SELECT tweetID, COUNT(*) AS retweetsCount FROM retweets GROUP BY tweetID
    ) rt ON t.tweetID = rt.tweetID
    LEFT JOIN (
        SELECT parentTweetID, COUNT(*) AS repliesCount FROM tweets WHERE parentTweetID IS NOT NULL GROUP BY parentTweetID
    ) rc ON t.tweetID = rc.parentTweetID
    WHERE 
        t.parentTweetID = :tweetID
    order by tweetFromCurrentUser desc, likes desc, retweets desc, t.tweetDate desc;
    `,
    {
      tweetID: tweetID,
      currentUserID: currentUserID,
    }
  );
  formatQuery(queryResult);
  return queryResult;
};

export const getListOfLikes = async (tweetID) => {
  const [queryResult] = await pool.query(
    `
    SELECT u.userID, u.userName, u.userNickname, u.userPFP
    FROM users u 
    INNER JOIN likes l 
    ON u.userID = l.userID 
    WHERE l.tweetID = :tweetID 
    ORDER BY l.likeDate desc;
    `,
    { tweetID: tweetID }
  );
  formatQuery(queryResult);
  return queryResult;
};

export const getListOfRetweets = async (tweetID) => {
  const [queryResult] = await pool.query(
    `
    SELECT u.userID, u.userName, u.userNickname, u.userPFP
    FROM users u 
    INNER JOIN retweets rt 
    ON u.userID = rt.userID 
    WHERE rt.tweetID = :tweetID 
    ORDER BY rt.retweetDate desc;
    `,
    { tweetID: tweetID }
  );
  formatQuery(queryResult);
  return queryResult;
};

export const getListOfFollowers = async (userID) => {
  const [queryResult] = await pool.query(
    `
    SELECT u.userID, u.userName, u.userNickname, u.userPFP
    FROM users u 
    INNER join following f  
    ON u.userID = f.followerID  
    WHERE f.followedID  = :userID 
    ORDER by f.followingDate  desc;
    `,
    { userID: userID }
  );
  formatQuery(queryResult);
  return queryResult;
};

export const getListOfFolloweds = async (userID) => {
  const [queryResult] = await pool.query(
    `
    SELECT u.userID, u.userName, u.userNickname, u.userPFP
    FROM users u 
    INNER join following f  
    ON u.userID = f.followedID  
    WHERE f.followerID  = :userID 
    ORDER by f.followingDate  desc;
    `,
    { userID: userID }
  );
  formatQuery(queryResult);
  return queryResult;
};

export const isUsernameAvailable = async (userName) => {
  const [queryResult] = await pool.query(
    `
    select NOT count(*) as usernameAvailable
    from users u 
    where u.userName = :userNameStr;
    `,
    { userNameStr: String(userName) }
  );
  formatQuery(queryResult);
  return queryResult;
};

export const createNewUser = async (body) => {
  const [queryResult] = await pool.query(
    `
    insert into users (userID, userName, userNickname)
    values (:userID, :userName, :userNickname);
    `,
    {
      userID: Number(body.userID),
      userName: String(body.userName),
      userNickname: String(body.userNickname),
    }
  );
  return queryResult;
};

export const postLike = async (tweetID, userID) => {
  const [queryResult] = await pool.query(
    `
    insert into likes (tweetID, userID)
    values (:tweetID, :userID);
    `,
    {
      tweetID: tweetID,
      userID: userID,
    }
  );
  return queryResult;
};

export const deleteLike = async (tweetID, userID) => {
  const [queryResult] = await pool.query(
    `
    delete from likes 
    where tweetID = :tweetID and userID = :userID;
    `,
    {
      tweetID: tweetID,
      userID: userID,
    }
  );
  return queryResult;
};

export const postRetweet = async (tweetID, userID) => {
  const [queryResult] = await pool.query(
    `
    insert into retweets (tweetID, userID)
    values (:tweetID, :userID);
    `,
    {
      tweetID: tweetID,
      userID: userID,
    }
  );
  return queryResult;
};

export const deleteRetweet = async (tweetID, userID) => {
  const [queryResult] = await pool.query(
    `
    delete from retweets  
    where tweetID = :tweetID and userID = :userID;  
    `,
    {
      tweetID: tweetID,
      userID: userID,
    }
  );
  return queryResult;
};

export const postReply = async (parentTweetID, userID, tweetContent) => {
  const [queryResult] = await pool.query(
    `
    insert into tweets (tweetContent, userID, parentTweetID) 
    values (:tweetContent,:userID,:parentTweetID);
    `,
    {
      parentTweetID: parentTweetID,
      userID: userID,
      tweetContent: tweetContent,
    }
  );
  return queryResult;
};

export const postNewTweet = async (userID, tweetContent) => {
  const [queryResult] = await pool.query(
    `
    insert into tweets (tweetContent, userID) 
    values (:tweetContent,:userID);
    `,
    {
      userID: userID,
      tweetContent: tweetContent,
    }
  );
  return queryResult;
};

export const postFollower = async (followerID, followedID) => {
  const [queryResult] = await pool.query(
    `
    insert into following (followerID, followedID)
    values (:followerID, :followedID);
    `,
    {
      followerID: followerID,
      followedID: followedID,
    }
  );
  return queryResult;
};

export const deleteFollower = async (followerID, followedID) => {
  const [queryResult] = await pool.query(
    `
    delete from following
    where followerID = :followerID and followedID = :followedID;
    `,
    {
      followerID: followerID,
      followedID: followedID,
    }
  );
  return queryResult;
};

export const getSearchTweet = async (searchWord, currentUserID) => {
  const [queryResult] = await pool.query(
    `
    SELECT 
      t.tweetID,
      t.tweetContent,
      t.tweetImage,
      t.userID as user,
      u.userName,
      u.userNickname,
      u.userPFP,
      t.parentTweetID,
      null as retweetedByUsername,
      t.tweetDate,
      (SELECT COUNT(*) FROM likes l WHERE l.tweetID = t.tweetID) AS likes,
      (SELECT COUNT(*) FROM retweets rt2 WHERE rt2.tweetID = t.tweetID) AS retweets,
      (SELECT COUNT(*) FROM tweets t2 where t2.parentTweetID = t.tweetID) AS replies,
      (SELECT COUNT(*) FROM likes l WHERE l.tweetID = t.tweetID AND l.userID = :currentUserID) AS currentUserHasLiked,
      (SELECT COUNT(*) FROM retweets rt2 WHERE rt2.tweetID = t.tweetID AND rt2.userID = :currentUserID) AS currentUserHasRetweeted,
      rtu.userID AS replyUserID,
      rtu.userName AS replyUserName
    FROM tweets t
    JOIN users u on t.userID = u.userID
    LEFT JOIN tweets pt ON t.parentTweetID = pt.tweetID
    LEFT JOIN users rtu ON pt.userID = rtu.userID
    WHERE MATCH(t.tweetContent) AGAINST(:searchWord in boolean mode)
    ORDER BY t.tweetDate DESC;
    `,
    {
      currentUserID: currentUserID,
      searchWord: String(searchWord) + "*",
    }
  );
  formatQuery(queryResult);
  return queryResult;
};

export const getRandomUsers = async (currentUserID, limit) => {
  const [queryResult] = await pool.query(
    `
    with users as(SELECT u.*, 
       COALESCE(followed_count.a, 0) AS followers, 
       COALESCE(follower_count.b, 0) AS followed,
       exists (select 1 from following f where f.followedID = userID and f.followerID = :currentUserID) as currentUserFollows
    FROM users u
    LEFT JOIN (
        SELECT followedID, COUNT(*) AS a
        FROM following
        GROUP BY followedID
    ) AS followed_count ON u.userID = followed_count.followedID
    LEFT JOIN (
        SELECT followerID, COUNT(*) AS b
        FROM following
        GROUP BY followerID
    ) AS follower_count ON u.userID = follower_count.followerID)
    select * from users
    where currentUserFollows = 0 and userID <> :currentUserID
    order by rand()
    limit :limit;
    `,
    {
      currentUserID: currentUserID,
      limit: Number(limit),
    }
  );
  formatQuery(queryResult);
  return queryResult;
};

export const updateUser = async (userID, body) => {
  const [queryResult] = await pool.query(
    `
    update users 
    set userNickname = :userNickname, userBio = :userBio, userPFP = :userPFP
    where userID = :userID;
    `,
    {
      userID: userID,
      userNickname: String(body.userNickname),
      userBio: String(body.userBio),
      userPFP: Boolean(body.userPFP),
    }
  );
  return queryResult;
};

const formatQuery = (query) => {
  const attributes = [
    "tweetFromCurrentUser",
    "currentUserHasLiked",
    "currentUserHasRetweeted",
    "usernameAvailable",
    "currentUserFollows",
    "userPFP",
  ];

  query.forEach((element) => {
    attributes.forEach((attr) => {
      if (attr in element) {
        element[attr] = Boolean(element[attr]);
      }
    });
  });
};
