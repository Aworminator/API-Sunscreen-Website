import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import usZips from "us-zips";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const apiKey = process.env.OPENUV_API_KEY; // Use environment variable

app.get("/", (req, res) => {
  res.render("index.ejs", { uv: null, uvMax: null, zip: null, error: null }); // Render with initial values
});

app.post("/submit", async (req, res) => {
  try {
    const zipcode = req.body.zipCode;
    const location = usZips[zipcode];
    // console.log(`${zipcode}`);

    if (!location) {
      return res.render("index.ejs", {
        error: "Invalid zip code",
        uv: null,
        uvMax: null,
        zip: zipcode,
      });
    }

    const url = `https://api.openuv.io/api/v1/uv?lat=${location.latitude}&lng=${location.longitude}`;

    const response = await axios.get(url, {
      headers: {
        "x-access-token": apiKey,
      },
    });

    const result = response.data;
    console.log(result);
    res.render("index.ejs", {
      uv: result.result.uv,
      uvMax: result.result.uv_max,
      zip: zipcode,
      error: null,
    });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      error: error.message,
      zip: req.body.zipCode,
      uv: null,
      uvMax: null,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
