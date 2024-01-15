const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3000; // Choose the port you want to use
app.use(cors({}));

// Set up OAuth2Client with your client ID and client secret
const oauth2Client = new OAuth2Client({
  clientId: process.env.YOUR_CLIENT_ID,
  clientSecret: process.env.YOUR_CLIENT_SECRET,
  redirectUri: process.env.YOUR_REDIRECT_URI,
});

// Get the OAuth2 URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: "https://www.googleapis.com/auth/youtube.upload",
});

console.log(authUrl);

// Set up multer for handling file uploads
const upload = multer({ dest: "uploads/" }); // Choose the folder for temporary file storage

// Endpoint to initiate YouTube authentication
app.get("/initiate-auth", (req, res) => {
  res.redirect(authUrl);
});

// Callback endpoint after user grants permissions
app.get("/oauth2callback", async (req, res) => {
  const authorizationCode = req.query.code;

  try {
    // Exchange authorization code for access and refresh tokens
    const { tokens } = await oauth2Client.getToken(authorizationCode);
    oauth2Client.setCredentials(tokens);

    // Use the YouTube API to upload the video
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const resUpload = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: {
        snippet: {
          title: "video for testing ",
          description: "Uploaded Video Description",
        },
        status: {
          privacyStatus: "public", // You can set this to 'public' if needed
        },
      },
      media: {
        body: fs.createReadStream("uploads/video.mp4"), // Adjust the video file path
      },
    });

    // Handle the successful video upload
    console.log("Video uploaded successfully:", resUpload.data);
    res.send("Video uploaded successfully!");
  } catch (error) {
    // Handle errors
    console.error("Error uploading video:", error.message);
    res.status(500).send("Error uploading video");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
