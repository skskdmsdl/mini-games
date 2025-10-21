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
const gameArea = document.getElementById("gameArea");
const remainingArea = document.getElementById("remainingArea");
const cutLine = document.getElementById("cutLine");
const cutBtn = document.getElementById("cutBtn");
const levelDisplay = document.getElementById("level");
const cutCountDisplay = document.getElementById("cutCount");
const bestScoreDisplay = document.getElementById("bestScore");
const gameOverScreen = document.getElementById("gameOver");
const finalCutCountDisplay = document.getElementById("finalCutCount");
const finalLevelDisplay = document.getElementById("finalLevel");
const finalBestScoreDisplay = document.getElementById("finalBestScore");
const restartBtn = document.getElementById("restartBtn");

// 로컬 스토리지에서 최고 기록 불러오기
function loadBestScore() {
  const saved = localStorage.getItem("cuttingGameBestScore");
  gameState.bestScore = saved ? parseInt(saved) : 0;
  bestScoreDisplay.textContent = gameState.bestScore;
}

// 최고 기록 저장하기
function saveBestScore() {
  if (gameState.cutCount > gameState.bestScore) {
    gameState.bestScore = gameState.cutCount;
    localStorage.setItem(
      "cuttingGameBestScore",
      gameState.bestScore.toString()
    );
    bestScoreDisplay.textContent = gameState.bestScore;
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

  // 전체 높이 설정
  gameState.totalHeight = gameArea.offsetHeight;
  gameState.remainingTop = 0;
  gameState.remainingHeight = gameState.totalHeight;

  updateDisplays();
  updateRemainingArea();
  updateCutLine();

  gameOverScreen.style.display = "none";
  cutBtn.disabled = false;

  // 게임 루프 시작
  if (gameState.animationId) {
    cancelAnimationFrame(gameState.animationId);
  }
  gameLoop();
}

// 디스플레이 업데이트
function updateDisplays() {
  levelDisplay.textContent = gameState.level;
  cutCountDisplay.textContent = gameState.cutCount;
  bestScoreDisplay.textContent = gameState.bestScore;
}

// 남은 영역 업데이트
function updateRemainingArea() {
  remainingArea.style.top = `${gameState.remainingTop}px`;
  remainingArea.style.height = `${gameState.remainingHeight}px`;
}

// 자르기 선 업데이트
function updateCutLine() {
  cutLine.style.top = `${gameState.linePosition}px`;
}

// 자르기 버튼 클릭 이벤트
cutBtn.addEventListener("click", function () {
  if (!gameState.gameActive || gameState.isCutting) return;

  // 즉시 멈춤
  gameState.isCutting = true;
  cutBtn.disabled = true;

  const cutPosition = gameState.linePosition;
  const remainingBottom = gameState.remainingTop + gameState.remainingHeight;

  if (cutPosition < gameState.remainingTop || cutPosition > remainingBottom) {
    saveBestScore();
    endGame();
    return;
  }

  // 즉시 자르기 실행
  executeCut(cutPosition);
});

// 실제 자르기 실행
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

  updateRemainingArea();
  updateDisplays();

  // 바로 게임 재개
  setTimeout(() => {
    gameState.isCutting = false;
    cutBtn.disabled = false;
    gameLoop();
  }, 400);
}

// 자르기 효과 표시
function showCutEffect(start, end) {
  const cutEffect = document.createElement("div");
  cutEffect.className = "cut-effect";
  cutEffect.style.top = `${start}px`;
  cutEffect.style.left = "0";
  cutEffect.style.width = "100%";
  cutEffect.style.height = `${end - start}px`;

  gameArea.appendChild(cutEffect);

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

  if (gameState.linePosition <= 0) {
    gameState.linePosition = 0;
    gameState.lineDirection = 1;
  } else if (gameState.linePosition >= gameState.totalHeight) {
    gameState.linePosition = gameState.totalHeight;
    gameState.lineDirection = -1;
  }

  updateCutLine();
  gameState.animationId = requestAnimationFrame(gameLoop);
}

// 게임 종료
function endGame() {
  gameState.gameActive = false;
  finalCutCountDisplay.textContent = gameState.cutCount;
  finalLevelDisplay.textContent = gameState.level;
  finalBestScoreDisplay.textContent = gameState.bestScore;
  gameOverScreen.style.display = "flex";
  cutBtn.disabled = true;

  if (gameState.animationId) {
    cancelAnimationFrame(gameState.animationId);
  }
}

// 다시 시작
restartBtn.addEventListener("click", initGame);

// 최고 기록 불러오기
loadBestScore();

// 게임 시작
initGame();
