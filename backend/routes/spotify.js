import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/login", (req, res) => {
  const CLIENT_ID = process.env.CLIENT_ID;
  const REDIRECT_URI = process.env.REDIRECT_URI;
  const scopes = "user-read-private user-read-email";
  const mood = req.query.mood;
  const state = encodeURIComponent(JSON.stringify({ mood }));

  res.redirect(
    "https://accounts.spotify.com/authorize" +
      "?response_type=code" +
      "&client_id=" +
      CLIENT_ID +
      "&state=" +
      state +
      (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
      "&redirect_uri=" +
      encodeURIComponent(REDIRECT_URI)
  );
});

router.get("/callback", async (req, res) => {
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;
  if (req.query.error) {
    return res.send("Error occurred while logging in");
  }
  const authorizationCode = req.query.code;

  const state = JSON.parse(decodeURIComponent(req.query.state));
  const { mood } = state;

  try {
    const response = await axios({
      url: "https://accounts.spotify.com/api/token",
      method: "post",
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
        code: authorizationCode,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const { access_token, refresh_token } = response.data;
    // redirect user to the frontend application with `access_token`
    // Update this with your frontend application's actual URI
    res.redirect(
      `http://localhost:3000/Search?access_token=${access_token}&mood=${mood}`
    );
  } catch (error) {
    console.log(error);
    return res.send("Error occurred while logging in");
  }
});

export default router;
