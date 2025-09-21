const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ftp = require("basic-ftp");

// Step 1: Use temp local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, "../temp_uploads/");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + "-" + file.originalname;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

// Step 2: Helper function to send file to FTP
async function uploadToFTP(localFilePath, remoteFileName) {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: "ftp.eonestep.com", 
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      secure: false,
    });

    // console.log("Connected to FTP");

    // Upload file to /public_html/uploads/
   await client.ensureDir("/domains/eonestep.com/public_html/uploads");

    const remotePath = `/domains/eonestep.com/public_html/uploads/${remoteFileName}`;
    await client.uploadFrom(localFilePath, remotePath);

    // console.log("Uploaded:", remotePath);

    return `https://www.eonestep.com/uploads/${remoteFileName}`;
  } catch (err) {
    console.error("FTP Upload failed:", err);
    throw err;
  } finally {
    client.close();
    // delete local temp file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
}

module.exports = { upload, uploadToFTP };

