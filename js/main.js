// 게임 관리 클래스
class GameManager {
  constructor() {
    this.currentGame = null;
    this.games = {
      cutting: {
        name: "네모칸 자르기",
        file: "games/cutting.html",
        css: "css/cutting.css",
        js: "js/cutting.js",
      },
      memory: {
        name: "컬러 메모리",
        file: "games/memory.html",
        css: "css/memory.css",
        js: "js/memory.js",
      },
      balance: {
        name: "에너지 밸런스",
        file: "games/balance.html",
        css: "css/balance.css",
        js: "js/balance.js",
      },
      rhythm: {
        name: "리듬 탭",
        file: "games/rhythm.html",
        css: "css/rhythm.css",
        js: "js/rhythm.js",
      },
      puzzle: {
        name: "숫자 퍼즐",
        file: "games/puzzle.html",
        css: "css/puzzle.css",
        js: "js/puzzle.js",
      },
    };
    this.basePath = this.getBasePath();

    // 생성자에서 직접 초기화 메서드 호출
    this.bindEvents();
    this.loadStats();

    // URL 파라미터 확인 및 게임 로드
    this.checkUrlParams();
  }

  // 기본 경로 계산
  getBasePath() {
    const path = window.location.pathname;
    if (path.includes("/games/")) {
      return "../";
    }
    return "./";
  }

  bindEvents() {
    // 햄버거 메뉴 토글
    const menuToggle = document.getElementById("menuToggle");
    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        this.toggleSidebar();
      });
    }

    // 사이드바 닫기
    const sidebarClose = document.getElementById("sidebarClose");
    if (sidebarClose) {
      sidebarClose.addEventListener("click", () => {
        this.closeSidebar();
      });
    }

    // 오버레이 클릭 시 사이드바 닫기
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", () => {
        this.closeSidebar();
      });
    }

    // 사이드바 게임 클릭 이벤트
    document.querySelectorAll(".game-item").forEach((item) => {
      item.addEventListener("click", () => {
        const gameId = item.dataset.game;
        this.selectGame(gameId);
        this.closeSidebar();
      });
    });

    // 메인 페이지 게임 카드 클릭 이벤트
    document.querySelectorAll(".game-card").forEach((card) => {
      card.addEventListener("click", () => {
        const gameId = card.dataset.game;
        this.selectGame(gameId);
      });
    });
  }

  toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar && overlay) {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
    }
  }

  closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar && overlay) {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    }
  }

  // URL 파라미터 확인
  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get("game");
    if (gameParam && this.games[gameParam]) {
      this.selectGame(gameParam);
    }
  }

  selectGame(gameId) {
    // 현재 게임 비활성화
    if (this.currentGame) {
      const prevItem = document.querySelector(
        `.game-item[data-game="${this.currentGame}"]`
      );
      const prevContainer = document.getElementById(`${this.currentGame}Game`);

      if (prevItem) prevItem.classList.remove("active");
      if (prevContainer) prevContainer.classList.remove("active");
    }

    // 새 게임 활성화
    this.currentGame = gameId;

    const currentItem = document.querySelector(
      `.game-item[data-game="${gameId}"]`
    );
    if (currentItem) {
      currentItem.classList.add("active");
    }

    // 웰컴 스크린 숨기기
    const welcomeScreen = document.getElementById("welcomeScreen");
    if (welcomeScreen) {
      welcomeScreen.classList.remove("active");
    }

    // 게임 컨테이너 표시
    const gameContainer = document.getElementById(`${gameId}Game`);
    if (gameContainer) {
      gameContainer.classList.add("active");

      // 게임 로드
      this.loadGame(gameId, gameContainer);
    }

    // 헤더 타이틀 변경
    const headerTitle = document.querySelector(".header-title");
    if (headerTitle) {
      headerTitle.textContent = this.games[gameId].name;
    }

    // URL 업데이트 (히스토리 관리)
    window.history.pushState({ game: gameId }, "", `?game=${gameId}`);

    // 통계 업데이트
    this.updateStats(gameId);
  }

  async loadGame(gameId, container) {
    const game = this.games[gameId];
    if (!game) return;

    try {
      // 게임 HTML 로드
      const response = await fetch(this.basePath + game.file);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();

      // 컨테이너에 게임 내용 삽입
      container.innerHTML = html;

      // 게임별 CSS/JS 로드
      await this.loadGameAssets(gameId);
    } catch (error) {
      console.error(`게임 로드 실패: ${gameId}`, error);
      this.showErrorScreen(container, error);
    }
  }

  async loadGameAssets(gameId) {
    const game = this.games[gameId];

    // CSS 로드 (이미 로드되었는지 확인)
    const existingCss = document.querySelector(
      `link[href="${this.basePath + game.css}"]`
    );
    if (!existingCss) {
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = this.basePath + game.css;
      document.head.appendChild(cssLink);
    }

    // JS 로드 (동적으로)
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[src="${this.basePath + game.js}"]`
      );
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = this.basePath + game.js;
      script.onload = () => {
        console.log(`${gameId} 게임 로드 완료`);
        resolve();
      };
      script.onerror = (error) => {
        console.error(`${gameId} 스크립트 로드 실패:`, error);
        reject(error);
      };
      document.body.appendChild(script);
    });
  }

  showErrorScreen(container, error) {
    container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; flex-direction: column; gap: 20px; padding: 40px; text-align: center;">
                <div style="font-size: 4rem;">😅</div>
                <h2 style="font-size: 1.5rem; color: #64748b;">게임을 불러오는데 실패했습니다</h2>
                <p style="color: #94a3b8;">${error.message}</p>
                <button onclick="window.gameManager.showWelcomeScreen()" style="background: #0ea5a1; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">메인으로 돌아가기</button>
            </div>
        `;
  }

  loadStats() {
    // 로컬 스토리지에서 통계 로드
    const stats = JSON.parse(localStorage.getItem("gameStats") || "{}");

    // 총 플레이 수 계산
    const totalPlays = Object.values(stats).reduce(
      (sum, game) => sum + (game.plays || 0),
      0
    );

    const totalPlaysElement = document.getElementById("totalPlays");
    if (totalPlaysElement) {
      totalPlaysElement.textContent = totalPlays;
    }

    // 최고 기록 계산
    const totalBestScore = Object.values(stats).reduce(
      (max, game) => Math.max(max, game.bestScore || 0),
      0
    );

    const totalBestScoreElement = document.getElementById("totalBestScore");
    if (totalBestScoreElement) {
      totalBestScoreElement.textContent = totalBestScore;
    }
  }

  updateStats(gameId) {
    const stats = JSON.parse(localStorage.getItem("gameStats") || "{}");

    if (!stats[gameId]) {
      stats[gameId] = { plays: 0, bestScore: 0 };
    }

    stats[gameId].plays = (stats[gameId].plays || 0) + 1;
    localStorage.setItem("gameStats", JSON.stringify(stats));

    this.loadStats();
  }

  showWelcomeScreen() {
    if (this.currentGame) {
      const currentItem = document.querySelector(
        `.game-item[data-game="${this.currentGame}"]`
      );
      const currentContainer = document.getElementById(
        `${this.currentGame}Game`
      );

      if (currentItem) currentItem.classList.remove("active");
      if (currentContainer) currentContainer.classList.remove("active");

      this.currentGame = null;
    }

    const welcomeScreen = document.getElementById("welcomeScreen");
    if (welcomeScreen) {
      welcomeScreen.classList.add("active");
    }

    const headerTitle = document.querySelector(".header-title");
    if (headerTitle) {
      headerTitle.textContent = "미니게임 천국";
    }

    // URL 초기화
    window.history.pushState({}, "", window.location.pathname);
  }

  // 뒤로가기 처리
  handlePopState(event) {
    if (event.state && event.state.game) {
      this.selectGame(event.state.game);
    } else {
      this.showWelcomeScreen();
    }
  }
}

// 앱 초기화
document.addEventListener("DOMContentLoaded", () => {
  window.gameManager = new GameManager();

  // 뒤로가기 처리
  window.addEventListener("popstate", (event) => {
    window.gameManager.handlePopState(event);
  });
});
