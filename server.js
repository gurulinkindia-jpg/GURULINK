const express = require("express");
const fetch = require("node-fetch");

const app = express();

const DATABASE_BASE =
  "https://gurulink-59cc7-default-rtdb.asia-southeast1.firebasedatabase.app";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function fetchProfileById(id) {
  let response = await fetch(
    `${DATABASE_BASE}/institutions/${id}.json`
  );

  let profile = await response.json();
  let role = "institution";

  if (!profile) {
    response = await fetch(
      `${DATABASE_BASE}/teachers/${id}.json`
    );

    profile = await response.json();
    role = "teacher";
  }

  if (!profile) {
    return null;
  }

  return { profile, role };
}

function buildShareHtml({
  title,
  description,
  image,
  url,
  redirectPath
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">

<title>${title}</title>

<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">

<meta http-equiv="refresh" content="0; url=${redirectPath}">

</head>

<body>

Redirecting...

</body>
</html>
  `;
}

function withCacheBust(url, value) {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) {
    return "";
  }

  const separator = cleanUrl.includes("?") ? "&" : "?";
  return `${cleanUrl}${separator}v=${encodeURIComponent(value || Date.now())}`;
}

/* Dynamic profile sharing page */
app.get("/profile-view.html", async (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.status(404).send("Profile not found");
  }

  try {
    const result = await fetchProfileById(id);

    if (!result || !result.profile) {
      return res.status(404).send("Profile not found");
    }

    const profile = result.profile;

    const title = escapeHtml(profile.name || "GURULINK");
    const description = escapeHtml(
      profile.description || "Teacher / Institute Profile"
    );
    const image = escapeHtml(
      profile.logo ||
      profile.profilePic ||
      profile.photo ||
      "https://guru-link.onrender.com/default.png"
    );
    const profileUrl =
      `https://guru-link.onrender.com/profile-view.html?id=${encodeURIComponent(id)}`;

    res.send(
      buildShareHtml({
        title,
        description,
        image,
        url: profileUrl,
        redirectPath: `/profile-view-client.html?id=${encodeURIComponent(id)}`
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

/* Dynamic advertisement sharing page */
app.get("/profile-ad.html", async (req, res) => {
  const id = req.query.id;
  const requestAdts = String(req.query.adts || "").trim();

  if (!id) {
    return res.status(404).send("Profile not found");
  }

  try {
    const result = await fetchProfileById(id);

    if (!result || !result.profile) {
      return res.status(404).send("Profile not found");
    }

    const profile = result.profile;
    const adts =
      requestAdts ||
      String(profile.advertisementCardUpdatedAt || Date.now());
    const roleLabel =
      result.role === "institution"
        ? "Institute Advertisement"
        : "Teacher / Trainer Advertisement";

    const title = escapeHtml(
      (profile.name || "GURULINK") + " Advertisement"
    );
    const description = escapeHtml(
      (profile.advertisementCardData && profile.advertisementCardData.highlight) ||
      profile.description ||
      roleLabel
    );
    const image = escapeHtml(
      withCacheBust(
        profile.advertisementCardImage ||
        profile.logo ||
        profile.profilePic ||
        profile.photo ||
        "https://guru-link.onrender.com/default.png",
        adts
      )
    );
    const adUrl =
      `https://guru-link.onrender.com/profile-ad.html?id=${encodeURIComponent(id)}&adts=${encodeURIComponent(adts)}`;
    const redirectPath =
      `/profile-ad-client.html?id=${encodeURIComponent(id)}&adts=${encodeURIComponent(adts)}`;

    res.send(
      buildShareHtml({
        title,
        description,
        image,
        url: adUrl,
        redirectPath
      })
    );
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
