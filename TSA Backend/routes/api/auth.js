const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
require("dotenv").config();

//@POST Route
//@DESC Login Route
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    var user = await User.findOne({ email });
    if (!user) {
      return res.json({ msg: "User Doesnt Exists!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ msg: "Invalid Credentials!" });
    }
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      process.env.jwtSecret,
      {
        expiresIn: 360000000000,
      },
      (err, token) => {
        if (err) throw err;
        return res.json({ msg: "User Signed in Sux sex fully", token: token });
      }
    );
  } catch (error) {
    console.log(error.message);
  }
});
module.exports = router;
