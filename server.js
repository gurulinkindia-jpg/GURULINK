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
  video = "",
  videoType = "video/mp4",
  videoWidth = 0,
  videoHeight = 0,
  url,
  redirectPath
}) {
  const normalizedVideoWidth = Math.max(0, Math.round(Number(videoWidth) || 0));
  const normalizedVideoHeight = Math.max(0, Math.round(Number(videoHeight) || 0));
  const videoSizeMeta = normalizedVideoWidth && normalizedVideoHeight
    ? `
<meta property="og:video:width" content="${normalizedVideoWidth}">
<meta property="og:video:height" content="${normalizedVideoHeight}">`
    : "";
  const videoMeta = video
    ? `
<meta property="og:video" content="${video}">
<meta property="og:video:url" content="${video}">
<meta property="og:video:secure_url" content="${video}">
<meta property="og:video:type" content="${videoType}">${videoSizeMeta}`
    : "";

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
<meta property="og:type" content="${video ? "video.other" : "website"}">
${videoMeta}

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

function inferVideoMimeType(profile) {
  const savedMimeType = String(profile.advertisementVideoMimeType || "").trim();
  if (savedMimeType.startsWith("video/")) {
    return savedMimeType;
  }

  const source = String(
    profile.advertisementVideoStoragePath ||
    profile.advertisementVideoUrl ||
    ""
  ).toLowerCase();

  if (source.includes(".webm")) {
    return "video/webm";
  }
  if (source.includes(".mov")) {
    return "video/quicktime";
  }
  if (source.includes(".ogv") || source.includes(".ogg")) {
    return "video/ogg";
  }

  return "video/mp4";
}

function buildAdvertisementVideoUrl(id, adts) {
  return `https://guru-link.onrender.com/advertisement-video?id=${encodeURIComponent(id)}&adts=${encodeURIComponent(adts)}`;
}

/* Opens the advertisement designer in the phone's external browser. */
app.get("/open-in-browser", (req, res) => {
  const id = String(req.query.id || "").trim();
  const role = req.query.role === "institution" ? "institution" : "teacher";
  const target = new URL(
    "https://www.gurulink.co.in/advertisement-designer.html"
  );

  if (id) {
    target.searchParams.set("id", id);
  }
  target.searchParams.set("role", role);
  res.setHeader("Cache-Control", "no-store");
  res.redirect(302, target.toString());
});

/* Opens the Business/I Card designer in the phone's external browser. */
app.get("/open-business-card-in-browser", (req, res) => {
  const role = req.query.role === "institution" ? "institution" : "teacher";
  const prefill = String(req.query.prefill || "").trim();
  const target = new URL(
    "https://www.gurulink.co.in/BusinessCardDesigner/index.html"
  );

  target.searchParams.set("v", "20260714r");
  target.searchParams.set("role", role);
  if (prefill) {
    target.searchParams.set("prefill", prefill);
  }
  res.setHeader("Cache-Control", "no-store");
  res.redirect(302, target.toString());
});

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
app.get("/advertisement-video", async (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.status(404).send("Advertisement video not found");
  }

  try {
    const result = await fetchProfileById(id);
    const videoUrl = String(
      result && result.profile && result.profile.advertisementVideoUrl || ""
    ).trim();

    if (!videoUrl) {
      return res.status(404).send("Advertisement video not found");
    }

    const requestHeaders = {};
    if (req.headers && req.headers.range) {
      requestHeaders.Range = req.headers.range;
    }

    const videoResponse = await fetch(videoUrl, { headers: requestHeaders });
    if (!videoResponse.ok && videoResponse.status !== 206) {
      return res.status(videoResponse.status || 502).send("Advertisement video unavailable");
    }

    res.status(videoResponse.status);
    for (const headerName of ["content-type", "content-length", "content-range", "accept-ranges"]) {
      const headerValue = videoResponse.headers.get(headerName);
      if (headerValue) {
        res.setHeader(headerName, headerValue);
      }
    }
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Disposition", "inline; filename=gurulink-advertisement.mp4");
    res.setHeader("X-Content-Type-Options", "nosniff");
    videoResponse.body.pipe(res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).send("Server Error");
    }
  }
});

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
    const latestAdvertisementUpdate = Math.max(
      Number(profile.advertisementCardUpdatedAt) || 0,
      Number(profile.advertisementVideoUpdatedAt) || 0,
      Number(profile.updatedAt) || 0
    );
    const adts =
      requestAdts ||
      String(latestAdvertisementUpdate || Date.now());
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
        url: escapeHtml(adUrl),
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
