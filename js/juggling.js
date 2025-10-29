// 게임 상태
const gameState = {
  active: false,
  startTime: 0,
  currentTime: 0,
  bestTime: 0,
  items: [],
  itemCount: 1,
  itemSpeed: 2,
  lastItemAddTime: 0,
  paddleX: 0,
  paddleWidth: 120,
  animationId: null,
  keys: {},
  isMouseOver: false,
};

// DOM 요소
const elements = {
  gameArea: document.getElementById("gameArea"),
  rectangleContainer: document.querySelector(".rectangle-container"),
  jugglingArea: document.querySelector(".juggling-area"),
  currentTime: document.getElementById("currentTime"),
  itemCount: document.getElementById("itemCount"),
  bestTime: document.getElementById("bestTime"),
  finalTime: document.getElementById("finalTime"),
  finalItemCount: document.getElementById("finalItemCount"),
  finalBestTime: document.getElementById("finalBestTime"),
  gameOver: document.getElementById("gameOver"),
  startBtn: document.getElementById("startBtn"),
  restartBtn: document.getElementById("restartBtn"),
  paddle: document.querySelector(".paddle"),
};

// 색상 팔레트 (다양한 공 색상)
const colorPalette = [
  "linear-gradient(135deg, #0ea5a1, #0f766e)", // 테마 컬러
  "linear-gradient(135deg, #ef4444, #dc2626)", // 빨강
  "linear-gradient(135deg, #f59e0b, #d97706)", // 주황
  "linear-gradient(135deg, #10b981, #059669)", // 초록
  "linear-gradient(135deg, #3b82f6, #2563eb)", // 파랑
  "linear-gradient(135deg, #8b5cf6, #7c3aed)", // 보라
  "linear-gradient(135deg, #ec4899, #db2777)", // 분홍
  "linear-gradient(135deg, #06b6d4, #0891b2)", // 시안
  "linear-gradient(135deg, #84cc16, #65a30d)", // 라임
  "linear-gradient(135deg, #f97316, #ea580c)", // 오렌지
];

// 로컬 스토리지에서 최고 기록 불러오기
function loadBestTime() {
  const saved = localStorage.getItem("jugglingGameBestTime");
  gameState.bestTime = saved ? parseFloat(saved) : 0;
  elements.bestTime.textContent = gameState.bestTime.toFixed(2) + "s";
}

// 최고 기록 저장하기
function saveBestTime() {
  if (gameState.currentTime > gameState.bestTime) {
    gameState.bestTime = gameState.currentTime;
    localStorage.setItem("jugglingGameBestTime", gameState.bestTime.toString());
    elements.bestTime.textContent = gameState.bestTime.toFixed(2) + "s";
  }
}

// 게임 초기화
function initGame() {
  // 게임 상태 초기화
  gameState.active = true;
  gameState.startTime = Date.now();
  gameState.currentTime = 0;
  gameState.items = [];
  gameState.itemCount = 1;
  gameState.itemSpeed = 2;
  gameState.lastItemAddTime = 0;
  gameState.keys = {};
  gameState.isMouseOver = false;

  // 버튼 텍스트 변경
  elements.startBtn.textContent = "게임 다시 시작";

  // 패들 초기 위치 설정 (중앙)
  const gameWidth = elements.jugglingArea.offsetWidth;
  gameState.paddleX = (gameWidth - gameState.paddleWidth) / 2;
  updatePaddlePosition();

  // 기존 아이템 제거
  document.querySelectorAll(".item").forEach((item) => item.remove());

  // 첫 아이템 생성
  createItem();

  // UI 업데이트
  elements.gameOver.style.display = "none";
  elements.currentTime.textContent = "0.00s";
  elements.itemCount.textContent = "1";

  // 게임 루프 시작
  if (gameState.animationId) {
    cancelAnimationFrame(gameState.animationId);
  }
  gameLoop();
}

// 패들 위치 업데이트
function updatePaddlePosition() {
  elements.paddle.style.left = `${gameState.paddleX}px`;
}

// 패들 이동 처리
function movePaddle() {
  if (!gameState.active) return;

  const gameWidth = elements.jugglingArea.offsetWidth;
  const moveSpeed = 15;

  // 키보드 입력 처리
  if (gameState.keys["ArrowLeft"] || gameState.keys["KeyA"]) {
    gameState.paddleX = Math.max(0, gameState.paddleX - moveSpeed);
  }
  if (gameState.keys["ArrowRight"] || gameState.keys["KeyD"]) {
    gameState.paddleX = Math.min(
      gameWidth - gameState.paddleWidth,
      gameState.paddleX + moveSpeed
    );
  }

  updatePaddlePosition();
}

// 아이템 생성
function createItem() {
  const item = document.createElement("div");
  item.className = "item";

  // 랜덤 크기 (20px ~ 40px)
  const size = Math.floor(Math.random() * 20) + 20;
  item.style.width = `${size}px`;
  item.style.height = `${size}px`;

  // 랜덤 위치 (상단)
  const maxX = elements.jugglingArea.offsetWidth - size;
  const x = Math.floor(Math.random() * maxX);
  item.style.left = `${x}px`;
  item.style.top = "0px";

  // 랜덤 색상
  const colorIndex = Math.floor(Math.random() * colorPalette.length);
  item.style.background = colorPalette[colorIndex];

  // 아이템 속도와 방향
  const itemData = {
    element: item,
    x: x,
    y: 0,
    speedX: (Math.random() - 0.5) * 4,
    speedY: gameState.itemSpeed,
    size: size,
  };

  gameState.items.push(itemData);
  elements.jugglingArea.appendChild(item);
}

// 게임 루프
function gameLoop() {
  if (!gameState.active) return;

  // 시간 업데이트
  gameState.currentTime = (Date.now() - gameState.startTime) / 1000;
  elements.currentTime.textContent = gameState.currentTime.toFixed(2) + "s";

  // 일정 시간마다 아이템 추가 (무한대로)
  if (gameState.currentTime - gameState.lastItemAddTime > 5) {
    gameState.itemCount++;
    gameState.lastItemAddTime = gameState.currentTime;
    elements.itemCount.textContent = gameState.itemCount;
    createItem();
  }

  // 아이템 속도 증가
  gameState.itemSpeed = 2 + gameState.currentTime * 0.05;

  // 패들 이동 처리
  movePaddle();

  // 아이템 이동
  moveItems();

  // 게임 오버 체크
  checkGameOver();

  // 다음 프레임
  gameState.animationId = requestAnimationFrame(gameLoop);
}

// 아이템 이동
function moveItems() {
  const gameWidth = elements.jugglingArea.offsetWidth;
  const gameHeight = elements.jugglingArea.offsetHeight;
  const paddleRect = {
    left: gameState.paddleX,
    right: gameState.paddleX + gameState.paddleWidth,
    top: gameHeight - 30,
    bottom: gameHeight - 10,
  };

  gameState.items.forEach((item) => {
    // 위치 업데이트
    item.x += item.speedX;
    item.y += item.speedY;

    // 벽 충돌 체크
    if (item.x <= 0 || item.x + item.size >= gameWidth) {
      item.speedX *= -1;
      item.x = item.x <= 0 ? 0 : gameWidth - item.size;
    }

    // 천장 충돌 체크
    if (item.y <= 0) {
      item.speedY *= -1;
      item.y = 0;
    }

    // 패들과의 충돌 체크
    const itemRect = {
      left: item.x,
      right: item.x + item.size,
      top: item.y,
      bottom: item.y + item.size,
    };

    if (
      itemRect.bottom >= paddleRect.top &&
      itemRect.top <= paddleRect.bottom &&
      itemRect.right >= paddleRect.left &&
      itemRect.left <= paddleRect.right
    ) {
      // 패들 중앙 기준으로 튕기는 방향 조절
      const paddleCenter = paddleRect.left + gameState.paddleWidth / 2;
      const itemCenter = itemRect.left + item.size / 2;
      const hitPosition =
        (itemCenter - paddleCenter) / (gameState.paddleWidth / 2);

      item.speedX = hitPosition * 5;
      item.speedY = -gameState.itemSpeed;
      item.y = paddleRect.top - item.size;

      // 히트 효과
      item.element.classList.add("hit");
      setTimeout(() => {
        item.element.classList.remove("hit");
      }, 100);
    }

    // 위치 적용
    item.element.style.left = `${item.x}px`;
    item.element.style.top = `${item.y}px`;
  });
}

// 게임 오버 체크
function checkGameOver() {
  const gameHeight = elements.jugglingArea.offsetHeight;

  for (const item of gameState.items) {
    if (item.y + item.size >= gameHeight) {
      endGame();
      return;
    }
  }
}

// 게임 종료
function endGame() {
  saveBestTime();

  gameState.active = false;
  elements.finalTime.textContent = gameState.currentTime.toFixed(2) + "s";
  elements.finalItemCount.textContent = gameState.itemCount;
  elements.finalBestTime.textContent = gameState.bestTime.toFixed(2) + "s";
  elements.gameOver.style.display = "flex";

  if (gameState.animationId) {
    cancelAnimationFrame(gameState.animationId);
  }
}

// 아이템 클릭 핸들러
function handleItemClick(e) {
  if (!gameState.active) return;

  const clickedItem = e.target;
  if (!clickedItem.classList.contains("item")) return;

  // 클릭된 아이템 찾기
  const itemData = gameState.items.find((item) => item.element === clickedItem);
  if (itemData) {
    // 위로 튕기기
    itemData.speedY = -gameState.itemSpeed * 1.2;

    // 히트 효과
    clickedItem.classList.add("hit");
    setTimeout(() => {
      clickedItem.classList.remove("hit");
    }, 100);
  }
}

// 모든 아이템 튕기기
function jumpAllItems() {
  if (!gameState.active) return;

  gameState.items.forEach((item) => {
    item.speedY = -gameState.itemSpeed * 1.2;

    item.element.classList.add("hit");
    setTimeout(() => {
      item.element.classList.remove("hit");
    }, 100);
  });
}

// PC: 마우스 따라 패들 이동
function handleMouseMove(e) {
  if (!gameState.active || !gameState.isMouseOver) return;

  const gameRect = elements.jugglingArea.getBoundingClientRect();
  const mouseX = e.clientX - gameRect.left;

  // 패들 중심을 마우스 위치에 맞춤
  gameState.paddleX = Math.max(
    0,
    Math.min(
      gameRect.width - gameState.paddleWidth,
      mouseX - gameState.paddleWidth / 2
    )
  );

  updatePaddlePosition();
}

// 모바일: 터치로 패들 이동
function handleTouchMove(e) {
  if (!gameState.active) return;

  const gameRect = elements.jugglingArea.getBoundingClientRect();
  const touchX = e.touches[0].clientX - gameRect.left;

  // 패들 중심을 터치 위치에 맞춤
  gameState.paddleX = Math.max(
    0,
    Math.min(
      gameRect.width - gameState.paddleWidth,
      touchX - gameState.paddleWidth / 2
    )
  );

  updatePaddlePosition();
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 게임 시작 버튼
  elements.startBtn.addEventListener("click", initGame);

  // 다시 시작 버튼
  elements.restartBtn.addEventListener("click", initGame);

  // 아이템 클릭
  elements.jugglingArea.addEventListener("click", handleItemClick);

  // 키보드 컨트롤
  document.addEventListener("keydown", (e) => {
    gameState.keys[e.code] = true;

    if (e.code === "Space") {
      jumpAllItems();
      e.preventDefault();
    }
  });

  document.addEventListener("keyup", (e) => {
    gameState.keys[e.code] = false;
  });

  // PC: 마우스 따라 패들 이동
  elements.jugglingArea.addEventListener("mouseenter", () => {
    gameState.isMouseOver = true;
  });

  elements.jugglingArea.addEventListener("mouseleave", () => {
    gameState.isMouseOver = false;
  });

  elements.jugglingArea.addEventListener("mousemove", handleMouseMove);

  // 모바일: 터치로 패들 이동
  elements.jugglingArea.addEventListener("touchmove", (e) => {
    e.preventDefault();
    handleTouchMove(e);
  });

  elements.jugglingArea.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleTouchMove(e);
  });
}

// 초기화
function initializeGame() {
  loadBestTime();
  setupEventListeners();

  // 패들 초기 위치 설정
  const gameWidth = elements.jugglingArea.offsetWidth;
  gameState.paddleX = (gameWidth - gameState.paddleWidth) / 2;
  updatePaddlePosition();

  // TODO: 높이 초기화 필요
  setTimeout(initGame, 100);
}

// 게임 시작
initializeGame();
