const sentimental = require("Sentimental");
const twit = require("twit");
const config = require("./config");
const express = require("express");
const app = express();
const connectdb = require("./config/db");
const auth = require("./middleware/auth");
const Tweet = require("./models/Tweet");
const PORT = process.env.PORT || 5000;
connectdb();
app.use(require("cors")());
app.use(express.json({ extended: false }));

app.post("/sentiments", function (req, res) {

  //Autheticate keys and token
  var twitter = new twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret,
  });

 
  var query = `${req.body.sentiments} since:${req.body.date}`;
  twitter.get(
    "search/tweets",
    { q: `${req.body.sentiments} since:${req.body.date}`, count: 100 },
    function (err, data, response) {
      var results = sentimentScore(data.statuses);
      var tweetFields = {
        tweet: [],
      };
      tweetFields.tweet = results;
      //   tweetFields.user = req.user.id;
      tweetFields.keyWords = req.body.sentiments;
      var tweet = new Tweet(tweetFields);
      // await tweet.save();
      return res.json(results);
    }
  );
});

function sentimentScore(sentimentText) {
  var resultss = {};
  var results = 0;
  var sentiments = "";
  var key = "tweetList";
  var tweet, retweet, favorite;
  resultss[key] = [];
  for (var i = 0; i < sentimentText.length; i++) {
    tweet = sentimentText[i]["text"]; //text of tweets
    tweet = tweet.replace("#", ""); //remove hashtag
    retweet = sentimentText[i]["retweet_count"];
    favorite = sentimentText[i]["favorite_count"];
    tweetDate = sentimentText[i]["created_at"];
    var score = sentimental.analyze(tweet)["score"];

    // Algorithm for get the sentiments
    results += score;
    if (score > 0) {
      if (retweet > 0) {
        results += Math.log(retweet) / Math.log(2);
      }
      if (favorite > 0) {
        results += Math.log(favorite) / Math.log(2);
      }
    } else if (score < 0) {
      if (retweet > 0) {
        results -= Math.log(retweet) / Math.log(2);
      }
      if (favorite > 0) {
        results -= Math.log(favorite) / Math.log(2);
      }
    } else {
      results += 0;
    }
    if (results > 0) {
      sentiments = "Positive";
    } else if (results == 0) {
      sentiments = "Neutral";
    } else {
      sentiments = "Negative";
    }

    var data = {
      text: tweet,
      score: results,
      retweet: retweet,
      favorite: favorite,
      tweetDate: tweetDate,
      sentiments: sentiments,
    };
    resultss[key].push(data);
    results = 0;
  }
  //   return score;
  //   return [score, results, retweet, favorite];

  return resultss[key];
}
app.listen(PORT, () => {
  console.log("Server Started on PORT : ", PORT);
});
