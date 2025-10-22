// 게임 상태
const gameState = {
  level: 1,
  cutCount: 0,
  bestScore: 0,
  remainingTop: 0,
  remainingHeight: 0,
  totalHeight: 0,
  lineSpeed: 1.5,
  lineDirection: 1,
  linePosition: 0,
  gameActive: true,
  animationId: null,
  isCutting: false,
};

// DOM 요소
const elements = {
  gameArea: document.getElementById("gameArea"),
  remainingArea: document.getElementById("remainingArea"),
  cutLine: document.getElementById("cutLine"),
  cutBtn: document.getElementById("cutBtn"),
  level: document.getElementById("level"),
  cutCount: document.getElementById("cutCount"),
  bestScore: document.getElementById("bestScore"),
  gameOver: document.getElementById("gameOver"),
  finalCutCount: document.getElementById("finalCutCount"),
  finalLevel: document.getElementById("finalLevel"),
  finalBestScore: document.getElementById("finalBestScore"),
  restartBtn: document.getElementById("restartBtn"),
};

// 높이 측정 함수
function measureHeights() {
  const rect = elements.gameArea.getBoundingClientRect();
  gameState.totalHeight = Math.max(rect.height, 100);

  // 라인 두께 고려
  const lineThickness = 4;
  gameState._lineMax = Math.max(gameState.totalHeight - lineThickness, 0);
}

// 로컬 스토리지에서 최고 기록 불러오기
function loadBestScore() {
  const saved = localStorage.getItem("cuttingGameBestScore");
  gameState.bestScore = saved ? parseInt(saved) : 0;
  elements.bestScore.textContent = gameState.bestScore;
}

// 최고 기록 저장하기
function saveBestScore() {
  if (gameState.cutCount > gameState.bestScore) {
    gameState.bestScore = gameState.cutCount;
    localStorage.setItem(
      "cuttingGameBestScore",
      gameState.bestScore.toString()
    );
    elements.bestScore.textContent = gameState.bestScore;
  }
}

// 게임 초기화
function initGame() {
  gameState.level = 1;
  gameState.cutCount = 0;
  gameState.lineSpeed = 1.5;
  gameState.lineDirection = 1;
  gameState.linePosition = 0;
  gameState.gameActive = true;
  gameState.isCutting = false;
  gameState.remainingTop = 0;

  // 높이 측정 및 초기화
  setTimeout(() => {
    measureHeights();
    gameState.remainingHeight = gameState.totalHeight;

    updateDisplays();
    updateRemainingArea();
    updateCutLine();
  }, 100);

  elements.gameOver.style.display = "none";
  elements.cutBtn.disabled = false;

  // 게임 루프 시작
  if (gameState.animationId) {
    cancelAnimationFrame(gameState.animationId);
  }
  gameLoop();
}

// 디스플레이 업데이트
function updateDisplays() {
  elements.level.textContent = gameState.level;
  elements.cutCount.textContent = gameState.cutCount;
  elements.bestScore.textContent = gameState.bestScore;
}

// 남은 영역 업데이트
function updateRemainingArea() {
  elements.remainingArea.style.top = `${gameState.remainingTop}px`;
  elements.remainingArea.style.height = `${gameState.remainingHeight}px`;
}

// 자르기 선 업데이트
function updateCutLine() {
  elements.cutLine.style.top = `${gameState.linePosition}px`;
}

// 자르기 실행
function executeCut(cutPosition) {
  const remainingBottom = gameState.remainingTop + gameState.remainingHeight;
  const topPieceSize = cutPosition - gameState.remainingTop;
  const bottomPieceSize = remainingBottom - cutPosition;

  if (topPieceSize < bottomPieceSize) {
    showCutEffect(cutPosition, remainingBottom);
    gameState.remainingHeight = topPieceSize;
  } else {
    showCutEffect(gameState.remainingTop, cutPosition);
    gameState.remainingHeight = bottomPieceSize;
    gameState.remainingTop = cutPosition;
  }

  gameState.cutCount++;
  gameState.level++;
  gameState.lineSpeed += 0.8;

  // 높이 재측정
  measureHeights();

  updateDisplays();
  updateRemainingArea();

  // 게임 재개
  setTimeout(() => {
    gameState.isCutting = false;
    elements.cutBtn.disabled = false;
    gameLoop();
  }, 400);
}

// 자르기 효과
function showCutEffect(start, end) {
  const cutEffect = document.createElement("div");
  cutEffect.className = "cut-effect";
  cutEffect.style.top = `${start}px`;
  cutEffect.style.left = "0";
  cutEffect.style.width = "100%";
  cutEffect.style.height = `${end - start}px`;

  elements.gameArea.appendChild(cutEffect);

  setTimeout(() => {
    cutEffect.style.opacity = "0";
    setTimeout(() => {
      if (cutEffect.parentNode) {
        cutEffect.parentNode.removeChild(cutEffect);
      }
    }, 500);
  }, 300);
}

// 게임 루프
function gameLoop() {
  if (!gameState.gameActive || gameState.isCutting) return;

  gameState.linePosition += gameState.lineSpeed * gameState.lineDirection;

  // 경계 체크
  if (gameState.linePosition <= 0) {
    gameState.linePosition = 0;
    gameState.lineDirection = 1;
  } else if (gameState.linePosition >= gameState._lineMax) {
    gameState.linePosition = gameState._lineMax;
    gameState.lineDirection = -1;
  }

  updateCutLine();
  gameState.animationId = requestAnimationFrame(gameLoop);
}

// 게임 종료
function endGame() {
  gameState.gameActive = false;
  elements.finalCutCount.textContent = gameState.cutCount;
  elements.finalLevel.textContent = gameState.level;
  elements.finalBestScore.textContent = gameState.bestScore;
  elements.gameOver.style.display = "flex";
  elements.cutBtn.disabled = true;

  if (gameState.animationId) {
    cancelAnimationFrame(gameState.animationId);
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  elements.cutBtn.addEventListener("click", function () {
    if (!gameState.gameActive || gameState.isCutting) return;

    gameState.isCutting = true;
    elements.cutBtn.disabled = true;

    const cutPosition = gameState.linePosition;
    const remainingBottom = gameState.remainingTop + gameState.remainingHeight;

    if (cutPosition < gameState.remainingTop || cutPosition > remainingBottom) {
      saveBestScore();
      endGame();
      return;
    }

    executeCut(cutPosition);
  });

  elements.restartBtn.addEventListener("click", initGame);

  window.addEventListener("resize", function () {
    if (!gameState.gameActive) return;

    measureHeights();

    // 위치 보정
    gameState.remainingTop = Math.min(
      gameState.remainingTop,
      gameState.totalHeight
    );
    gameState.remainingHeight = Math.min(
      gameState.remainingHeight,
      Math.max(gameState.totalHeight - gameState.remainingTop, 0)
    );
    gameState.linePosition = Math.min(
      gameState.linePosition,
      gameState._lineMax
    );

    updateRemainingArea();
    updateCutLine();
  });
}

// 초기화
function initializeGame() {
  loadBestScore();
  setupEventListeners();

  // DOM 로딩 대기 후 게임 시작
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGame);
  } else {
    setTimeout(initGame, 100);
  }
}

// 게임 시작
initializeGame();
