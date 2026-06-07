const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.get("/profile-view.html", async (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.send("Profile not found");
  }

  try {
    // Check institution first
    let response = await fetch(
      `https://gurulink-59cc7-default-rtdb.asia-southeast1.firebasedatabase.app/institutions/${id}.json`
    );

    let profile = await response.json();

    // If not institution, check teacher
    if (!profile) {
      response = await fetch(
        `https://gurulink-59cc7-default-rtdb.asia-southeast1.firebasedatabase.app/teachers/${id}.json`
      );

      profile = await response.json();
    }

    if (!profile) {
      return res.send("Profile not found");
    }

    const title = profile.name || "GURULINK Profile";
    const image = profile.logo || "https://gurulink.onrender.com/default.png";
    const description =
      profile.description || "Teacher / Institute Profile";

    res.send(`
<!DOCTYPE html>
<html>
<head>

<title>${title}</title>

<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="https://gurulink.onrender.com/profile-view.html?id=${id}">
<meta property="og:type" content="website">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">

<meta http-equiv="refresh"
content="0; url=/profile-view-client.html?id=${id}">

</head>

<body>
Redirecting...
</body>
</html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.use(express.static("."));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});