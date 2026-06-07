const express = require("express");
const fetch = require("node-fetch");

const app = express();

/* Dynamic profile sharing page */
app.get("/profile-view.html", async (req, res) => {

  const id = req.query.id;

  if (!id) {
    return res.status(404).send("Profile not found");
  }

  try {

    let profile = null;

    /* Check institution */
    let response = await fetch(
      `https://gurulink-59cc7-default-rtdb.asia-southeast1.firebasedatabase.app/institutions/${id}.json`
    );

    profile = await response.json();

    /* Check teacher if institution not found */
    if (!profile) {

      response = await fetch(
        `https://gurulink-59cc7-default-rtdb.asia-southeast1.firebasedatabase.app/teachers/${id}.json`
      );

      profile = await response.json();
    }

    if (!profile) {
      return res.status(404).send("Profile not found");
    }

    const title =
      profile.name || "GURULINK";

    const description =
      profile.description ||
      "Teacher / Institute Profile";

    const image =
      profile.logo ||
      "https://guru-link.onrender.com/default.png";

    const profileUrl =
      `https://guru-link.onrender.com/profile-view.html?id=${id}`;

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">

<title>${title}</title>

<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${profileUrl}">
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

  } catch (error) {

    console.error(error);

    res.status(500).send("Server Error");

  }

});

/* Serve static files */
app.use(express.static("."));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "GURULINK server running on port " + PORT
  );

});
