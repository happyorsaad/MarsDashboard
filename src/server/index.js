require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");
const { resolve } = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));

const MARS_ROVER_PHOTOS_API_ENDPOINT = `https://api.nasa.gov/mars-photos/api/v1`;

app.get("/roverInfo/:name", (req, res) => {
  const manifestApiEndpoint = `${MARS_ROVER_PHOTOS_API_ENDPOINT}/manifests/${req.params.name}?api_key=${process.env.API_KEY}`;
  const photosApiEndpoint = `${MARS_ROVER_PHOTOS_API_ENDPOINT}/rovers/${req.params.name}/photos?api_key=${process.env.API_KEY}`;

  fetch(manifestApiEndpoint)
    .then((roverManifest) => roverManifest.json())
    .then((manifest) =>
      fetch(`${photosApiEndpoint}&sol=${manifest.photo_manifest.max_sol}`)
    )
    .then((rd) => rd.json())
    .then((roverData) => {
      const photos = roverData.photos;
      if (Array.isArray(photos) && photos.length) {
        const imgUrls = photos.map((photo) => photo.img_src);
        const { id, ...info } = photos[0].rover;
        res.send({
          roverPhotos: imgUrls,
          roverInfo: info,
        });
      } else {
        res.send({
          roverPhotos: [],
          roverInfo: {},
        });
      }
    })
    .catch((err) => {
      console.log("error : ", err);
      res.status(500).send("Could Not Get Data !");
    });
});

app.listen(port, () =>
  console.log(`Mars Dashboard app listening on port ${port}!`)
);
