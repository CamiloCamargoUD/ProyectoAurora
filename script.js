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
    { src: "assents/images/foto1.PNG", caption: "Aquí empezó a sentirse todo más especial.", hold: 3000 },
    { src: "assents/images/foto2.PNG", caption: "Todavía recuerdo este momento...", hold: 3000 },
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
        caption.textContent = "Agrega tus fotos en assents/images/foto1.PNG, foto2.PNG... para ver el carrusel.";
      } else {
        caption.textContent = "Y sin darme cuenta, ya eras parte de mi historia.";
      }

      continueButton.style.opacity = "1";
      continueButton.style.pointerEvents = "auto";
    })();

    return scene;
  }

  function sceneDistance() {
    const scene = makeScene("poem-stage");

    const title = document.createElement("h2");
    title.textContent = "La distancia no pudo con lo que siento.";

    const intro = document.createElement("p");
    intro.className = "scene-text";
    intro.textContent = "Entre Bogotá e Ibagué hubo kilómetros... pero nunca silencio en lo que siento por ti.";

    const poemWrap = document.createElement("div");
    poemWrap.style.width = "min(760px, 92vw)";
    poemWrap.style.marginTop = "18px";
    poemWrap.style.padding = "34px 28px";
    poemWrap.style.borderRadius = "28px";
    poemWrap.style.border = "1px solid rgba(255,255,255,.12)";
    poemWrap.style.background = "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))";
    poemWrap.style.backdropFilter = "blur(18px)";
    poemWrap.style.webkitBackdropFilter = "blur(18px)";
    poemWrap.style.boxShadow = "0 20px 60px rgba(0,0,0,.28)";
    poemWrap.style.textAlign = "left";
    poemWrap.style.position = "relative";
    poemWrap.style.overflow = "hidden";

    const glow = document.createElement("div");
    glow.style.position = "absolute";
    glow.style.inset = "0";
    glow.style.background = "radial-gradient(circle at 50% 40%, rgba(236,72,153,.12), transparent 35%), radial-gradient(circle at 50% 70%, rgba(93,169,255,.10), transparent 40%)";
    glow.style.pointerEvents = "none";
    poemWrap.appendChild(glow);

    const label = document.createElement("div");
    label.textContent = "Un poema para ti";
    label.style.position = "relative";
    label.style.zIndex = "1";
    label.style.textTransform = "uppercase";
    label.style.letterSpacing = "4px";
    label.style.fontSize = ".78rem";
    label.style.color = "rgba(255,255,255,.72)";
    label.style.marginBottom = "18px";
    poemWrap.appendChild(label);

    const poemLines = [
      "No fueron los kilómetros",
      "los que escribieron esta historia.",
      "Fueron las ganas de encontrarte,",
      "de pensarte y de quedarme aquí.",
      "Porque el amor verdadero no mide distancia;",
      "solo encuentra el camino."
    ];

    const lineNodes = [];
    poemLines.forEach((line, index) => {
      const p = document.createElement("p");
      p.textContent = line;
      p.style.position = "relative";
      p.style.zIndex = "1";
      p.style.margin = index === poemLines.length - 1 ? "0" : "0 0 10px";
      p.style.fontSize = index === poemLines.length - 1 ? "1.25rem" : "clamp(1.05rem, 1.8vw, 1.25rem)";
      p.style.lineHeight = "1.8";
      p.style.color = index === poemLines.length - 1 ? "#ffffff" : "#d8dcef";
      p.style.fontWeight = index === poemLines.length - 1 ? "700" : "500";
      p.style.opacity = "0";
      p.style.transform = "translateY(10px)";
      p.style.transition = "opacity .6s ease, transform .6s ease";
      poemWrap.appendChild(p);
      lineNodes.push(p);
    });

    const sign = document.createElement("div");
    sign.textContent = "— una pequeña historia";
    sign.style.position = "relative";
    sign.style.zIndex = "1";
    sign.style.marginTop = "24px";
    sign.style.fontSize = ".95rem";
    sign.style.color = "rgba(255,255,255,.65)";
    poemWrap.appendChild(sign);

    const button = makeButton("Continuar →");
    button.classList.add("distance-button");
    button.style.opacity = "0";
    button.style.pointerEvents = "none";
    button.style.marginTop = "16px";
    button.addEventListener("click", nextScene);

    scene.append(title, intro, poemWrap, button);

    const runToken = ++state.distanceRunToken;

    const reveal = async () => {
      for (let i = 0; i < lineNodes.length; i++) {
        if (runToken !== state.distanceRunToken) return;
        await wait(420);
        lineNodes[i].style.opacity = "1";
        lineNodes[i].style.transform = "translateY(0)";
      }

      if (runToken !== state.distanceRunToken) return;
      await wait(500);
      button.style.opacity = "1";
      button.style.pointerEvents = "auto";
    };

    reveal();
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
