import express from "express";
import cors from "cors";
import { closePool } from "./src/database/db.js";

import getHealth from "./src/routes/get.health.js";
import getTestConnection from "./src/routes/get.testConnection.js";
import getUser from "./src/routes/user/get.user.js";
import getFeed from "./src/routes/user/get.feed.js";
import getThread from "./src/routes/tweet/get.thread.js";
import getReplies from "./src/routes/tweet/get.replies.js";
import getProfile from "./src/routes/user/get.profile.js";
import getLikes from "./src/routes/tweet/get.likes.js";
import getRetweets from "./src/routes/tweet/get.retweets.js";
import getFollowers from "./src/routes/user/get.followers.js";
import getFolloweds from "./src/routes/user/get.followeds.js";
import getUsernameAvailable from "./src/routes/user/get.username-available.js";
import postNewUser from "./src/routes/user/post.new.js";
import postLike from "./src/routes/tweet/post.like.js";
import postRetweet from "./src/routes/tweet/post.retweet.js";
import deleteLike from "./src/routes/tweet/delete.like.js";
import deleteRetweet from "./src/routes/tweet/delete.retweet.js";
import postReply from "./src/routes/tweet/post.reply.js";
import postFollower from "./src/routes/user/post.follower.js";
import deleteFollower from "./src/routes/user/delete.follower.js";
import getSearchTweet from "./src/routes/tweet/get.search.js";
import getRandomUsers from "./src/routes/user/get.random.js";
import postNewTweet from "./src/routes/user/post.tweet.js";
import updateUser from "./src/routes/user/post.update.js";

const app = express();
const PORT = 3000;
const endpoints = [
  getHealth,
  getTestConnection,
  getUser,
  getFeed,
  getThread,
  getReplies,
  getProfile,
  getLikes,
  getRetweets,
  getFollowers,
  getFolloweds,
  getUsernameAvailable,
  postNewUser,
  postLike,
  postRetweet,
  deleteLike,
  deleteRetweet,
  postReply,
  postFollower,
  deleteFollower,
  getSearchTweet,
  getRandomUsers,
  postNewTweet,
  updateUser,
];

app.use(cors());
app.use(express.json());

endpoints.forEach((element) => {
  app.use("/", element);
});

const host = "localhost";
const server = app.listen(PORT, () => {
  console.log(`SERVER : http://${host}:${PORT}`);
});

process.on("SIGINT", async () => {
  server.close(async (err) => {
    if (err) {
      console.error("\nError cerrando el servidor:", err);
      process.exit(1);
    } else {
      console.log("\nServidor cerrado");
      try {
        await closePool();
        console.log("Pool de conexiones cerrado");
        process.exit(0);
      } catch (poolError) {
        console.error("Error cerrando el pool de conexiones:", poolError);
        process.exit(1);
      }
    }
  });
});
