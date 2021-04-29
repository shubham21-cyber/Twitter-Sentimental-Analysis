const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
const Tweet = require("../../models/Tweet");
const router = require("express").Router();
require("dotenv").config();

//@POST Route
//@DESC Signup Route
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    var user = await User.findOne({ email });
    if (user) {
      return res.json({ msg: "User with Same Email Already Exists!" });
    }
    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      process.env.jwtSecret,
      {
        expiresIn: 360000000,
      },
      (err, token) => {
        if (err) throw err;
        return res.json({ msg: "User Created Successfully!", token: token });
      }
    );
  } catch (error) {
    console.log(error.message);
  }
});

//@GET Routes
//@DESC Get all the Tweets of Logged in User
router.get("/tweets", auth, async (req, res) => {
  try {
    const tweets = await Tweet.find({ user: req.user.id });
    if (tweets.length == 0) {
      return res.json({ msg: "No Tweets Searched by the User" });
    }
    res.json(tweets);
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = router;
