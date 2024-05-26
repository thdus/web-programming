const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const app = express(); // express 애플리케이션 생성
const PORT = 3000; // 서버 포트 설정

app.use(express.static("public")); // 정적 파일 제공을 위한 폴더 설정
app.use(express.json()); // JSON 요청 본문 파싱을 위한 미들웨어 사용

const storage = multer.memoryStorage();  // 메모리 스토리지 설정
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

// 메뉴 아이템을 제공하는 라우트
app.get("/menu-items", (req, res) => {
  const jsonFilePath = path.join(__dirname, "public/data", "menuItems.json"); // JSON 파일 경로 설정
  const data = fs.readFileSync(jsonFilePath, "utf8"); // 동기적으로 파일 읽기
  const menuItems = JSON.parse(data); // JSON 파싱
  res.json(menuItems); // 클라이언트에 JSON 데이터 응답
});

// 특정 사용자의 레시피를 제공하는 라우트
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

  console.log("Received registration data:", { studentId, name, username, password });

  if (!fs.existsSync(usersFilePath)) {
    console.log("users.json does not exist. Creating new file.");
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
  }

  const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  console.log("Current users data:", usersData);

  const userExists = usersData.some(user => user.username === username);
  console.log("User exists:", userExists);

  if (userExists) {
    return res.status(400).json({ message: "이미 존재하는 ID입니다." });
  }

  const newUser = { studentId, name, username, password };
  usersData.push(newUser);
  fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

  console.log("New user added:", newUser);
  res.status(201).json({ message: "회원가입이 완료되었습니다." });
});


// 사용자 이름(ID) 중복 확인 라우트
app.get("/check-username", (req, res) => {
  const { username } = req.query;

  console.log("Checking username availability for:", username);

  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
  }

  const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  const userExists = usersData.some(user => user.username === username);

  console.log("User exists:", userExists);
  res.json({ exists: userExists });
});



// JSON 데이터와 이미지를 업로드하는 POST 라우트
const imageStorage = multer.diskStorage({
  // 이미지 저장 설정
  destination: function (req, file, callback) {
    // 이미지 저장 경로 설정
    callback(null, "public/image");
  },
  filename: function (req, file, callback) {
    // 저장할 파일 이름 설정
    callback(null, file.originalname);
  },
});

const uploadImage = multer({ storage: imageStorage }); // 이미지 업로드 처리를 위한 multer 설정

// JSON 데이터와 이미지를 업로드하는 POST 라우트
app.post("/upload-data", uploadImage.single("uploadPhoto"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded"); // 파일이 업로드되지 않았을 경우 에러 처리
  }

  const jsonFilePath = path.join(__dirname, "public/data", "menuItems.json"); // JSON 파일 경로 설정
  let menuItems = []; // 메뉴 아이템 배열 초기화

  if (fs.existsSync(jsonFilePath)) {
    // 파일 존재 여부 확인
    const data = fs.readFileSync(jsonFilePath, "utf8"); // 파일 읽기
    menuItems = JSON.parse(data); // 기존 데이터 파싱
  }
  const nutritionInfo = await getFoodNutritionInfo(req.body.foodNameInput);
  const newItem = {
    // 새 메뉴 아이템 객체 생성
    name: req.body.foodNameInput,
    time: req.body.cookingTime,
    category: req.body.foodCategory,
    material: req.body.material,
    recipe: req.body.recipe,
    image: req.file.filename,
    userId: req.body.userId,// 사용자 ID 추가
    nutrition: nutritionInfo,
    updatedAt: new Date().toISOString()
  };

  menuItems.push(newItem); // 새 아이템 배열에 추가
  fs.writeFileSync(jsonFilePath, JSON.stringify(menuItems, null, 2)); // 파일에 데이터 저장
  res.redirect(`/index.html?user=${req.body.userId}`);
});

//좋아요 버튼 정보
app.post("/like-recipe", upload.none(), (req, res) => {
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

  recipe.likes = (recipe.likes || 0) + 1;

  if (!user.likedRecipes) {
    user.likedRecipes = [];
  }

  if (!user.likedRecipes.includes(recipeName)) {
    user.likedRecipes.push(recipeName);
  }

  fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
  fs.writeFileSync(path.join(__dirname, "public/data", "menuItems.json"), JSON.stringify(menuItemsData, null, 2));

  res.status(200).json({ message: "Liked recipes updated", likes: recipe.likes });
});


app.get("/liked-recipes", (req, res) => {
  const { userId } = req.query;
  const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  const user = usersData.find(user => user.username === userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user.likedRecipes);
});



app.listen(PORT, () => {
  // 서버 시작
  console.log(`Server running on http://localhost:${PORT}`);
});



// 회원 정보 업데이트 라우트
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

// Handle bulk deleting recipes
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