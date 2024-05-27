const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const app = express(); 
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const API_KEY = "bblWRDviGiHeESuXlBgA7YwwG/d1Ur+OEg+RbtiIjcbF3UaECl2X2wN/r5Le3OkF7VhcSouZkovjpfHu3fwPpg==";
const API_URL = "http://apis.data.go.kr/1471000/FoodNtrIrdntInfoService1/getFoodNtrItdntList1";

const getFoodNutritionInfo = async (foodName) => {
  const params = {
    serviceKey: API_KEY,
    desc_kor: foodName,
    type: "json",
    pageNo: 1,
    numOfRows: 1,
  };

  try {
    const response = await axios.get(API_URL, { params });
    const foodData = response.data.body.items[0];
    return {
      calories: foodData.NUTR_CONT1,
      carbohydrate: foodData.NUTR_CONT2,
      protein: foodData.NUTR_CONT3,
      fat: foodData.NUTR_CONT4,
      sugars: foodData.NUTR_CONT5,
      sodium: foodData.NUTR_CONT6,
      cholesterol: foodData.NUTR_CONT7,
      saturatedFat: foodData.NUTR_CONT8,
      transFat: foodData.NUTR_CONT9,
    };
  } catch (error) {
    console.error("Error fetching food nutrition info:", error);
    return null;
  }
};

app.get("/recipe-detail/:id", (req, res) => {
  const { id } = req.params;
  const jsonFilePath = path.join(__dirname, "public/data", "menuItems.json");
  const data = fs.readFileSync(jsonFilePath, "utf8");
  const menuItems = JSON.parse(data);
  const recipe = menuItems.find(item => item.id === id);

  if (!recipe) {
    return res.status(404).send("Recipe not found");
  }

  res.json(recipe);
});

app.get("/menu-items", (req, res) => {
  const jsonFilePath = path.join(__dirname, "public/data", "menuItems.json");
  if (fs.existsSync(jsonFilePath)) {
    const data = fs.readFileSync(jsonFilePath, "utf8");
    const menuItems = JSON.parse(data);
    res.json(menuItems);
  } else {
    res.status(404).send("No menu items found");
  }
});

app.get("/user-recipes", (req, res) => {
  const { userId } = req.query;
  const jsonFilePath = path.join(__dirname, "public/data", "menuItems.json");
  const data = fs.readFileSync(jsonFilePath, "utf8");
  const menuItems = JSON.parse(data);
  const userRecipes = menuItems.filter(item => item.userId === userId);
  res.json(userRecipes);
});

const usersFilePath = path.join(__dirname, "public/data", "users.json");

app.post("/register", upload.none(), (req, res) => {
  const { studentId, name, username, password } = req.body;

  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
  }

  const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  const userExists = usersData.some(user => user.username === username);

  if (userExists) {
    return res.status(400).json({ message: "이미 존재하는 ID입니다." });
  }

  const newUser = { studentId, name, username, password };
  usersData.push(newUser);
  fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

  res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

app.get("/check-username", (req, res) => {
  const { username } = req.query;

  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
  }

  const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  const userExists = usersData.some(user => user.username === username);
  res.json({ exists: userExists });
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

app.post("/upload-data", uploadImage.single("uploadPhoto"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const jsonFilePath = path.join(__dirname, "public/data", "menuItems.json");
  let menuItems = [];

  if (fs.existsSync(jsonFilePath)) {
    const data = fs.readFileSync(jsonFilePath, "utf8");
    menuItems = JSON.parse(data);
  }

  const nutritionInfo = await getFoodNutritionInfo(req.body.foodNameInput);
  const newItem = {
    name: req.body.foodNameInput,
    time: req.body.cookingTime ,
    category: req.body.foodCategory,
    material: req.body.material ,
    recipe: req.body.recipe ,
    image: req.file.filename,
    userId: req.body.userId || "unknown",
    nutrition: nutritionInfo || {},
    updatedAt: new Date().toISOString(),
    likes: 0
  };

  menuItems.push(newItem);
  fs.writeFileSync(jsonFilePath, JSON.stringify(menuItems, null, 2));
  res.redirect(`/index.html?user=${req.body.userId}`);
});


app.post("/toggle-like-recipe", upload.none(), (req, res) => {
  const { userId, recipeName } = req.body;

  const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  const menuItemsData = JSON.parse(fs.readFileSync(path.join(__dirname, "public/data", "menuItems.json"), "utf8"));

  const user = usersData.find(user => user.username === userId);
  const recipe = menuItemsData.find(item => item.name === recipeName);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }

  if (!user.likedRecipes) {
    user.likedRecipes = [];
  }

  if (user.likedRecipes.includes(recipeName)) {
    recipe.likes = (recipe.likes || 0) - 1;
    user.likedRecipes = user.likedRecipes.filter(item => item !== recipeName);
  } else {
    recipe.likes = (recipe.likes || 0) + 1;
    user.likedRecipes.push(recipeName);
  }

  fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
  fs.writeFileSync(path.join(__dirname, "public/data", "menuItems.json"), JSON.stringify(menuItemsData, null, 2));

  res.status(200).json({ message: "Like toggled", likes: recipe.likes, liked: user.likedRecipes.includes(recipeName) });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/liked-recipes", (req, res) => {
  const { userId } = req.query;
  const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  const menuItemsData = JSON.parse(fs.readFileSync(path.join(__dirname, "public/data", "menuItems.json"), "utf8"));

  const user = usersData.find(user => user.username === userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const likedRecipes = menuItemsData.filter(item => user.likedRecipes.includes(item.name));

  res.json(likedRecipes);
});

app.post("/update-user", (req, res) => {
  const { studentId, updatedUser } = req.body;

  if (!fs.existsSync(usersFilePath)) {
    return res.status(404).json({ message: "사용자 데이터를 찾을 수 없습니다." });
  }

  const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  const userIndex = usersData.findIndex(user => user.studentId === studentId);

  if (userIndex === -1) {
    return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
  }

  usersData[userIndex] = { ...usersData[userIndex], ...updatedUser };
  fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

  res.status(200).json({ message: "회원 정보가 성공적으로 변경됐습니다", success: true });
});

app.post("/delete-recipe", (req, res) => {
  const { recipeName, userId } = req.body;

  const jsonFilePath = path.join(__dirname, "public/data", "menuItems.json");
  let menuItems = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

  const recipeIndex = menuItems.findIndex(item => item.name === recipeName && item.userId === userId);
  if (recipeIndex > -1) {
    menuItems.splice(recipeIndex, 1);
    fs.writeFileSync(jsonFilePath, JSON.stringify(menuItems, null, 2));
    res.status(200).json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "Recipe not found" });
  }
});

app.post("/bulk-delete-recipes", (req, res) => {
  const { recipeNames, userId } = req.body;

  const jsonFilePath = path.join(__dirname, "public/data", "menuItems.json");
  let menuItems = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

  recipeNames.forEach(recipeName => {
    const recipeIndex = menuItems.findIndex(item => item.name === recipeName && item.userId === userId);
    if (recipeIndex > -1) {
      menuItems.splice(recipeIndex, 1);
    }
  });

  fs.writeFileSync(jsonFilePath, JSON.stringify(menuItems, null, 2));
  res.status(200).json({ success: true });
});
