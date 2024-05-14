const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

app.get("/menu-items", (req, res) => {
  const jsonFilePath = path.join(__dirname, "public/data", "menuItems.json");
  const data = fs.readFileSync(jsonFilePath, "utf8");
  const menuItems = JSON.parse(data);
  res.json(menuItems);
});

const imageStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public/image");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const uploadImage = multer({ storage: imageStorage });

// JSON 데이터 저장
app.post("/upload-data", uploadImage.single("uploadPhoto"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const jsonFilePath = path.join(__dirname, "public/data", "menuItems.json");
  let menuItems = [];

  // 파일이 존재하면 기존 데이터 불러오기
  if (fs.existsSync(jsonFilePath)) {
    const data = fs.readFileSync(jsonFilePath, "utf8");
    menuItems = JSON.parse(data);
  }

  const newItem = {
    name: req.body.foodNameInput,
    time: req.body.cookingTime,
    category: req.body.foodCategory,
    material: req.body.material,
    recipe: req.body.recipe,
    image: req.file.filename,
  };

  menuItems.push(newItem);
  fs.writeFileSync(jsonFilePath, JSON.stringify(menuItems, null, 2));
  res.redirect("/");

});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
