(() => {
  "use strict";

  const app = document.getElementById("app");
  const starsLayer = document.getElementById("stars");
  const auroraLayer = document.getElementById("aurora");
  const progressBar = document.getElementById("progressBar");
  const musicButton = document.getElementById("musicButton");
  const backgroundMusic = document.getElementById("backgroundMusic");

  if (!app || !starsLayer || !auroraLayer || !progressBar || !musicButton || !backgroundMusic) {
    console.error("Aurora: faltan elementos base en el HTML.");
    return;
  }

  const PHOTO_SLIDES = [
    { src: "assents/images/foto2.PNG", caption: "Todavía recuerdo este momento...", hold: 3000 },
    { src: "assents/images/foto1.PNG", caption: "Aquí empezó a sentirse todo más especial.", hold: 3000 },
    { src: "assents/images/foto3.PNG", caption: "Cada recuerdo contigo vale muchísimo.", hold: 3000 },
    { src: "assents/images/foto4.PNG", caption: "La distancia nunca pudo con nosotros.", hold: 3000 },
    { src: "assents/images/foto5.PNG", caption: "Y sin darme cuenta, ya eras parte de mi historia.", hold: 3200 },
    { src: "assents/images/foto6.PNG", caption: "Esto ya no era casualidad.", hold: 3000 },
    { src: "assents/images/foto7.PNG", caption: "Era el comienzo de algo bonito.", hold: 3000 },
    { src: "assents/images/foto8.PNG", caption: "Y cada vez lo tengo más claro.", hold: 3200 }
  ];

  const state = {
    currentScene: 0,
    totalScenes: 0,
    musicEnabled: false,
    typewriterTimer: null,
    galleryRunToken: 0,
    distanceRunToken: 0,
    celebrationCleanup: null,
    scenes: []
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function clearApp() {
    app.replaceChildren();
  }

  function setProgress(value = state.currentScene) {
    const total = Math.max(state.totalScenes - 1, 1);
    const progress = (value / total) * 100;
    progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
  }

  function stopTypewriter() {
    if (state.typewriterTimer) {
      clearInterval(state.typewriterTimer);
      state.typewriterTimer = null;
    }
  }

  function stopGallery() {
    state.galleryRunToken += 1;
  }

  function stopDistance() {
    state.distanceRunToken += 1;
  }

  function stopCelebration() {
    if (typeof state.celebrationCleanup === "function") {
      state.celebrationCleanup();
    }
    state.celebrationCleanup = null;
  }

  function stopTransientWork() {
    stopTypewriter();
    stopGallery();
    stopDistance();
    stopCelebration();
  }

  function makeButton(label, extraClass = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `glass-btn${extraClass ? ` ${extraClass}` : ""}`;
    button.textContent = label;
    return button;
  }

  function makeScene(extraClass = "") {
    const scene = document.createElement("section");
    scene.className = "scene";
    if (extraClass) scene.classList.add(...extraClass.split(/\s+/));
    return scene;
  }

  function createStars(count = 220) {
    starsLayer.replaceChildren();

    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");
      star.className = "star";
      const size = i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.opacity = `${0.2 + Math.random() * 0.8}`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      star.style.animationDuration = `${2.5 + Math.random() * 3.5}s`;
      starsLayer.appendChild(star);
    }
  }

  function initAuroraMotion() {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener("mousemove", (event) => {
      const ratioX = event.clientX / window.innerWidth - 0.5;
      const ratioY = event.clientY / window.innerHeight - 0.5;
      targetX = ratioX * 30;
      targetY = ratioY * 22;
    });

    function animate() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      auroraLayer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      requestAnimationFrame(animate);
    }

    animate();
  }

  async function toggleMusic() {
    try {
      if (!state.musicEnabled) {
        await backgroundMusic.play();
        state.musicEnabled = true;
        musicButton.textContent = "⏸";
      } else {
        backgroundMusic.pause();
        state.musicEnabled = false;
        musicButton.textContent = "🎵";
      }
    } catch (error) {
      console.warn("Aurora: no se pudo reproducir la música todavía.", error);
    }
  }

  musicButton.addEventListener("click", toggleMusic);

  function typeText(target, text, speed = 34) {
    stopTypewriter();
    target.textContent = "";
    let index = 0;

    return new Promise((resolve) => {
      state.typewriterTimer = setInterval(() => {
        target.textContent += text.charAt(index);
        index += 1;

        if (index >= text.length) {
          stopTypewriter();
          resolve();
        }
      }, speed);
    });
  }

  function showScene(index) {
    stopTransientWork();
    state.currentScene = index;

    const factory = state.scenes[index];
    if (typeof factory !== "function") {
      console.error("Aurora: escena inexistente:", index);
      return;
    }

    clearApp();
    const scene = factory();
    app.appendChild(scene);
    requestAnimationFrame(() => scene.classList.add("active"));
    setProgress(index);
  }

  function nextScene() {
    if (state.currentScene < state.scenes.length - 1) {
      showScene(state.currentScene + 1);
    }
  }

  function restartProject() {
    showScene(0);
  }

  function loadImage(src) {
    return new Promise((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve(true);
      probe.onerror = () => resolve(false);
      probe.src = src;
    });
  }

  function createHeartLayer(container) {
    const layer = document.createElement("div");
    layer.className = "celebration-hearts";
    container.appendChild(layer);
    return layer;
  }

  function launchHearts(layer, amount = 18) {
    const symbols = ["❤️", "💖", "💗", "💘", "💞", "💓"];

    for (let i = 0; i < amount; i++) {
      const heart = document.createElement("span");
      heart.className = "heart-float";
      heart.textContent = symbols[i % symbols.length];
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.fontSize = `${18 + Math.random() * 18}px`;
      heart.style.animationDuration = `${4.8 + Math.random() * 3.4}s`;
      heart.style.animationDelay = `${Math.random() * 1.8}s`;
      layer.appendChild(heart);

      const removeAfter = (5 + Math.random() * 5) * 1000;
      setTimeout(() => heart.remove(), removeAfter);
    }
  }

  function createFireworksCanvas(container) {
    const canvas = document.createElement("canvas");
    canvas.className = "celebration-canvas";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let rafId = 0;
    let width = 0;
    let height = 0;
    const particles = [];
    const palette = ["#ffffff", "#ffd166", "#ff7ad9", "#8b5cf6", "#5da9ff", "#ff5d8f"];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = Math.floor(container.clientWidth * dpr);
      height = Math.floor(container.clientHeight * dpr);
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const burst = (x, y, count = 80) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.18;
        const speed = 2.4 + Math.random() * 4.2;

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 90 + Math.random() * 40,
          size: 1.1 + Math.random() * 2.1,
          color: palette[Math.floor(Math.random() * palette.length)]
        });
      }
    };

    const step = () => {
      ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
      ctx.fillStyle = "rgba(5,8,22,.10)";
      ctx.fillRect(0, 0, container.clientWidth, container.clientHeight);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.vx *= 0.992;
        p.vy *= 0.992;
        p.life -= 1;
        p.size *= 0.994;

        if (p.life <= 0 || p.size <= 0.12) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 120));
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 18;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(step);
    };

    resize();
    window.addEventListener("resize", resize);
    step();

    return {
      burst,
      destroy() {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", resize);
      }
    };
  }

  function sceneWelcome() {
    const scene = makeScene("welcome-stage");

    const subtitle = document.createElement("p");
    subtitle.className = "subtitle";
    subtitle.textContent = "Hay experiencias que no se viven todos los días...";

    const title = document.createElement("h1");
    title.className = "welcome-title";
    title.textContent = "Una pequeña historia...";

    const text = document.createElement("p");
    text.className = "scene-text";
    text.textContent = "Hecha especialmente para ti.";

    const button = makeButton("Comenzar");
    button.addEventListener("click", nextScene);

    scene.append(subtitle, title, text, button);
    return scene;
  }

  function sceneTypewriter() {
    const scene = makeScene("typewriter-stage");

    const title = document.createElement("h2");
    title.className = "typewriter";

    const button = makeButton("Continuar →");
    button.style.opacity = "0";
    button.style.pointerEvents = "none";

    scene.append(title, button);

    typeText(
      title,
      "Todo comenzó con una conversación... y sin darme cuenta empezaste a convertirte en alguien muy especial para mí."
    ).then(() => {
      button.style.opacity = "1";
      button.style.pointerEvents = "auto";
    });

    button.addEventListener("click", nextScene);
    return scene;
  }

  function sceneGallery() {
    const scene = makeScene("gallery-stage");

    const title = document.createElement("h2");
    title.textContent = "Todavía recuerdo este momento...";

    const stage = document.createElement("div");
    stage.className = "gallery-stage";

    const shell = document.createElement("div");
    shell.className = "gallery-shell";

    const img = document.createElement("img");
    img.className = "gallery-image";
    img.alt = "Recuerdo especial";

    shell.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "gallery-meta";

    const counter = document.createElement("div");
    counter.className = "gallery-counter";

    const dots = document.createElement("div");
    dots.className = "gallery-dots";

    PHOTO_SLIDES.forEach(() => {
      const dot = document.createElement("span");
      dot.className = "gallery-dot";
      dots.appendChild(dot);
    });

    const caption = document.createElement("p");
    caption.className = "gallery-caption";

    const continueButton = makeButton("Continuar →");
    continueButton.classList.add("distance-button");
    continueButton.addEventListener("click", nextScene);

    meta.append(counter, dots, caption);
    stage.append(shell, meta, continueButton);
    scene.append(title, stage);

    const runToken = ++state.galleryRunToken;
    const dotEls = Array.from(dots.children);

    const markSlide = (index) => {
      dotEls.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
      counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(PHOTO_SLIDES.length).padStart(2, "0")}`;
    };

    const loadAndShow = async (src) => {
      const ok = await loadImage(src);
      if (!ok) return false;
      if (runToken !== state.galleryRunToken) return false;

      img.classList.remove("is-visible");
      img.src = src;
      requestAnimationFrame(() => img.classList.add("is-visible"));
      return true;
    };

    (async () => {
      let loadedAtLeastOne = false;

      for (let i = 0; i < PHOTO_SLIDES.length; i++) {
        if (runToken !== state.galleryRunToken) return;

        const slide = PHOTO_SLIDES[i];
        markSlide(i);
        caption.textContent = slide.caption;

        const loaded = await loadAndShow(slide.src);
        if (runToken !== state.galleryRunToken) return;
        if (!loaded) continue;

        loadedAtLeastOne = true;
        await wait(slide.hold || 3000);
      }

      if (runToken !== state.galleryRunToken) return;

      if (!loadedAtLeastOne) {
        caption.textContent = "Agrega tus fotos en assets/images/foto1.jpg, foto2.jpg... para ver el carrusel.";
      } else {
        caption.textContent = "Y sin darme cuenta, ya eras parte de mi historia.";
      }

      continueButton.style.opacity = "1";
      continueButton.style.pointerEvents = "auto";
    })();

    return scene;
  }

  function sceneDistance() {
    const scene = makeScene("distance-stage");

    const title = document.createElement("h2");
    title.textContent = "La distancia nunca pudo con lo que siento.";

    const intro = document.createElement("p");
    intro.className = "scene-text";
    intro.textContent = "Bogotá e Ibagué están lejos en el mapa, pero muy cerca en todo lo que siento por ti.";

    const shell = document.createElement("div");
    shell.className = "distance-shell";

    shell.innerHTML = `
      <svg class="distance-svg" viewBox="0 0 1000 1200" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#5DA9FF"/>
            <stop offset="50%" stop-color="#8B5CF6"/>
            <stop offset="100%" stop-color="#EC4899"/>
          </linearGradient>
          <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <path
          class="country"
          d="M475 80
             L555 118
             L612 168
             L632 242
             L666 314
             L655 390
             L612 456
             L590 522
             L540 595
             L495 664
             L445 734
             L385 788
             L336 762
             L312 696
             L280 640
             L236 593
             L245 520
             L221 452
             L198 390
             L210 319
             L190 248
             L220 180
             L276 126
             L348 92
             L408 72
             Z"/>
        <path class="route-path" id="routePath" d="M640 250 C600 315, 565 385, 530 430 S480 515, 462 548"/>
        <circle class="city-dot" id="bogotaDot" cx="640" cy="250" r="13"></circle>
        <circle class="city-dot city-dot--ibague" id="ibagueDot" cx="462" cy="548" r="13"></circle>
        <text class="city-label" x="662" y="258">Bogotá</text>
        <text class="city-label" x="484" y="556">Ibagué</text>
      </svg>

      <div class="map-plane" id="mapPlane">✈</div>
      <div class="map-spark" id="mapSpark">✦</div>
    `;

    const caption = document.createElement("p");
    caption.className = "map-caption";
    caption.innerHTML = "Una ruta pequeña en el mapa.<br><strong>Un sentimiento enorme en la vida real.</strong>";

    const button = makeButton("Continuar →");
    button.classList.add("distance-button");
    button.addEventListener("click", nextScene);

    scene.append(title, intro, shell, caption, button);

    const path = shell.querySelector("#routePath");
    const plane = shell.querySelector("#mapPlane");
    const spark = shell.querySelector("#mapSpark");
    const ibagueDot = shell.querySelector("#ibagueDot");

    const runToken = ++state.distanceRunToken;
    const totalLength = path.getTotalLength();
    path.style.strokeDasharray = `${totalLength}`;
    path.style.strokeDashoffset = `${totalLength}`;

    const duration = 4200;
    let start = 0;

    const animate = (timestamp) => {
      if (runToken !== state.distanceRunToken) return;
      if (!start) start = timestamp;

      const progress = Math.min((timestamp - start) / duration, 1);
      const point = path.getPointAtLength(totalLength * progress);
      const nextPoint = path.getPointAtLength(Math.min(totalLength * progress + 1, totalLength));
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI;

      path.style.strokeDashoffset = `${totalLength * (1 - progress)}`;

      plane.style.opacity = progress > 0.05 ? "1" : "0";
      plane.style.left = `${(point.x / 1000) * 100}%`;
      plane.style.top = `${(point.y / 1200) * 100}%`;
      plane.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

      spark.style.opacity = progress > 0.9 ? `${(progress - 0.9) * 10}` : "0";
      spark.style.left = `${((point.x + 24) / 1000) * 100}%`;
      spark.style.top = `${((point.y - 14) / 1200) * 100}%`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        ibagueDot.classList.add("pulse-end");
        setTimeout(() => {
          button.style.opacity = "1";
          button.style.pointerEvents = "auto";
          caption.innerHTML = "Bogotá → Ibagué<br><strong>La distancia no pudo con lo que siento.</strong>";
        }, 280);
      }
    };

    requestAnimationFrame(animate);
    return scene;
  }

  function sceneFinalQuestion() {
    const scene = makeScene("final-stage");

    const layout = document.createElement("div");
    layout.className = "final-layout";

    layout.innerHTML = `
      <div class="final-preface">Después de todo este camino...</div>
      <h2 class="final-title">Todo esto tenía un motivo.</h2>
      <div class="final-heart">❤️</div>
      <h1 class="final-question">Aleja...<br>¿Quieres ser mi novia?</h1>
    `;

    const actions = document.createElement("div");
    actions.className = "final-actions";

    const yesButton = makeButton("Sí, quiero ❤️", "final-primary");
    const againButton = makeButton("Leer otra vez la historia", "final-secondary");

    actions.append(yesButton, againButton);
    layout.appendChild(actions);
    scene.appendChild(layout);

    const revealCelebration = async () => {
      if (scene.dataset.done === "1") return;
      scene.dataset.done = "1";
      progressBar.style.width = "100%";

      layout.classList.add("fade-out");
      yesButton.disabled = true;
      againButton.disabled = true;

      await wait(420);

      layout.remove();

      const celebration = document.createElement("div");
      celebration.className = "final-celebration";

      celebration.innerHTML = `
        <div class="celebration-glow"></div>
        <div class="celebration-stack">
          <div class="celebration-badge">El momento más bonito</div>
          <div class="celebration-title">Sí, quiero.</div>
          <div class="celebration-body">
            Sabía que este momento iba a ser especial.<br>
            Gracias por aceptar escribir esta historia conmigo.<br>
            Prometo cuidar de nosotros todos los días.
          </div>
          <div class="celebration-sign">— Camilo ❤️</div>
        </div>
      `;

      const heartsLayer = createHeartLayer(celebration);
      const fireworks = createFireworksCanvas(celebration);

      scene.appendChild(celebration);
      requestAnimationFrame(() => celebration.classList.add("is-visible"));

      const burstPoints = [
        [0.18, 0.30],
        [0.82, 0.26],
        [0.15, 0.62],
        [0.86, 0.65],
        [0.50, 0.18],
        [0.52, 0.74]
      ];

      let burstCount = 0;
      const burstTimer = setInterval(() => {
        const [px, py] = burstPoints[burstCount % burstPoints.length];
        const x = celebration.clientWidth * px + (Math.random() * 100 - 50);
        const y = celebration.clientHeight * py + (Math.random() * 70 - 35);
        fireworks.burst(x, y, 72);
        launchHearts(heartsLayer, 8);
        burstCount += 1;

        if (burstCount >= 8) {
          clearInterval(burstTimer);
        }
      }, 420);

      const heartsTimer = setInterval(() => launchHearts(heartsLayer, 5), 980);

      state.celebrationCleanup = () => {
        clearInterval(burstTimer);
        clearInterval(heartsTimer);
        fireworks.destroy();
      };
    };

    yesButton.addEventListener("click", revealCelebration);
    againButton.addEventListener("click", restartProject);

    return scene;
  }

  state.scenes = [
    sceneWelcome,
    sceneTypewriter,
    sceneGallery,
    sceneDistance,
    sceneFinalQuestion
  ];
  state.totalScenes = state.scenes.length;

  createStars(240);
  initAuroraMotion();
  showScene(0);
})();
