const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express(); // express 애플리케이션 생성
const PORT = 3000; // 서버 포트 설정

app.use(express.static("public")); // 정적 파일 제공을 위한 폴더 설정
app.use(express.json()); // JSON 요청 본문 파싱을 위한 미들웨어 사용

const storage = multer.memoryStorage();  // 메모리 스토리지 설정
const upload = multer({ storage: storage });


// 메뉴 아이템을 제공하는 라우트
app.get("/menu-items", (req, res) => {
  const jsonFilePath = path.join(__dirname, "public/data", "menuItems.json"); // JSON 파일 경로 설정
  const data = fs.readFileSync(jsonFilePath, "utf8"); // 동기적으로 파일 읽기
  const menuItems = JSON.parse(data); // JSON 파싱
  res.json(menuItems); // 클라이언트에 JSON 데이터 응답
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
app.post("/upload-data", uploadImage.single("uploadPhoto"), (req, res) => {
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

  const newItem = {
    // 새 메뉴 아이템 객체 생성
    name: req.body.foodNameInput,
    time: req.body.cookingTime,
    category: req.body.foodCategory,
    material: req.body.material,
    recipe: req.body.recipe,
    image: req.file.filename,
    userId: req.body.userId // 사용자 ID 추가
  };

  menuItems.push(newItem); // 새 아이템 배열에 추가
  fs.writeFileSync(jsonFilePath, JSON.stringify(menuItems, null, 2)); // 파일에 데이터 저장
  res.redirect("/"); // 메인 페이지로 리디렉트
});


app.listen(PORT, () => {
  // 서버 시작
  console.log(`Server running on http://localhost:${PORT}`);
});
