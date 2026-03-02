// ===================== GAME INTRO =====================
(function () {
    const overlay = document.getElementById('gameIntro');
    const canvas  = document.getElementById('giCanvas');
    const ctx     = canvas.getContext('2d');
    const bootLog = document.getElementById('giBootLog');
    const logoWrap = document.getElementById('giLogoWrap');
    const logoText = document.getElementById('giLogoText');
    const tagline  = document.getElementById('giTagline');
    const pressEl  = document.getElementById('giPress');

    // Don't show intro if user has already seen it this session
    if (sessionStorage.getItem('gi_seen')) {
        overlay.style.display = 'none';
        return;
    }

    // Lock scroll while intro is playing
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // ── Read saved accent color ───────────────────────────
    const savedAccent = localStorage.getItem('pf_accent') || '#00F5A0';
    // Parse hex → rgb
    function hexToRgb(hex) {
        let h = hex.replace('#', '');
        if (h.length === 3) h = h.split('').map(x => x + x).join('');
        const n = parseInt(h, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    const ac = hexToRgb(savedAccent);
    const acRgb   = `${ac.r},${ac.g},${ac.b}`;
    const acFull  = savedAccent;
    const acHalf  = `rgba(${acRgb},.5)`;
    const acDim   = `rgba(${acRgb},.2)`;
    const acGlow  = `rgba(${acRgb},.6)`;
    const acGlow2 = `rgba(${acRgb},.3)`;
    const acScan  = `rgba(${acRgb},.03)`;
    const acBar   = `rgba(${acRgb},.1)`;
    const acBarFg = `rgba(${acRgb},.4)`;
    const acBarGlow = `rgba(${acRgb},.8)`;
    const acTagline = `rgba(${acRgb},.7)`;
    const acLog   = `rgba(${acRgb},.5)`;

    // Apply accent to DOM elements that use inline color
    // Corners
    document.querySelectorAll('.gi-corner').forEach(el => el.style.borderColor = acFull);
    // H-bars
    document.querySelectorAll('.gi-hbar').forEach(el => {
        el.style.background = `linear-gradient(90deg, transparent, ${acBarFg}, ${acFull}, ${acBarFg}, transparent)`;
    });
    // Scanlines
    const scanlines = overlay.querySelector('.gi-scanlines');
    scanlines.style.background = `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, ${acScan} 2px, ${acScan} 4px)`;

    // CSS custom props scoped to overlay for all child color refs
    overlay.style.setProperty('--gi-accent',      acFull);
    overlay.style.setProperty('--gi-accent-half',  acHalf);
    overlay.style.setProperty('--gi-accent-dim',   acDim);
    overlay.style.setProperty('--gi-accent-glow',  acGlow);
    overlay.style.setProperty('--gi-accent-glow2', acGlow2);
    overlay.style.setProperty('--gi-accent-bar',   acBar);
    overlay.style.setProperty('--gi-accent-bar-fg',acBarFg);
    overlay.style.setProperty('--gi-accent-bar-glow', acBarGlow);
    overlay.style.setProperty('--gi-accent-log',   acLog);
    overlay.style.setProperty('--gi-accent-tag',   acTagline);

    // ── Canvas particle rain ──────────────────────────────
    let W, H, particles = [], animId;
    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(true); }
        reset(initial) {
            this.x = Math.random() * W;
            this.y = initial ? Math.random() * H : -10;
            this.speed = .4 + Math.random() * 1.2;
            this.len   = 8 + Math.random() * 24;
            this.alpha = .1 + Math.random() * .35;
            this.w     = .5 + Math.random() * .8;
        }
        update() {
            this.y += this.speed;
            if (this.y > H + 30) this.reset(false);
        }
        draw() {
            ctx.beginPath();
            const g = ctx.createLinearGradient(this.x, this.y - this.len, this.x, this.y);
            g.addColorStop(0, `rgba(${acRgb},0)`);
            g.addColorStop(1, `rgba(${acRgb},${this.alpha})`);
            ctx.strokeStyle = g;
            ctx.lineWidth = this.w;
            ctx.moveTo(this.x, this.y - this.len);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
        }
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle());

    function drawCanvas() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(drawCanvas);
    }
    drawCanvas();

    // ── Boot log lines ─────────────────────────────────────
    const bootLines = [
        '> INITIALIZING PORTFOLIO SYSTEM...',
        '> LOADING MODULES: automation, crm, javascript',
        '> CALIBRATING WORKFLOW ENGINE... OK',
        '> ALL SYSTEMS NOMINAL',
    ];

    function addLine(txt, delay) {
        return new Promise(res => setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'gi-log-line';
            el.textContent = txt;
            el.style.color = acLog;
            bootLog.appendChild(el);
            res();
        }, delay));
    }

    // ── Progress bar ───────────────────────────────────────
    const progWrap = document.createElement('div');
    progWrap.className = 'gi-progress-wrap';
    progWrap.style.background = acBar;
    const progFill = document.createElement('div');
    progFill.className = 'gi-progress-fill';
    progFill.style.background = `linear-gradient(90deg, ${acBarFg}, ${acFull})`;
    progFill.style.boxShadow = `0 0 8px ${acBarGlow}`;
    progWrap.appendChild(progFill);

    // Apply accent to logo and tagline via inline styles
    function applyLogoColors() {
        const brackets = logoWrap.querySelectorAll('.gi-logo-bracket');
        brackets.forEach(b => b.style.color = acHalf);
        const logoCursor = logoWrap.querySelector('.gi-logo-cursor');
        logoCursor.style.background = acFull;
        logoCursor.style.boxShadow = `0 0 12px ${acBarGlow}`;
        logoText.style.textShadow = `0 0 30px ${acGlow}, 0 0 60px ${acGlow2}`;
        tagline.style.color = acTagline;
    }

    // ── Sequence ───────────────────────────────────────────
    async function runSequence() {
        applyLogoColors();

        // Step 1 — boot log (all 4 lines)
        await addLine(bootLines[0], 300);
        await addLine(bootLines[1], 650);
        await addLine(bootLines[2], 1050);
        await addLine(bootLines[3], 1400);

        // Step 2 — progress bar appears right after last log line
        await new Promise(res => setTimeout(res, 1550));
        bootLog.parentElement.insertBefore(progWrap, bootLog.nextSibling);

        // Animate progress bar 0→100%
        let pct = 0;
        await new Promise(res => {
            const progInterval = setInterval(() => {
                pct = Math.min(pct + (Math.random() * 18 + 4), 100);
                progFill.style.width = pct + '%';
                if (pct >= 100) { clearInterval(progInterval); res(); }
            }, 80);
        });

        // Step 3 — logo appears (~300ms after progress done)
        await new Promise(res => setTimeout(res, 300));
        logoWrap.classList.add('gi-logo-in');

        // Glitch: inject a dynamic <style> with accent-aware keyframe
        const glitchStyle = document.createElement('style');
        glitchStyle.id = 'gi-glitch-style';
        glitchStyle.textContent = `
            @keyframes giGlitch {
                0%  { text-shadow: 2px 0 #ff0080, -2px 0 ${acFull}; clip-path: inset(10% 0 60% 0); }
                33% { text-shadow: -2px 0 #ff0080, 2px 0 ${acFull}; clip-path: inset(50% 0 20% 0); transform: translateX(2px); }
                66% { text-shadow: 1px 0 #ff0080, -1px 0 ${acFull}; clip-path: inset(30% 0 40% 0); transform: translateX(-1px); }
                100%{ text-shadow: 0 0 30px ${acGlow}, 0 0 60px ${acGlow2}; clip-path: none; transform: none; }
            }
        `;
        document.head.appendChild(glitchStyle);
        logoText.style.animation = `giGlitch .15s steps(2) forwards`;

        // Step 4 — blinking cursor
        const logoCursor = logoWrap.querySelector('.gi-logo-cursor');
        setTimeout(() => logoCursor.classList.add('visible'), 500);

        // Step 5 — tagline
        setTimeout(() => tagline.classList.add('gi-tag-in'), 700);

        // Step 6 — "press any key" + enable dismiss
        setTimeout(() => {
            pressEl.classList.add('gi-press-in');
            canDismiss = true;
        }, 1200);
    }

    // ── Dismiss ────────────────────────────────────────────
    let canDismiss = false;

    runSequence();

    function dismiss() {
        if (!canDismiss) return;
        sessionStorage.setItem('gi_seen', '1');
        // Inject accent-colored burst style
        const burstStyle = document.createElement('style');
        burstStyle.textContent = `.gi-overlay.gi-exit-burst::after { background: radial-gradient(circle at center, rgba(${acRgb},.22) 0%, transparent 70%); }`;
        document.head.appendChild(burstStyle);
        overlay.classList.add('gi-exit-burst');
        overlay.classList.add('gi-fade-out');
        cancelAnimationFrame(animId);
        setTimeout(() => {
            overlay.style.display = 'none';
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            burstStyle.remove();
        }, 650);
    }

    overlay.addEventListener('click', dismiss);
    document.addEventListener('keydown', dismiss, { once: true });
})();
// ===================== END GAME INTRO =====================

// ===================== CURSOR =====================
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; cursorDot.style.left = mouseX + 'px'; cursorDot.style.top = mouseY + 'px' });
(function animateCursor() { curX += (mouseX - curX) * .15; curY += (mouseY - curY) * .15; cursor.style.left = curX + 'px'; cursor.style.top = curY + 'px'; requestAnimationFrame(animateCursor) })();
document.querySelectorAll('a,button,input,textarea,.project-card,.reaction-area').forEach(el => { el.addEventListener('mouseenter', () => { cursor.style.width = '32px'; cursor.style.height = '32px'; cursor.style.opacity = '1' }); el.addEventListener('mouseleave', () => { cursor.style.width = '18px'; cursor.style.height = '18px'; cursor.style.opacity = '.8' }) });

// ===================== HEADER HEIGHT =====================
const headerEl = document.querySelector('header');
function setHeaderH() { document.documentElement.style.setProperty('--header-h', `${headerEl.offsetHeight}px`) }
window.addEventListener('load', setHeaderH); window.addEventListener('resize', setHeaderH); setHeaderH();

// ===================== BACK TO TOP =====================
const btn = document.getElementById('backToTop');
window.addEventListener('scroll', () => btn.classList.toggle('show', window.pageYOffset > 300));
btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===================== HAMBURGER =====================
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

function openNav() { hamburger.classList.add('active'); navLinks.classList.add('active'); }
function closeNav() { hamburger.classList.remove('active'); navLinks.classList.remove('active'); }
function toggleNav() { navLinks.classList.contains('active') ? closeNav() : openNav(); }

hamburger.addEventListener('click', toggleNav);
document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) closeNav();
});

// Hide nav on resize to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeNav();
});

// ===================== SMOOTH SCROLL =====================
document.querySelectorAll('a[href^="#"]').forEach(a => { a.addEventListener('click', function (e) { e.preventDefault(); closeNav(); const t = document.querySelector(this.getAttribute('href')); if (t) { const y = t.getBoundingClientRect().top + window.pageYOffset - headerEl.offsetHeight - 8; window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' }) } }) });

// ===================== SCROLL REVEAL =====================
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('revealed');
            e.target.addEventListener('animationend', () => {
                e.target.style.opacity = '1';
                e.target.style.animation = 'none';
                e.target.style.translate = 'none';
            }, { once: true });
            obs.unobserve(e.target);
        }
    });
}, { threshold: .1 });
document.querySelectorAll('.scroll-reveal,.fade-in-up').forEach(el => obs.observe(el));

// ===================== SKILL BARS =====================
const skillObs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.querySelectorAll('.skill-fill').forEach(bar => { bar.style.width = bar.dataset.pct + '%' }); skillObs.unobserve(e.target) } }) }, { threshold: .3 });
document.querySelectorAll('.skills-section').forEach(s => skillObs.observe(s));

// ===================== GAMES PANEL =====================
const overlay = document.getElementById('gamesOverlay');
function openGames() { overlay.classList.add('open'); closeNav(); }
document.getElementById('gamesToggle').addEventListener('click', openGames);
document.getElementById('gamesToggleMobile').addEventListener('click', openGames);
document.getElementById('gamesClose').addEventListener('click', () => overlay.classList.remove('open'));
overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open') });
document.querySelectorAll('.game-tab').forEach(tab => { tab.addEventListener('click', function () { document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active')); document.querySelectorAll('.game-content').forEach(c => c.classList.remove('active')); this.classList.add('active'); document.getElementById('tab-' + this.dataset.tab).classList.add('active') }) });

// ===================== REACTION GAME =====================
let reactionState = 'idle', reactionTimer = null, reactionStart = 0;
const reactionArea = document.getElementById('reactionArea');
const reactionMsg = document.getElementById('reactionMsg');
const reactionSub = document.getElementById('reactionSub');
const reactionScores = document.getElementById('reactionScoreList');
function reactionReset() {
    reactionState = 'idle';
    reactionArea.className = 'reaction-area';
    reactionArea.style.background = '';
    reactionMsg.textContent = 'Click to Start';
    reactionSub.textContent = 'Test your reaction time';
}
reactionArea.addEventListener('click', () => {
    if (reactionState === 'idle') {
        reactionState = 'waiting';
        reactionMsg.textContent = 'Wait for go…';
        reactionSub.textContent = 'Don\'t click yet!';
        const delay = 1500 + Math.random() * 3000;
        reactionTimer = setTimeout(() => {
            reactionState = 'ready';
            reactionArea.classList.add('ready');
            // In glass mode, force solid background via inline style to prevent
            // backdrop-filter bleed from panel tinting the ready state
            if (document.documentElement.getAttribute('data-visual') === 'glass') {
                const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
                reactionArea.style.background = primary;
            }
            reactionMsg.textContent = 'CLICK NOW!';
            reactionSub.textContent = '';
            reactionStart = performance.now();
        }, delay);
    }
    else if (reactionState === 'waiting') {
        clearTimeout(reactionTimer);
        reactionArea.classList.add('too-soon');
        reactionArea.style.background = '';
        reactionMsg.textContent = 'Too soon!';
        reactionSub.textContent = 'Wait for green';
        setTimeout(reactionReset, 1200);
    }
    else if (reactionState === 'ready') {
        const ms = Math.round(performance.now() - reactionStart);
        reactionState = 'idle';
        reactionArea.className = 'reaction-area';
        reactionArea.style.background = '';
        reactionMsg.textContent = `${ms}ms`;
        reactionSub.textContent = ms < 200 ? 'Superhuman!' : ms < 300 ? 'Very fast!' : ms < 500 ? 'Good!' : 'Try again!';
        const chip = document.createElement('div');
        chip.className = 'score-chip';
        chip.textContent = ms + 'ms';
        reactionScores.prepend(chip);
        if (reactionScores.children.length > 6) reactionScores.removeChild(reactionScores.lastChild);
    }
});

// ===================== TYPING GAME =====================
const typingTexts = ['Automation is the key to scaling operations without scaling headcount. Build smart systems and let them work for you around the clock.', 'A well-documented SOP is worth more than a dozen undocumented automations. Clean logic and clear handoffs make systems last.', 'Webhooks, routers, and sub-zaps can turn a fragile Zapier workflow into a modular, maintainable automation machine.'];
let typingActive = false, typingTimerRunning = false, typingTimer = null, typingTimeLeft = 60, typingCorrect = 0, typingTotal = 0, typingTargetText = '', typingStartTime = 0;
const typingTarget = document.getElementById('typingTarget');
const typingInput = document.getElementById('typingInput');
const wpmVal = document.getElementById('wpmVal');
const accVal = document.getElementById('accVal');
const timeVal = document.getElementById('timeVal');
function renderTypingTarget(typed) { typingTarget.innerHTML = typingTargetText.split('').map((c, i) => { let cls = 'char'; if (i < typed.length) cls += (typed[i] === c ? ' correct' : ' wrong'); else if (i === typed.length) cls += ' current'; return `<span class="${cls}">${c == ' ' ? '&nbsp;' : c}</span>` }).join('') }
document.getElementById('startTyping').addEventListener('click', function () {
    typingTargetText = typingTexts[Math.floor(Math.random() * typingTexts.length)];
    typingInput.value = ''; typingInput.disabled = false; typingInput.focus();
    typingTimeLeft = 60; typingCorrect = 0; typingTotal = 0; typingTimerRunning = false;
    wpmVal.textContent = '0'; accVal.textContent = '100'; timeVal.textContent = '60';
    renderTypingTarget(''); typingActive = true; this.textContent = 'Restart';
    clearInterval(typingTimer);
});
typingInput.addEventListener('input', function () {
    if (!typingActive) return;
    // Start timer on first keypress
    if (!typingTimerRunning) {
        typingTimerRunning = true;
        typingStartTime = Date.now();
        typingTimer = setInterval(() => {
            typingTimeLeft--; timeVal.textContent = typingTimeLeft;
            if (typingTimeLeft <= 0) { clearInterval(typingTimer); typingActive = false; typingTimerRunning = false; typingInput.disabled = true }
        }, 1000);
    }
    const typed = this.value;
    typingTotal = typed.length;
    typingCorrect = typed.split('').filter((c, i) => c === typingTargetText[i]).length;
    const elapsedMins = (Date.now() - typingStartTime) / 60000;
    const words = typingCorrect / 5;
    wpmVal.textContent = elapsedMins > 0 ? Math.round(words / elapsedMins) : 0;
    accVal.textContent = typingTotal > 0 ? Math.round(typingCorrect / typingTotal * 100) : 100;
    renderTypingTarget(typed);
    if (typed.length >= typingTargetText.length) { clearInterval(typingTimer); typingActive = false; typingTimerRunning = false; typingInput.disabled = true }
});

// ===================== AIM TRAINER =====================
const aimCanvas = document.getElementById('aimCanvas');
const aimCtx = aimCanvas.getContext('2d');
let aimActive = false, aimRafId = null, aimHitsN = 0, aimMissesN = 0, aimTimeN = 30, aimInterval = null, aimTargets = [];
const aimHitsEl = document.getElementById('aimHits');
const aimMissesEl = document.getElementById('aimMisses');
const aimTimeEl = document.getElementById('aimTime');
const aimAccEl = document.getElementById('aimAcc');

function syncCanvasSize() {
    const wrapper = aimCanvas.parentElement;
    const w = wrapper.clientWidth || 500;
    aimCanvas.width = w;
    aimCanvas.height = 220;
    aimCanvas.style.width = w + 'px';
    aimCanvas.style.height = '220px';
}
window.addEventListener('resize', () => { if (aimActive) { syncCanvasSize() } });

function spawnTarget() {
    const r = 16 + Math.random() * 14;
    const x = r + 4 + Math.random() * Math.max(1, aimCanvas.width - 2 * r - 8);
    const y = r + 4 + Math.random() * Math.max(1, aimCanvas.height - 2 * r - 8);
    aimTargets.push({ x, y, r, born: performance.now() });
}

const TARGET_LIFESPAN = 2200; // ms before auto-expire
function drawAim(ts) {
    if (!aimActive) return;
    aimRafId = requestAnimationFrame(drawAim);
    aimCtx.clearRect(0, 0, aimCanvas.width, aimCanvas.height);
    // Read current accent color dynamically every frame
    const accentRgb = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00F5A0');
    // Draw grid
    aimCtx.strokeStyle = `rgba(${accentRgb},.04)`; aimCtx.lineWidth = 1;
    for (let x = 0; x < aimCanvas.width; x += 40) { aimCtx.beginPath(); aimCtx.moveTo(x, 0); aimCtx.lineTo(x, aimCanvas.height); aimCtx.stroke() }
    for (let y = 0; y < aimCanvas.height; y += 40) { aimCtx.beginPath(); aimCtx.moveTo(0, y); aimCtx.lineTo(aimCanvas.width, y); aimCtx.stroke() }
    const now = ts || performance.now();
    for (let i = aimTargets.length - 1; i >= 0; i--) {
        const t = aimTargets[i];
        const age = now - t.born;
        const fade = Math.max(0, 1 - age / TARGET_LIFESPAN);
        if (fade <= 0) { aimMissesN++; aimMissesEl.textContent = aimMissesN; aimTargets.splice(i, 1); if (aimActive) spawnTarget(); continue }
        // Outer ring
        aimCtx.beginPath(); aimCtx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        aimCtx.fillStyle = `rgba(${accentRgb},${(0.15 + fade * 0.2).toFixed(2)})`; aimCtx.fill();
        aimCtx.strokeStyle = `rgba(${accentRgb},${fade.toFixed(2)})`; aimCtx.lineWidth = 2; aimCtx.stroke();
        // Inner dot
        aimCtx.beginPath(); aimCtx.arc(t.x, t.y, t.r * .35, 0, Math.PI * 2);
        aimCtx.fillStyle = `rgba(${accentRgb},${(fade * .9).toFixed(2)})`; aimCtx.fill();
        // Shrink ring
        const shrinkR = t.r * (1 - age / TARGET_LIFESPAN);
        if (shrinkR > 2) { aimCtx.beginPath(); aimCtx.arc(t.x, t.y, shrinkR, 0, Math.PI * 2); aimCtx.strokeStyle = `rgba(${accentRgb},${(fade * .5).toFixed(2)})`; aimCtx.lineWidth = 1.5; aimCtx.stroke() }
    }
}

aimCanvas.addEventListener('click', e => {
    if (!aimActive) return;
    const rect = aimCanvas.getBoundingClientRect();
    const scaleX = aimCanvas.width / rect.width;
    const scaleY = aimCanvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    let hit = false;
    for (let i = aimTargets.length - 1; i >= 0; i--) {
        const t = aimTargets[i];
        if (Math.hypot(mx - t.x, my - t.y) <= t.r) {
            aimHitsN++; aimHitsEl.textContent = aimHitsN;
            aimTargets.splice(i, 1); hit = true;
            if (aimActive) spawnTarget(); break;
        }
    }
    if (!hit) { aimMissesN++; aimMissesEl.textContent = aimMissesN }
    const total = aimHitsN + aimMissesN;
    aimAccEl.textContent = total ? Math.round(aimHitsN / total * 100) + '%' : '–';
});

document.getElementById('startAim').addEventListener('click', function () {
    // Stop any previous session
    aimActive = false; cancelAnimationFrame(aimRafId); clearInterval(aimInterval);
    // Sync canvas size now that the panel is open and aim tab is visible
    syncCanvasSize();
    // Reset state
    aimHitsN = 0; aimMissesN = 0; aimTimeN = 30; aimTargets = [];
    aimHitsEl.textContent = '0'; aimMissesEl.textContent = '0'; aimTimeEl.textContent = '30'; aimAccEl.textContent = '–';
    this.textContent = 'Restart';
    document.getElementById('resetAim').style.display = 'inline-block';
    // Spawn initial targets
    aimActive = true;
    spawnTarget(); spawnTarget(); spawnTarget();
    requestAnimationFrame(drawAim);
    aimInterval = setInterval(() => {
        aimTimeN--; aimTimeEl.textContent = aimTimeN;
        if (aimTimeN <= 0) {
            clearInterval(aimInterval); aimActive = false; cancelAnimationFrame(aimRafId);
            const total = aimHitsN + aimMissesN;
            aimAccEl.textContent = total ? Math.round(aimHitsN / total * 100) + '%' : '0%';
            document.getElementById('startAim').textContent = 'Play Again';
            // Draw "Game Over" overlay
            aimCtx.fillStyle = 'rgba(10,14,39,.85)'; aimCtx.fillRect(0, 0, aimCanvas.width, aimCanvas.height);
            aimCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00F5A0'; aimCtx.font = 'bold 1.4rem IBM Plex Mono, monospace'; aimCtx.textAlign = 'center';
            aimCtx.fillText('Time\'s Up!', aimCanvas.width / 2, aimCanvas.height / 2 - 20);
            aimCtx.fillStyle = '#A1A1AA'; aimCtx.font = '.9rem IBM Plex Mono, monospace';
            aimCtx.fillText(`Hits: ${aimHitsN}  |  Acc: ${aimAccEl.textContent}`, aimCanvas.width / 2, aimCanvas.height / 2 + 16);
        }
    }, 1000);
});

document.getElementById('resetAim').addEventListener('click', function () {
    aimActive = false; cancelAnimationFrame(aimRafId); clearInterval(aimInterval);
    aimHitsN = 0; aimMissesN = 0; aimTimeN = 30; aimTargets = [];
    aimHitsEl.textContent = '0'; aimMissesEl.textContent = '0'; aimTimeEl.textContent = '30'; aimAccEl.textContent = '–';
    document.getElementById('startAim').textContent = 'Start';
    this.style.display = 'none';
    syncCanvasSize();
    aimCtx.clearRect(0, 0, aimCanvas.width, aimCanvas.height);
    const resetRgb = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00F5A0'); aimCtx.strokeStyle = `rgba(${resetRgb},.04)`; aimCtx.lineWidth = 1;
    for (let x = 0; x < aimCanvas.width; x += 40) { aimCtx.beginPath(); aimCtx.moveTo(x, 0); aimCtx.lineTo(x, aimCanvas.height); aimCtx.stroke() }
    for (let y = 0; y < aimCanvas.height; y += 40) { aimCtx.beginPath(); aimCtx.moveTo(0, y); aimCtx.lineTo(aimCanvas.width, y); aimCtx.stroke() }
});

// ===================== SETTINGS PANEL =====================
const settingsOverlay = document.getElementById('settingsOverlay');
const settingsPanel = document.getElementById('settingsPanel');
const settingsBackdrop = document.getElementById('settingsBackdrop');
const root = document.documentElement;

let _scrollY = 0;
function lockScroll() {
    _scrollY = window.scrollY;
    document.body.classList.add('scroll-locked');
}
function unlockScroll() {
    document.body.classList.remove('scroll-locked');
    // Restore exact scroll position — overflow:hidden doesn't move the page,
    // so this is just a safety net for any browser that resets scroll on overflow change
    window.scrollTo({ top: _scrollY, behavior: 'instant' });
}
function closeSettings() {
    settingsOverlay.classList.remove('open');
    unlockScroll();
}
function openSettings() {
    settingsOverlay.classList.add('open');
    lockScroll();
    closeNav();
}
document.getElementById('settingsToggle').addEventListener('click', e => { e.stopPropagation(); openSettings(); });
document.getElementById('settingsToggleMobile').addEventListener('click', openSettings);
document.getElementById('settingsClose').addEventListener('click', closeSettings);
settingsBackdrop.addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', e => { if (e.target === settingsOverlay) closeSettings(); });
settingsPanel.addEventListener('click', e => e.stopPropagation());

// Settings panel header frost — apply blur only when content scrolls under the sticky header
const settingsHeader = settingsPanel.querySelector('.settings-header');
settingsPanel.addEventListener('scroll', () => {
    settingsHeader.classList.toggle('scrolled', settingsPanel.scrollTop > 4);
}, { passive: true });

// Swipe-down to dismiss on mobile
let touchStartY = 0, touchStartScrollTop = 0;
settingsPanel.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
    touchStartScrollTop = settingsPanel.scrollTop;
}, { passive: true });
settingsPanel.addEventListener('touchmove', e => {
    const dy = e.touches[0].clientY - touchStartY;
    if (dy > 0 && touchStartScrollTop === 0) {
        settingsPanel.style.transform = `translateY(${Math.min(dy * 0.5, 120)}px)`;
        settingsPanel.style.transition = 'none';
    }
}, { passive: true });
settingsPanel.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - touchStartY;
    settingsPanel.style.transition = '';
    settingsPanel.style.transform = '';
    if (dy > 80 && touchStartScrollTop === 0) closeSettings();
}, { passive: true });

// --- Helper: hex -> rgb string ---
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}


// --- Helper: read current accent from CSS (no refresh needed) ---
function getAccentRgbFromCSS() {
    try {
        const hex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
        if (hex && hex[0] === '#' && hex.length >= 7) return hexToRgb(hex);
    } catch (e) { }
    try {
        const stored = localStorage.getItem('pf_accent') || localStorage.getItem('accent') || '#00F5A0';
        if (stored && stored[0] === '#') return hexToRgb(stored);
    } catch (e) { }
    return '0,245,160';
}

// --- Apply accent: updates ALL CSS vars that depend on accent ---
function applyAccent(accent, dim) {
    const rgb = hexToRgb(accent);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-dim', dim || accent);
    // If waves are active, update them immediately to match the new accent
    if (document.body.classList.contains('waves-on')) {
        try { buildWaves(rgb); } catch (e) { }
    }
    root.style.setProperty('--accent-bg', `rgba(${rgb},.1)`);
    root.style.setProperty('--accent-bg-md', `rgba(${rgb},.25)`);
    root.style.setProperty('--accent-bg-xs', `rgba(${rgb},.05)`);
    root.style.setProperty('--accent-border', `rgba(${rgb},.2)`);
    root.style.setProperty('--accent-border-strong', `rgba(${rgb},.3)`);
    root.style.setProperty('--accent-glow', `rgba(${rgb},.4)`);
    root.style.setProperty('--accent-shadow', `rgba(${rgb},.1)`);
    root.style.setProperty('--accent-shadow-lg', `rgba(${rgb},.3)`);
    // Set reaction ready state via CSS variables — default mode uses accent tint,
    // glass mode CSS overrides these with fixed green (no backdrop-filter bleed)
    root.style.setProperty('--reaction-ready-bg', `color-mix(in srgb, ${accent} 12%, var(--primary))`);
    root.style.setProperty('--reaction-ready-border', accent);
    // Patch body::before grid color
    applyBgEffect(currentBgEffect, rgb);
    // Update glass depth layer if glass mode is active
    if (document.documentElement.getAttribute('data-visual') === 'glass') {
        try { updateGlassDepthLayer(); } catch (e) { }
    }
}


// ===================== STARFIELD (CANVAS) =====================
const starsCanvas = document.getElementById('starsCanvas');
const starsCtx = starsCanvas ? starsCanvas.getContext('2d', { alpha: true }) : null;

let starsRAF = null;
let stars = [];
let starsDpr = 1;

function resizeStarsCanvas() {
    if (!starsCanvas || !starsCtx) return;
    starsDpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = Math.floor(window.innerWidth * starsDpr);
    const h = Math.floor(window.innerHeight * starsDpr);
    if (starsCanvas.width !== w || starsCanvas.height !== h) {
        starsCanvas.width = w;
        starsCanvas.height = h;
    }
}

function seededRand(seed) {
    // xorshift32 (fast deterministic PRNG)
    let x = seed >>> 0;
    return function () {
        x ^= x << 13; x >>>= 0;
        x ^= x >> 17; x >>>= 0;
        x ^= x << 5; x >>>= 0;
        return (x >>> 0) / 4294967296;
    };
}

function buildStars(rgb) {
    if (!starsCanvas || !starsCtx) return;
    resizeStarsCanvas();

    const [r, g, b] = (rgb || '255,200,80').split(',').map(n => parseInt(n, 10));
    const w = starsCanvas.width;
    const h = starsCanvas.height;

    // Density tuned for "subtle but visible"
    const area = (w * h) / (starsDpr * starsDpr); // logical px
    const count = Math.floor(Math.max(220, Math.min(950, area / 2600)));

    // Seed changes per build so placement feels fresh each time user selects Stars
    const rand = seededRand((Date.now() ^ (w << 1) ^ (h << 2)) >>> 0);

    stars = [];
    for (let i = 0; i < count; i++) {
        const x = rand() * w;
        const y = rand() * h;

        // 3 size tiers
        const tier = rand();
        const radius = tier < 0.78 ? (0.55 + rand() * 0.85) : tier < 0.95 ? (1.2 + rand() * 1.6) : (2.0 + rand() * 2.8);

        const baseA = tier < 0.78 ? (0.18 + rand() * 0.28) : tier < 0.95 ? (0.25 + rand() * 0.35) : (0.18 + rand() * 0.22);

        // Twinkle parameters
        const twSpeed = 0.35 + rand() * 1.35;
        const twPhase = rand() * Math.PI * 2;

        // Slight drift to avoid "static wallpaper" feel
        const drift = (rand() * 0.35 + 0.08) * (tier < 0.95 ? 1 : 1.6);
        const dx = (rand() < 0.5 ? -1 : 1) * drift;
        const dy = (-0.22 - rand() * 0.55) * drift; // upward bias

        // Mix of accent-tinted and white stars
        const isWhite = rand() < 0.28;
        const cr = isWhite ? 255 : (r || 255);
        const cg = isWhite ? 255 : (g || 200);
        const cb = isWhite ? 255 : (b || 80);

        stars.push({ x, y, radius, baseA, twSpeed, twPhase, dx, dy, cr, cg, cb });
    }
}

function drawStar(s, t) {
    // Twinkle (sinusoidal) + micro shimmer
    const tw = 0.5 + 0.5 * Math.sin(t * s.twSpeed + s.twPhase);
    const shimmer = 0.85 + 0.15 * Math.sin(t * (s.twSpeed * 2.2) + s.twPhase * 1.7);

    const a = Math.max(0, Math.min(1, s.baseA + tw * 0.55 * s.baseA));

    const ctx = starsCtx;
    const x = s.x;
    const y = s.y;
    const r = s.radius;

    // Glow core
    const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
    grd.addColorStop(0, `rgba(${s.cr},${s.cg},${s.cb},${a * shimmer})`);
    grd.addColorStop(0.35, `rgba(${s.cr},${s.cg},${s.cb},${a * 0.35})`);
    grd.addColorStop(1, `rgba(${s.cr},${s.cg},${s.cb},0)`);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Tiny center point
    ctx.fillStyle = `rgba(${s.cr},${s.cg},${s.cb},${Math.min(1, a + 0.15)})`;
    ctx.fillRect(x, y, 1.2 * starsDpr, 1.2 * starsDpr);
}

function stepStars(ts) {
    if (!starsCanvas || !starsCtx) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const t = ts / 1000;
    const w = starsCanvas.width;
    const h = starsCanvas.height;

    starsCtx.clearRect(0, 0, w, h);

    // Slight "film grain" shimmer via global alpha cycling
    starsCtx.globalCompositeOperation = 'lighter';

    for (const s of stars) {
        drawStar(s, t);

        if (!reduced) {
            s.x += s.dx * starsDpr;
            s.y += s.dy * starsDpr;

            // Wrap-around
            if (s.x < -20) s.x = w + 20;
            if (s.x > w + 20) s.x = -20;
            if (s.y < -30) s.y = h + 30;
            if (s.y > h + 30) s.y = -30;
        }
    }

    starsCtx.globalCompositeOperation = 'source-over';
    starsRAF = requestAnimationFrame(stepStars);
}

function enableStars(rgb) {
    if (!starsCanvas || !starsCtx) return;
    document.body.classList.add('stars-on');
    buildStars(rgb);
    if (!starsRAF) starsRAF = requestAnimationFrame(stepStars);
}

function disableStars() {
    if (!starsCanvas || !starsCtx) return;
    document.body.classList.remove('stars-on');
    if (starsRAF) { cancelAnimationFrame(starsRAF); starsRAF = null; }
    starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
}

window.addEventListener('resize', () => {
    if (!document.body.classList.contains('stars-on')) return;
    resizeStarsCanvas();
    // Rebuild for new size to keep distribution natural
    buildStars(localStorage.getItem('pf_dim_rgb') || '255,200,80');
}, { passive: true });

window.addEventListener('resize', () => {
    if (!document.body.classList.contains('waves-on')) return;
    resizeWavesCanvas();
    buildWaves(getAccentRgbFromCSS() || (localStorage.getItem('pf_dim_rgb') || '0,245,160'));
}, { passive: true });
// ===================== WAVES (CANVAS) =====================
// Ultra-lite waves (IDENTICAL to resume): full coverage, fixed DPR=1, ~12.5fps cap, no blur.
const wavesCanvas = document.getElementById('wavesCanvas');
const wavesCtx = wavesCanvas ? wavesCanvas.getContext('2d', { alpha: true }) : null;

let wavesRAF = null;
let wavesDpr = 1;
let waveLines = [];
let waveSeed = 0;
let wavesLastTs = 0;
const WAVES_FRAME_MS = 80; // ~12.5fps cap to reduce lag

function resizeWavesCanvas() {
    if (!wavesCanvas || !wavesCtx) return;
    wavesDpr = 1; // fixed DPR keeps it light (biggest perf win)
    const w = Math.floor(window.innerWidth * wavesDpr);
    const h = Math.floor(window.innerHeight * wavesDpr);
    if (wavesCanvas.width !== w || wavesCanvas.height !== h) {
        wavesCanvas.width = w;
        wavesCanvas.height = h;
    }
}

function buildWaves(rgb) {
    if (!wavesCanvas || !wavesCtx) return;
    resizeWavesCanvas();
    const w = wavesCanvas.width, h = wavesCanvas.height;

    // Fresh seed each time Waves is selected (randomize look)
    waveSeed = (Date.now() ^ (w << 1) ^ (h << 2)) >>> 0;
    const rand = seededRand(waveSeed);

    // Accent color
    const parts = (rgb || getAccentRgbFromCSS() || '0,245,160').split(',').map(n => parseInt(n, 10));
    const cr = parts[0] || 0, cg = parts[1] || 245, cb = parts[2] || 160;

    const logicalH = h / wavesDpr;

    // Spread lines out but guarantee full vertical coverage (no top/bottom gaps)
    const gap = Math.max(70, Math.min(120, Math.round(logicalH / 10))); // larger spacing = "spread"
    const buffer = gap; // render past edges so waves cover screen during motion
    const count = Math.max(6, Math.ceil((logicalH + buffer * 2) / gap) + 1);
    const startY = -buffer;

    waveLines = [];
    for (let i = 0; i < count; i++) {
        const center = logicalH * 0.5;
        const y = startY + (i * gap) + rand() * 6;
        const centerBias = 1 - Math.min(1, Math.abs(y - center) / (logicalH * 0.55));
        const amp = (4.5 + rand() * 12.0) * (0.6 + centerBias * 0.8);

        const freq = 0.0035 + rand() * 0.0045; // longer wavelength (more "spread")
        const freq2 = freq * (1.6 + rand() * 1.2);

        const speed = 0.25 + rand() * 0.65;
        const speed2 = speed * (0.7 + rand() * 0.9);

        const phase = rand() * Math.PI * 2;
        const phase2 = rand() * Math.PI * 2;

        const baseA = 0.04 + rand() * 0.08;
        const thick = rand() < 0.18 ? (1.4 + rand() * 1.2) : (0.8 + rand() * 0.7);

        // subtle alpha breathing so it feels alive without heavier effects
        const twSpeed = 0.6 + rand() * 1.8;
        const twPhase = rand() * Math.PI * 2;

        waveLines.push({ y, amp, freq, freq2, speed, speed2, phase, phase2, baseA, thick, twSpeed, twPhase, cr, cg, cb });
    }
}

function stepWaves(ts) {
    if (!wavesCanvas || !wavesCtx) return;

    // FPS cap (big performance win on canvas animations)
    if (ts - wavesLastTs < WAVES_FRAME_MS) {
        wavesRAF = requestAnimationFrame(stepWaves);
        return;
    }
    wavesLastTs = ts;

    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = ts / 1000;
    const w = wavesCanvas.width, h = wavesCanvas.height;

    wavesCtx.clearRect(0, 0, w, h);
    wavesCtx.globalCompositeOperation = 'source-over';

    const logicalW = w / wavesDpr;

    for (const ln of waveLines) {
        const tw = 0.55 + 0.45 * Math.sin(t * ln.twSpeed + ln.twPhase);
        const alpha = Math.max(0.02, Math.min(0.22, ln.baseA * (0.7 + tw * 1.2)));

        wavesCtx.lineWidth = ln.thick * wavesDpr;
        wavesCtx.strokeStyle = `rgba(${ln.cr},${ln.cg},${ln.cb},${alpha})`;
        wavesCtx.shadowBlur = 0;

        const step = 52; // fewer points (still smooth, lighter)
        wavesCtx.beginPath();

        for (let x = -40; x <= logicalW + 40; x += step) {
            const xx = x * wavesDpr;
            const yWave = ln.y
                + ln.amp * Math.sin((x * ln.freq) + (reduced ? ln.phase : (ln.phase + t * ln.speed)))
                + (ln.amp * 0.35) * Math.sin((x * ln.freq2) + (reduced ? ln.phase2 : (ln.phase2 + t * ln.speed2)));
            const yy = yWave * wavesDpr;

            if (x === -40) wavesCtx.moveTo(xx, yy);
            else wavesCtx.lineTo(xx, yy);
        }

        wavesCtx.stroke();
    }

    wavesRAF = requestAnimationFrame(stepWaves);
}

function enableWaves(rgb) {
    if (!wavesCanvas || !wavesCtx) return;
    document.body.classList.add('waves-on');
    if (!rgb) rgb = getAccentRgbFromCSS();
    buildWaves(rgb);
    wavesLastTs = 0;
    if (!wavesRAF) wavesRAF = requestAnimationFrame(stepWaves);
}

function disableWaves() {
    if (!wavesCanvas || !wavesCtx) return;
    document.body.classList.remove('waves-on');
    if (wavesRAF) { cancelAnimationFrame(wavesRAF); wavesRAF = null; }
    wavesLastTs = 0;
    wavesCtx.clearRect(0, 0, wavesCanvas.width, wavesCanvas.height);
}

// --- Background effects ---
let currentBgEffect = 'grid';
function applyBgEffect(type, rgb) {
    if (!rgb) rgb = getAccentRgbFromCSS();
    currentBgEffect = type;
    // Remove the pre-apply style injected before first paint (no longer needed)
    var preApply = document.getElementById('_preApplyBg');
    if (preApply) preApply.parentNode.removeChild(preApply);
    let styleEl = document.getElementById('bg-effect-style');
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'bg-effect-style'; document.head.appendChild(styleEl); }

    // rgb is "r,g,b" (0-255). Make the grid/dots stay visible even for darker accent colors.
    const parts = (rgb || getAccentRgbFromCSS() || '0,245,160').split(',').map(n => parseInt(n, 10));
    const r = parts[0] || 0, g = parts[1] || 0, b = parts[2] || 0;

    // Relative luminance (sRGB)
    const srgb = [r, g, b].map(v => {
        v = v / 255;
        return v <= 0.04045 ? (v / 12.92) : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]; // 0..1

    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

    // Darker accents get higher opacity so the pattern doesn't disappear.
    const gridA = clamp(0.06 + (0.14 * (1 - lum)), 0.06, 0.18);
    const dotA = clamp(0.18 + (0.30 * (1 - lum)), 0.18, 0.48);
    const waveA1 = clamp(0.04 + (0.10 * (1 - lum)), 0.04, 0.16);
    const waveA2 = clamp(0.02 + (0.08 * (1 - lum)), 0.02, 0.12);

    const ga = gridA.toFixed(2);
    const da = dotA.toFixed(2);
    const wa1 = waveA1.toFixed(2);
    const wa2 = waveA2.toFixed(2);

    const effects = {
        grid: `body::before {
                    background-image: linear-gradient(90deg, rgba(${r},${g},${b},${ga}) 1px, transparent 1px),
                                      linear-gradient(rgba(${r},${g},${b},${ga}) 1px, transparent 1px) !important;
                    background-size: 50px 50px !important;
                    opacity: 1 !important;
                    animation: none !important;
                }`,
        dots: `body::before {
                    background-image: radial-gradient(circle, rgba(${r},${g},${b},${da}) 1px, transparent 1px) !important;
                    background-size: 28px 28px !important;
                    opacity: 1 !important;
                    animation: none !important;
                }`,
        waves: `body::before { opacity: 0 !important; animation: none !important; }`,
        none: `body::before { opacity: 0 !important; animation: none !important; }`,
        circuit: `body::before { opacity: 0 !important; animation: none !important; }`,
        hex: (() => {
            const svgA = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="50" height="87"><polygon points="25,2 48,14.5 48,39.5 25,52 2,39.5 2,14.5" fill="none" stroke="rgba(${r},${g},${b},0.3)" stroke-width="1.2"/></svg>`);
            const svgB = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="50" height="87"><polygon points="25,2 48,14.5 48,39.5 25,52 2,39.5 2,14.5" fill="none" stroke="rgba(${r},${g},${b},0.12)" stroke-width="1"/></svg>`);
            return `
                @keyframes hexFloat { 0%{background-position:0 0,25px 43.5px} 100%{background-position:0 87px,25px 130.5px} }
                body::before {
                    background-image:
                        url("data:image/svg+xml,${svgA}"),
                        url("data:image/svg+xml,${svgB}") !important;
                    background-size: 50px 87px, 50px 87px !important;
                    background-position: 0 0, 25px 43.5px !important;
                    opacity: 1 !important;
                    animation: hexFloat 18s linear infinite !important;
                }`;
        })(),
        scanlines: `
                body::before {
                    background-image: repeating-linear-gradient(
                        0deg,
                        rgba(${r},${g},${b},0.04) 0px,
                        rgba(${r},${g},${b},0.04) 1px,
                        transparent 1px,
                        transparent 4px
                    ) !important;
                    background-size: 100% 4px !important;
                    opacity: 1 !important;
                    animation: none !important;
                }`,
        crosshatch: `
                @keyframes crosshatchMove { 0%{background-position:0 0,0 0} 100%{background-position:28px 28px,-28px 28px} }
                body::before {
                    background-image:
                        repeating-linear-gradient(45deg, rgba(${r},${g},${b},${wa1}) 0, rgba(${r},${g},${b},${wa1}) 1px, transparent 1px, transparent 14px),
                        repeating-linear-gradient(-45deg, rgba(${r},${g},${b},${wa1}) 0, rgba(${r},${g},${b},${wa1}) 1px, transparent 1px, transparent 14px) !important;
                    background-size: 20px 20px !important;
                    opacity: 1 !important;
                    animation: crosshatchMove 10s linear infinite !important;
                }`,
        stars: `
                /* Use canvas-based starfield for true random shimmer */
                body::before {
                    opacity: 0 !important;
                    animation: none !important;
                    background-image: none !important;
                }`,
        mesh: `
                @keyframes meshShift { 0%{background-position:0% 0%,100% 100%,50% 50%} 50%{background-position:100% 0%,0% 100%,50% 0%} 100%{background-position:0% 0%,100% 100%,50% 50%} }
                body::before {
                    background-image:
                        radial-gradient(ellipse at var(--mesh-x1,20%) var(--mesh-y1,20%), rgba(${r},${g},${b},0.12) 0%, transparent 60%),
                        radial-gradient(ellipse at var(--mesh-x2,80%) var(--mesh-y2,80%), rgba(${r},${g},${b},0.08) 0%, transparent 60%),
                        radial-gradient(ellipse at 50% 50%, rgba(${r},${g},${b},0.05) 0%, transparent 70%) !important;
                    background-size: 100% 100% !important;
                    opacity: 1 !important;
                    animation: meshShift 8s ease-in-out infinite !important;
                }`,
        aurora: `
                @keyframes auroraMove {
                    0%   { background-position: 0% 50%, 100% 50%, 50% 0% }
                    33%  { background-position: 100% 0%, 0% 100%, 80% 50% }
                    66%  { background-position: 50% 100%, 50% 0%, 20% 100% }
                    100% { background-position: 0% 50%, 100% 50%, 50% 0% }
                }
                body::before {
                    background-image:
                        radial-gradient(ellipse 80% 40% at 20% 60%, rgba(${r},${g},${b},0.14) 0%, transparent 70%),
                        radial-gradient(ellipse 60% 50% at 80% 30%, rgba(${Math.floor(b * 0.5 + r * 0.5)},${Math.floor(g * 0.3)},${b},0.10) 0%, transparent 70%),
                        radial-gradient(ellipse 50% 60% at 50% 80%, rgba(${r},${Math.floor(g * 0.6 + b * 0.4)},${b},0.08) 0%, transparent 60%) !important;
                    background-size: 200% 200%, 200% 200%, 200% 200% !important;
                    opacity: 1 !important;
                    animation: auroraMove 12s ease-in-out infinite !important;
                }`,
        rain: `body::before { opacity: 0 !important; }`,
        plasma: `
                @keyframes plasmaFlow {
                    0%   { filter: hue-rotate(0deg) brightness(1); }
                    50%  { filter: hue-rotate(30deg) brightness(1.1); }
                    100% { filter: hue-rotate(0deg) brightness(1); }
                }
                body::before {
                    background-image:
                        radial-gradient(ellipse 120% 80% at 10% 90%, rgba(${r},${g},${b},0.18) 0%, transparent 50%),
                        radial-gradient(ellipse 80% 120% at 90% 10%, rgba(${b},${r},${Math.floor(g * 0.5)},0.12) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 60% at 50% 50%, rgba(${Math.floor(r * 0.3)},${g},${b},0.08) 0%, transparent 70%),
                        radial-gradient(ellipse 100% 40% at 80% 80%, rgba(${r},${Math.floor(g * 0.4)},${b},0.10) 0%, transparent 60%) !important;
                    background-size: 100% 100% !important;
                    opacity: 1 !important;
                    animation: plasmaFlow 6s ease-in-out infinite !important;
                }`,
        matrix: `body::before { opacity: 0 !important; }`,
        hex: `body::before { opacity: 0 !important; }`,
        noise: `
                @keyframes noiseShimmer { 0%{opacity:.8} 50%{opacity:1} 100%{opacity:.8} }
                body::before {
                    background-image:
                        url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"),
                        radial-gradient(circle at 20% 80%, rgba(${r},${g},${b},0.06) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(${r},${g},${b},0.04) 0%, transparent 50%) !important;
                    background-size: 200px 200px, 100% 100%, 100% 100% !important;
                    opacity: 1 !important;
                    animation: noiseShimmer 4s ease-in-out infinite !important;
                }`
    };

    styleEl.textContent = effects[type] || effects.grid;

    // Canvas starfield (randomized shimmer)
    if (type === 'stars') {
        enableStars(rgb);
    } else {
        disableStars();
    }

    // Canvas waves (animated sine lines)
    if (type === 'waves') {
        enableWaves(rgb);
    } else {
        disableWaves();
    }


    // ── Canvas-based effects: Matrix, Rain, Hex & Circuit ──
    let matrixCanvas = document.getElementById('matrix-canvas');
    let rainCanvas = document.getElementById('rain-canvas');
    let hexCanvas = document.getElementById('hex-canvas');
    let circuitCanvas = document.getElementById('circuit-canvas');

    if (type === 'matrix') {
        if (rainCanvas) { rainCanvas.style.display = 'none'; stopRainCanvas(); }
        if (hexCanvas) { hexCanvas.style.display = 'none'; stopHexCanvas(); }
        if (circuitCanvas) { circuitCanvas.style.display = 'none'; stopCircuitCanvas(); }
        if (!matrixCanvas) {
            matrixCanvas = document.createElement('canvas');
            matrixCanvas.id = 'matrix-canvas';
            matrixCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.18;';
            document.body.prepend(matrixCanvas);
        }
        matrixCanvas.style.display = 'block';
        startMatrixCanvas(matrixCanvas, rgb);
    } else if (type === 'rain') {
        if (matrixCanvas) { matrixCanvas.style.display = 'none'; stopMatrixCanvas(); }
        if (hexCanvas) { hexCanvas.style.display = 'none'; stopHexCanvas(); }
        if (circuitCanvas) { circuitCanvas.style.display = 'none'; stopCircuitCanvas(); }
        if (!rainCanvas) {
            rainCanvas = document.createElement('canvas');
            rainCanvas.id = 'rain-canvas';
            rainCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
            document.body.prepend(rainCanvas);
        }
        rainCanvas.style.display = 'block';
        startRainCanvas(rainCanvas, rgb);
    } else if (type === 'hex') {
        if (matrixCanvas) { matrixCanvas.style.display = 'none'; stopMatrixCanvas(); }
        if (rainCanvas) { rainCanvas.style.display = 'none'; stopRainCanvas(); }
        if (circuitCanvas) { circuitCanvas.style.display = 'none'; stopCircuitCanvas(); }
        if (!hexCanvas) {
            hexCanvas = document.createElement('canvas');
            hexCanvas.id = 'hex-canvas';
            hexCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
            document.body.prepend(hexCanvas);
        }
        hexCanvas.style.display = 'block';
        startHexCanvas(hexCanvas, rgb);
    } else if (type === 'circuit') {
        if (matrixCanvas) { matrixCanvas.style.display = 'none'; stopMatrixCanvas(); }
        if (rainCanvas) { rainCanvas.style.display = 'none'; stopRainCanvas(); }
        if (hexCanvas) { hexCanvas.style.display = 'none'; stopHexCanvas(); }
        if (!circuitCanvas) {
            circuitCanvas = document.createElement('canvas');
            circuitCanvas.id = 'circuit-canvas';
            circuitCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
            document.body.prepend(circuitCanvas);
        }
        circuitCanvas.style.display = 'block';
        startCircuitCanvas(circuitCanvas, rgb);
    } else {
        if (matrixCanvas) { matrixCanvas.style.display = 'none'; stopMatrixCanvas(); }
        if (rainCanvas) { rainCanvas.style.display = 'none'; stopRainCanvas(); }
        if (hexCanvas) { hexCanvas.style.display = 'none'; stopHexCanvas(); }
        if (circuitCanvas) { circuitCanvas.style.display = 'none'; stopCircuitCanvas(); }
    }

    // Re-pin depth layer after canvases whenever bg effect changes
    if (document.documentElement.getAttribute('data-visual') === 'glass') {
        try { updateGlassDepthLayer(); } catch (e) { }
    }
}

// ── Matrix Canvas Animation ──
let _matrixRaf = null;
function stopMatrixCanvas() { if (_matrixRaf) { cancelAnimationFrame(_matrixRaf); _matrixRaf = null; } }
function startMatrixCanvas(canvas, rgb) {
    stopMatrixCanvas();
    const ctx = canvas.getContext('2d');
    const chars = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF';
    const fontSize = 14;
    let cols, drops;
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cols = Math.floor(canvas.width / fontSize);
        drops = Array.from({ length: cols }, () => Math.random() * -canvas.height / fontSize);
    }
    resize();
    window.addEventListener('resize', resize);
    let lastTime = 0;
    function draw(ts) {
        _matrixRaf = requestAnimationFrame(draw);
        if (ts - lastTime < 50) return;
        lastTime = ts;
        const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00F5A0';
        const acRgb = hexToRgb(accentHex);
        const primaryHex = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0A0E27';
        const pRgb = hexToRgb(primaryHex);
        ctx.fillStyle = `rgba(${pRgb},0.05)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < cols; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const y = drops[i] * fontSize;
            ctx.fillStyle = `rgba(255,255,255,0.9)`;
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText(char, i * fontSize, y);
            ctx.fillStyle = `rgba(${acRgb},0.85)`;
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, y - fontSize);
            if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
            else drops[i] += 0.5;
        }
    }
    _matrixRaf = requestAnimationFrame(draw);
}

// ── Rain Canvas Animation ──
let _rainRaf = null;
function stopRainCanvas() { if (_rainRaf) { cancelAnimationFrame(_rainRaf); _rainRaf = null; } }
function startRainCanvas(canvas, rgb) {
    stopRainCanvas();
    const ctx = canvas.getContext('2d');
    let drops = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Reinitialise drops to fill screen
        drops = [];
        const count = Math.floor(canvas.width / 14);
        for (let i = 0; i < count; i++) {
            drops.push(createDrop(canvas, true));
        }
    }

    function createDrop(canvas, randomY) {
        const len = 40 + Math.random() * 120;   // streak length px
        const speed = 0.8 + Math.random() * 1.6;  // px per frame (slowed down)
        const x = Math.random() * canvas.width;
        const y = randomY ? Math.random() * canvas.height : -len - Math.random() * 200;
        const alpha = 0.25 + Math.random() * 0.55;
        const width = 0.5 + Math.random() * 1;
        return { x, y, len, speed, alpha, width };
    }

    resize();
    window.addEventListener('resize', resize);

    let _rainLastTime = 0;
    function draw(ts) {
        _rainRaf = requestAnimationFrame(draw);
        if (ts - _rainLastTime < 33) return; // ~30fps cap
        _rainLastTime = ts;
        const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00F5A0';
        const acRgb = hexToRgb(accentHex);
        const primaryHex = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0A0E27';
        const pRgb = hexToRgb(primaryHex);

        // Fade previous frame — gives streak trail effect
        ctx.fillStyle = `rgba(${pRgb},0.35)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < drops.length; i++) {
            const d = drops[i];

            // Draw the streak as a vertical gradient line
            const grad = ctx.createLinearGradient(d.x, d.y - d.len, d.x, d.y);
            grad.addColorStop(0, `rgba(${acRgb},0)`);
            grad.addColorStop(0.6, `rgba(${acRgb},${(d.alpha * 0.4).toFixed(2)})`);
            grad.addColorStop(0.92, `rgba(${acRgb},${d.alpha.toFixed(2)})`);
            grad.addColorStop(1, `rgba(255,255,255,${Math.min(d.alpha + 0.3, 1).toFixed(2)})`);

            ctx.beginPath();
            ctx.moveTo(d.x, d.y - d.len);
            ctx.lineTo(d.x, d.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = d.width;
            ctx.stroke();

            // Bright head dot
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.width * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${Math.min(d.alpha + 0.2, 0.95).toFixed(2)})`;
            ctx.fill();

            d.y += d.speed;

            // Recycle drop when it exits the bottom
            if (d.y - d.len > canvas.height) {
                drops[i] = createDrop(canvas, false);
            }
        }
    }
    _rainRaf = requestAnimationFrame(draw);
}

// ── Hex Canvas Animation ──
let _hexRaf = null;
function stopHexCanvas() {
    if (_hexRaf) { cancelAnimationFrame(_hexRaf); _hexRaf = null; }
}
function startHexCanvas(canvas, rgb) {
    stopHexCanvas();
    const ctx = canvas.getContext('2d');

    // Hex geometry
    const HEX_SIZE = 32; // circumradius
    const HEX_W = HEX_SIZE * 2;
    const HEX_H = Math.sqrt(3) * HEX_SIZE;
    const COL_W = HEX_W * 0.75;

    let cols, rows, hexes, W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        cols = Math.ceil(W / COL_W) + 2;
        rows = Math.ceil(H / HEX_H) + 2;
        hexes = [];
        for (let c = 0; c < cols; c++) {
            for (let rr = 0; rr < rows; rr++) {
                const x = c * COL_W;
                const y = rr * HEX_H + (c % 2 === 1 ? HEX_H / 2 : 0);
                // Each hex has independent animation state
                hexes.push({
                    x, y,
                    phase: Math.random() * Math.PI * 2,      // base glow phase
                    pulseSpeed: 0.0008 + Math.random() * 0.0018,
                    glowPhase: Math.random() * Math.PI * 2,  // for edge glow
                    lit: Math.random() < 0.02,                // randomly lit cells
                    litTimer: Math.random() * 500,
                    litDuration: 120 + Math.random() * 220,
                    edgeBright: Math.random() < 0.06,
                });
            }
        }
    }
    resize();
    window.addEventListener('resize', resize);

    // Draw a single flat-top hexagon path
    function hexPath(cx, cy, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 180) * (60 * i);
            const px = cx + size * Math.cos(angle);
            const py = cy + size * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
    }

    let frame = 0;
    let _hexLastTime = 0;
    function draw(ts) {
        _hexRaf = requestAnimationFrame(draw);
        if (ts - _hexLastTime < 33) return; // ~30fps cap
        _hexLastTime = ts;
        frame++;

        // Read current accent color each frame so theme changes apply live
        const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00F5A0';
        const acRgb = hexToRgb(accentHex);
        const [ar, ag, ab] = acRgb.split(',').map(Number);

        ctx.clearRect(0, 0, W, H);

        for (let i = 0; i < hexes.length; i++) {
            const h = hexes[i];
            h.phase += h.pulseSpeed;

            // Update lit state
            h.litTimer++;
            if (h.lit && h.litTimer > h.litDuration) {
                h.lit = false;
                h.litTimer = 0;
                h.litDuration = 400 + Math.random() * 600;
            } else if (!h.lit && h.litTimer > h.litDuration) {
                if (Math.random() < 0.0005) {
                    h.lit = true;
                    h.litTimer = 0;
                    h.litDuration = 80 + Math.random() * 160;
                } else {
                    h.litTimer = h.litDuration - 10; // keep checking soon
                }
            }

            const baseGlow = (Math.sin(h.phase) * 0.5 + 0.5); // 0..1
            const litGlow = h.lit ? (Math.sin(h.litTimer / h.litDuration * Math.PI)) : 0; // fade in/out
            const totalGlow = Math.max(baseGlow * 0.35, litGlow);

            // ── Fill: subtle glow when lit ──
            if (litGlow > 0.05) {
                hexPath(h.x, h.y, HEX_SIZE - 1);
                ctx.fillStyle = `rgba(${ar},${ag},${ab},${(litGlow * 0.06).toFixed(3)})`;
                ctx.fill();
            }

            // ── Edge stroke ──
            hexPath(h.x, h.y, HEX_SIZE - 0.5);
            const edgeAlpha = h.edgeBright
                ? (0.12 + totalGlow * 0.45).toFixed(3)
                : (0.04 + totalGlow * 0.12).toFixed(3);

            if (h.lit) {
                // Glowing edge — gradient stroke simulation
                ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(0.2 + litGlow * 0.6).toFixed(3)})`;
                ctx.lineWidth = 1 + litGlow * 1.5;
                // Outer glow pass
                ctx.shadowColor = `rgba(${ar},${ag},${ab},${(litGlow * 0.8).toFixed(2)})`;
                ctx.shadowBlur = 8 + litGlow * 12;
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else {
                ctx.strokeStyle = `rgba(${ar},${ag},${ab},${edgeAlpha})`;
                ctx.lineWidth = 0.6 + baseGlow * 0.3;
                ctx.stroke();
            }

            // ── Corner dots on bright-edge hexes ──
            if (h.edgeBright && baseGlow > 0.7) {
                for (let v = 0; v < 6; v++) {
                    const angle = (Math.PI / 180) * (60 * v);
                    const vx = h.x + HEX_SIZE * Math.cos(angle);
                    const vy = h.y + HEX_SIZE * Math.sin(angle);
                    ctx.beginPath();
                    ctx.arc(vx, vy, 1, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${ar},${ag},${ab},${(baseGlow * 0.5).toFixed(2)})`;
                    ctx.fill();
                }
            }
        }

        // ── Travelling pulse wave ──
        const waveX = (frame * 0.4) % (W + 200) - 100;
        const waveY = (frame * 0.18) % (H + 200) - 100;
        for (let i = 0; i < hexes.length; i++) {
            const h = hexes[i];
            const dx = h.x - waveX;
            const dy = h.y - waveY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const waveR = 180;
            if (dist < waveR) {
                const intensity = (1 - dist / waveR) * 0.18;
                hexPath(h.x, h.y, HEX_SIZE - 0.5);
                ctx.strokeStyle = `rgba(${ar},${ag},${ab},${intensity.toFixed(3)})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    }
    _hexRaf = requestAnimationFrame(draw);
}

// ── Circuit Board Canvas Animation ──
let _circuitRaf = null;
function stopCircuitCanvas() {
    if (_circuitRaf) { cancelAnimationFrame(_circuitRaf); _circuitRaf = null; }
}
function startCircuitCanvas(canvas, rgb) {
    stopCircuitCanvas();
    const ctx = canvas.getContext('2d');
    let W, H, nodes, traces, pulses;
    const GRID = 48; // grid cell size

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        buildCircuit();
    }

    function buildCircuit() {
        nodes = [];
        traces = [];
        pulses = [];

        const cols = Math.ceil(W / GRID) + 1;
        const rows = Math.ceil(H / GRID) + 1;

        // Create grid nodes with random presence (~55% occupied)
        const grid = {};
        for (let c = 0; c <= cols; c++) {
            for (let rr = 0; rr <= rows; rr++) {
                if (Math.random() < 0.55) {
                    const key = `${c},${rr}`;
                    const node = {
                        x: c * GRID,
                        y: rr * GRID,
                        c, r: rr,
                        // node type: 0=junction dot, 1=via (circle), 2=component pad
                        type: Math.random() < 0.12 ? 1 : Math.random() < 0.06 ? 2 : 0,
                        glow: Math.random(),
                        glowSpeed: 0.005 + Math.random() * 0.012
                    };
                    nodes.push(node);
                    grid[key] = node;
                }
            }
        }

        // Connect adjacent nodes with traces (horizontal + vertical + some L-bends)
        const dirs = [[1, 0], [0, 1]];
        for (const node of nodes) {
            for (const [dc, dr] of dirs) {
                const neighbor = grid[`${node.c + dc},${node.r + dr}`];
                if (!neighbor) continue;
                // ~65% chance to draw a trace between adjacent nodes
                if (Math.random() < 0.65) {
                    traces.push({
                        x1: node.x, y1: node.y,
                        x2: neighbor.x, y2: neighbor.y,
                        // Each trace gets a base opacity
                        alpha: 0.06 + Math.random() * 0.10,
                    });
                    // Spawn a pulse on some traces
                    if (Math.random() < 0.08) {
                        pulses.push({
                            x1: node.x, y1: node.y,
                            x2: neighbor.x, y2: neighbor.y,
                            t: Math.random(),           // 0..1 progress along trace
                            speed: 0.004 + Math.random() * 0.008,
                            dir: Math.random() < 0.5 ? 1 : -1,
                            size: 2.5 + Math.random() * 2,
                            trail: 0.18 + Math.random() * 0.14,
                        });
                    }
                }
            }
        }
    }

    resize();
    window.addEventListener('resize', resize);

    let _lastTime = 0;
    function draw(ts) {
        _circuitRaf = requestAnimationFrame(draw);
        if (ts - _lastTime < 33) return; // ~30fps cap
        _lastTime = ts;

        // Read current accent each frame
        const aHex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00F5A0';
        const aRgb = hexToRgb(aHex);
        const [ar, ag, ab] = aRgb.split(',').map(Number);

        ctx.clearRect(0, 0, W, H);

        // ── Draw traces ──
        for (const tr of traces) {
            ctx.beginPath();
            ctx.moveTo(tr.x1, tr.y1);
            ctx.lineTo(tr.x2, tr.y2);
            ctx.strokeStyle = `rgba(${ar},${ag},${ab},${tr.alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // ── Draw nodes ──
        for (const nd of nodes) {
            nd.glow += nd.glowSpeed;
            const a = 0.12 + Math.abs(Math.sin(nd.glow)) * 0.18;
            if (nd.type === 1) {
                // Via: filled circle with ring
                ctx.beginPath();
                ctx.arc(nd.x, nd.y, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${ar},${ag},${ab},${(a * 0.7).toFixed(3)})`;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(nd.x, nd.y, 5.5, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(a * 0.5).toFixed(3)})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            } else if (nd.type === 2) {
                // Component pad: small square
                const s = 4;
                ctx.fillStyle = `rgba(${ar},${ag},${ab},${(a * 0.6).toFixed(3)})`;
                ctx.fillRect(nd.x - s / 2, nd.y - s / 2, s, s);
            } else {
                // Junction dot
                ctx.beginPath();
                ctx.arc(nd.x, nd.y, 1.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${ar},${ag},${ab},${a.toFixed(3)})`;
                ctx.fill();
            }
        }

        // ── Draw & advance pulses ──
        for (const p of pulses) {
            p.t += p.speed * p.dir;
            if (p.t > 1 || p.t < 0) {
                p.dir *= -1;
                p.t = p.t > 1 ? 1 : 0;
            }
            const px = p.x1 + (p.x2 - p.x1) * p.t;
            const py = p.y1 + (p.y2 - p.y1) * p.t;

            // Glowing head
            const grd = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3);
            grd.addColorStop(0, `rgba(${ar},${ag},${ab},0.9)`);
            grd.addColorStop(0.3, `rgba(${ar},${ag},${ab},${p.trail})`);
            grd.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
            ctx.beginPath();
            ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            // Bright core dot
            ctx.beginPath();
            ctx.arc(px, py, p.size * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${ar},${ag},${ab},1)`;
            ctx.fill();
        }
    }
    _circuitRaf = requestAnimationFrame(draw);
}
const defaultRgb = '0,245,160';

// --- Glass depth layer (makes backdrop-filter visually obvious) ---
function ensureGlassDepthLayer(style) {
    const id = 'glass-depth-layer';
    let layer = document.getElementById(id);

    if (style === 'glass') {
        if (!layer) {
            layer = document.createElement('div');
            layer.id = id;
            // Must be very early in DOM to sit behind everything else
            document.body.insertBefore(layer, document.body.firstChild);
        } else if (layer !== document.body.firstChild) {
            // Keep it pinned to position 0 — canvases prepend themselves and would cover it
            document.body.insertBefore(layer, document.body.firstChild);
        }
        // Update with current accent colors and make visible
        updateGlassDepthLayer();
    } else {
        // Hide but keep in DOM — avoids re-insert position bugs when toggling back to glass
        if (layer) layer.style.cssText = 'display:none';
    }
}

function updateGlassDepthLayer() {
    const layer = document.getElementById('glass-depth-layer');
    if (!layer) return;
    const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00F5A0';
    const aRgb = hexToRgb(accentHex);
    const [ar, ag, ab] = aRgb.split(',');
    layer.style.cssText = [
        'display:block',
        'position:fixed',
        'inset:0',
        'pointer-events:none',
        'z-index:0',
        'background:' + [
            `radial-gradient(ellipse 75% 55% at 12% 18%, rgba(${ar},${ag},${ab},0.13) 0%, transparent 55%)`,
            `radial-gradient(ellipse 60% 45% at 88% 80%, rgba(0,140,255,0.11) 0%, transparent 55%)`,
            `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,255,255,0.07) 0%, transparent 60%)`,
            `radial-gradient(ellipse 40% 35% at 25% 70%, rgba(${ar},${ag},${ab},0.08) 0%, transparent 50%)`,
            `radial-gradient(ellipse 50% 40% at 78% 20%, rgba(80,80,255,0.08) 0%, transparent 50%)`,
            `radial-gradient(ellipse 30% 25% at 60% 85%, rgba(255,255,255,0.05) 0%, transparent 45%)`
        ].join(',')
    ].join(';');
    // Pin depth layer AFTER all canvases so it paints on top at the same z-index
    // (later in DOM order = higher paint order at equal z-index)
    _pinDepthLayerAfterCanvases(layer);
}

function _pinDepthLayerAfterCanvases(layer) {
    // Find the last canvas in body's direct children
    const children = Array.from(document.body.children);
    let lastCanvas = null;
    for (const el of children) {
        if (el.tagName === 'CANVAS') lastCanvas = el;
    }
    if (lastCanvas && lastCanvas.nextSibling !== layer) {
        // Insert depth layer right after the last canvas
        document.body.insertBefore(layer, lastCanvas.nextSibling);
    } else if (!lastCanvas && document.body.firstChild !== layer) {
        // No canvases — keep at top
        document.body.insertBefore(layer, document.body.firstChild);
    }
}

// --- Visual Style (Default / Glass) ---
(function initVisualStyle() {
    // Scope to buttons only — avoids accidentally selecting html[data-visual]
    const btns = document.querySelectorAll('.visual-style-btn[data-visual]');

    function applyVisualStyle(style) {
        if (style === 'glass') {
            document.documentElement.setAttribute('data-visual', 'glass');
        } else {
            document.documentElement.removeAttribute('data-visual');
            document.documentElement.removeAttribute('data-glass-entering');
        }
        // Keep the depth layer in sync with the visual style
        try { ensureGlassDepthLayer(style); } catch (e) { }
        btns.forEach(b => b.classList.toggle('active', b.dataset.visual === style));
    }

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const style = btn.dataset.visual;
            applyVisualStyle(style);
            saveSetting('visual', style);
        });
    });

    // Load saved style — fallback 'default' ensures Default btn is always marked active on fresh load
    const savedVisual = loadSetting('visual') || 'default';
    applyVisualStyle(savedVisual);

    // Remove data-glass-entering after entrance animations finish (~1.6s covers the longest delay+duration)
    // This allows entrance animations to play on load, then switches to stacking-context-safe glass state
    if (document.documentElement.hasAttribute('data-glass-entering')) {
        setTimeout(() => {
            document.documentElement.removeAttribute('data-glass-entering');
        }, 1600);
    }
})();

// --- Color Swatches ---
document.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        applyAccent(sw.dataset.accent, sw.dataset.dim);
        document.getElementById('customAccent').value = sw.dataset.accent;
        saveSetting('accent', sw.dataset.accent); saveSetting('dim', sw.dataset.dim);
    });
});

// --- Custom Color Picker ---
document.getElementById('customAccent').addEventListener('input', function () {
    applyAccent(this.value, this.value);
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    saveSetting('accent', this.value); saveSetting('dim', this.value);
});

// --- Background Themes ---
const themes = {
    dark: { primary: '#0A0E27', secondary: '#1A1F3A', border: '#27273A' },
    black: { primary: '#000000', secondary: '#0D0D0D', border: '#1A1A1A' },
    navy: { primary: '#0F172A', secondary: '#1E293B', border: '#334155' },
    slate: { primary: '#1E1E2E', secondary: '#2A2A3E', border: '#3A3A52' },
    forest: { primary: '#0D1F0D', secondary: '#162616', border: '#243824' },
    midnight: { primary: '#0D0D1F', secondary: '#16163A', border: '#252550' },
    volcano: { primary: '#1A0A00', secondary: '#2D1200', border: '#3D1500' },
    abyss: { primary: '#020C10', secondary: '#071A24', border: '#0A2535' },
    obsidian: { primary: '#13111C', secondary: '#1E1B2E', border: '#2D2840' },
    dusk: { primary: '#1C0F22', secondary: '#2E1A38', border: '#3A1F4A' },
};
document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const t = themes[btn.dataset.theme];
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--secondary', t.secondary);
        root.style.setProperty('--border', t.border);
        // Update glass depth layer if glass mode is active
        if (document.documentElement.getAttribute('data-visual') === 'glass') {
            try { updateGlassDepthLayer(); } catch (e) { }
        }
        saveSetting('theme', btn.dataset.theme);
    });
});

// --- Background Effects ---
document.querySelectorAll('[data-bg]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-bg]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const accentNow = getComputedStyle(root).getPropertyValue('--accent').trim() || '#00F5A0';
        applyBgEffect(btn.dataset.bg, hexToRgb(accentNow));
        saveSetting('bgEffect', btn.dataset.bg);
    });
});

// --- Helpers ---
function saveSetting(key, val) { try { localStorage.setItem('pf_' + key, val); document.dispatchEvent(new Event('settingsChanged')); } catch (e) { } }
function loadSetting(key) { try { return localStorage.getItem('pf_' + key) } catch (e) { return null } }

// --- Reset ---
document.getElementById('settingsReset').addEventListener('click', () => {
    ['accent', 'dim', 'theme', 'bgEffect', 'visual'].forEach(k => { try { localStorage.removeItem('pf_' + k) } catch (e) { } });
    // Store reset signal so buildResumeUrl encodes it after reload
    try { localStorage.setItem('pf_resetPending', '1'); } catch (e) { }
    try { location.reload(); } catch (e) { }
});

// ── Theme Sync: encode current settings into resume URL ──
(function syncResumeLink() {
    const resumeLink = document.getElementById('resumeNavLink');
    if (!resumeLink) return;
    const BASE = 'https://james-tercenio-resume.vercel.app/';

    function buildResumeUrl() {
        // If a reset was just triggered, signal resume to reset too
        try {
            if (localStorage.getItem('pf_resetPending') === '1') {
                localStorage.removeItem('pf_resetPending');
                resumeLink.href = BASE + '?reset=1';
                return;
            }
        } catch (e) { }

        const params = new URLSearchParams();
        const accent = loadSetting('accent');
        const dim = loadSetting('dim');
        const theme = loadSetting('theme');
        const bgEffect = loadSetting('bgEffect');
        const visual = loadSetting('visual') || 'default'; // always send so resume can turn glass OFF
        if (accent) params.set('accent', accent);
        if (dim) params.set('dim', dim);
        if (theme) params.set('theme', theme);
        if (bgEffect) params.set('bg', bgEffect);
        params.set('visual', visual); // always include
        const qs = params.toString();
        resumeLink.href = qs ? BASE + '?' + qs : BASE;
    }

    buildResumeUrl();
    document.addEventListener('settingsChanged', buildResumeUrl);
})();

// ── Hover glow tracking (cards) ──
(function attachHoverGlow() {
    if (!window.matchMedia || window.matchMedia('(hover: hover)').matches === false) return;
    const targets = document.querySelectorAll('.project-card, .skill-card, .timeline-item, .contact-card');
    targets.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * 100;
            const y = ((e.clientY - r.top) / r.height) * 100;
            el.style.setProperty('--mx', x.toFixed(2) + '%');
            el.style.setProperty('--my', y.toFixed(2) + '%');
        }, { passive: true });
    });
})();

// --- Sync from URL params handled in <head> inline script ---

// --- Load saved settings on page load ---
(function loadSaved() {
    const accent = loadSetting('accent');
    const dim = loadSetting('dim');
    const theme = loadSetting('theme');
    const bgEffect = loadSetting('bgEffect');
    if (accent) {
        applyAccent(accent, dim || accent);
        document.getElementById('customAccent').value = accent;
        document.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s.dataset.accent === accent));
    }
    if (theme && themes[theme]) {
        const t = themes[theme];
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--secondary', t.secondary);
        root.style.setProperty('--border', t.border);
        document.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
    }
    if (bgEffect) {
        currentBgEffect = bgEffect;
        const accentNow = accent || '#00F5A0';
        applyBgEffect(bgEffect, hexToRgb(accentNow));
        document.querySelectorAll('[data-bg]').forEach(b => b.classList.toggle('active', b.dataset.bg === bgEffect));
    }
})();
