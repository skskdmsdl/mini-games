// 게임 상태
const gameState = {
  active: false,
  score: 0,
  bestScore: 0,
  timeLeft: 10,
  timer: null,
  initialTime: 10,
};

// DOM 요소
const elements = {
  gameArea: document.getElementById("gameArea"),
  smashTarget: document.getElementById("smashTarget"),
  currentScore: document.getElementById("currentScore"),
  timeLeft: document.getElementById("timeLeft"),
  bestScore: document.getElementById("bestScore"),
  finalScore: document.getElementById("finalScore"),
  finalBestScore: document.getElementById("finalBestScore"),
  gameOver: document.getElementById("gameOver"),
  startBtn: document.getElementById("startBtn"),
  restartBtn: document.getElementById("restartBtn"),
  progressBar: document.getElementById("progressBar"),
  timeDisplay: document.getElementById("timeDisplay"),
};

// 로컬 스토리지에서 최고 기록 불러오기
function loadBestScore() {
  const saved = localStorage.getItem("smashGameBestScore");
  gameState.bestScore = saved ? parseInt(saved) : 0;
  elements.bestScore.textContent = gameState.bestScore;
}

// 최고 기록 로컬 스토리지에 저장하기
function saveBestScore() {
  if (gameState.score > gameState.bestScore) {
    gameState.bestScore = gameState.score;
    localStorage.setItem("smashGameBestScore", gameState.bestScore.toString());
    elements.bestScore.textContent = gameState.bestScore;
  }
}

// 게임 초기화
function initGame() {
  // 게임 상태 초기화
  gameState.active = true;
  gameState.score = 0;
  gameState.timeLeft = gameState.initialTime;

  // 버튼 텍스트 변경
  elements.startBtn.textContent = "게임 다시 시작";

  // UI 업데이트
  elements.gameOver.style.display = "none";
  elements.currentScore.textContent = "0";
  elements.timeLeft.textContent = gameState.timeLeft + "초";
  elements.progressBar.style.width = "100%";
  elements.timeDisplay.textContent = gameState.timeLeft + "초 남음";

  // 타이머 시작
  startTimer();
}

// 타이머 시작
function startTimer() {
  if (gameState.timer) {
    clearInterval(gameState.timer);
  }

  gameState.timer = setInterval(() => {
    gameState.timeLeft--;

    // UI 업데이트
    const progressPercent = (gameState.timeLeft / gameState.initialTime) * 100;
    elements.progressBar.style.width = progressPercent + "%";
    elements.timeLeft.textContent = gameState.timeLeft + "초";
    elements.timeDisplay.textContent = gameState.timeLeft + "초 남음";

    // 시간 종료 체크
    if (gameState.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// 버튼 클릭 처리
function handleSmash() {
  if (!gameState.active) return;

  // 점수 증가
  gameState.score++;
  elements.currentScore.textContent = gameState.score;

  // 클릭 효과
  elements.smashTarget.classList.add("hit");
  setTimeout(() => {
    elements.smashTarget.classList.remove("hit");
  }, 200);

  // 모바일 진동 효과
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
}

// 게임 종료
function endGame() {
  gameState.active = false;

  // 타이머 정지
  if (gameState.timer) {
    clearInterval(gameState.timer);
  }

  // 최고 기록 저장
  saveBestScore();

  // 결과 화면 표시
  elements.finalScore.textContent = gameState.score;
  elements.finalBestScore.textContent = gameState.bestScore;
  elements.gameOver.style.display = "flex";
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 게임 시작 버튼
  elements.startBtn.addEventListener("click", initGame);

  // 다시 시작 버튼
  elements.restartBtn.addEventListener("click", initGame);

  // 터치 버튼
  elements.smashTarget.addEventListener("click", handleSmash);

  // 터치 이벤트 (모바일 최적화)
  elements.smashTarget.addEventListener("touchstart", (e) => {
    if (gameState.active) {
      handleSmash();
      e.preventDefault();
    }
  });
}

// 초기화
function initializeGame() {
  loadBestScore();
  setupEventListeners();
}

// 게임 시작
initializeGame();
