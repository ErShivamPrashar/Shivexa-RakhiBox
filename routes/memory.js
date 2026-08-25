const express = require("express");
const router = express.Router();

const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const QRCode = require("qrcode");

const Memory = require("../models/memory");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// HOME
router.get("/", async (req, res) => {
  try {
    const totalMemories = await Memory.countDocuments();

    res.render("home", {
      totalMemories
    });
  } catch (error) {
    console.error(error);
    res.render("home", {
      totalMemories: 0
    });
  }
});
// CREATE PAGE
router.get("/create", (req, res) => {
  res.render("create");
});

// CREATE MEMORY
router.post(
  "/create",
  upload.array("photos", 5),
  async (req, res) => {
    try {
      const {
        brotherName,
        sisterName,
        message
      } = req.body;

      if (!brotherName || !sisterName || !message) {
        return res.status(400).send("Please fill all required fields.");
      }

      const memoryId =
        "RK" +
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

      const photoUrls = [];

      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "shivexa-rakhi"
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(file.buffer);
        });

        photoUrls.push(result.secure_url);
      }

      const memory = await Memory.create({
        brotherName,
        sisterName,
        message,
        photos: photoUrls,
        memoryId
      });

      res.redirect(`/memory/${memory.memoryId}`);
    } catch (error) {
      console.log(error);
      res.status(500).send("Something went wrong.");
    }
  }
);

// MEMORY PAGE
router.get("/memory/:id", async (req, res) => {
  try {
    const memory = await Memory.findOne({
      memoryId: req.params.id
    });

    if (!memory) {
      return res.status(404).send("Memory not found");
    }

    const memoryUrl =
      `${req.protocol}://${req.get("host")}/memory/${memory.memoryId}`;

    const qrCode = await QRCode.toDataURL(memoryUrl);

    res.render("memory", {
      memory,
      qrCode
    });

  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;