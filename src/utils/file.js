const fs = require("fs");
const path = require("path");

const deleteFile = (relativePath) => {
  if (!relativePath) {
    return;
  }

  const filePath =
    path.join(
      process.cwd(),
      "uploads",
      relativePath
    );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  deleteFile,
};