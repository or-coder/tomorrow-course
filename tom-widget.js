/**
 * TOM — Tomorrow AI Widget
 * Embed on any page with one line:
 *   <script src="https://YOUR-SERVER/tom-widget.js"></script>
 *
 * Optional config (set BEFORE the script tag):
 *   <script>
 *     window.TOMConfig = {
 *       endpoint:   'https://your-server.com/api/messages', // default: /api/messages
 *       botName:    'TOM',
 *       botSubtitle:'Tomorrow · Clinical AI',
 *       accentColor:'#c9a84c',
 *       userColor:  '#8b4a2f',
 *       bgColor:    '#1a1512',
 *     };
 *   </script>
 */
(function () {
  /* ── Config ─────────────────────────────────────────── */
  const CFG = Object.assign({
    endpoint:    '/api/messages',
    botName:     'TOM',
    botSubtitle: 'Tomorrow · Clinical AI',
    accentColor: '#c9a84c',
    userColor:   '#8b4a2f',
    bgColor:     '#1a1512',
  }, window.TOMConfig || {});

  const HIST_STORE = 'tom_chat_hist';
  const MAX_SEND   = 8;
  const MAX_SAVE   = 30;

  /* ── CSS ─────────────────────────────────────────────── */
  const css = `
#tom-fab{position:fixed;bottom:28px;left:28px;width:56px;height:56px;border-radius:50%;
  background:${CFG.bgColor};border:none;cursor:pointer;z-index:2147483640;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 20px rgba(0,0,0,.4);transition:transform .2s,box-shadow .2s;font-family:sans-serif;}
#tom-fab:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(0,0,0,.5);}
#tom-fab svg{width:26px;height:26px;fill:${CFG.accentColor};}
#tom-fab::before{content:'';position:absolute;inset:-5px;border-radius:50%;
  border:2px solid ${CFG.accentColor}55;animation:tom-pulse 2.2s ease-out infinite;}
@keyframes tom-pulse{0%{transform:scale(1);opacity:.8}70%,100%{transform:scale(1.35);opacity:0}}

#tom-panel{position:fixed;bottom:96px;left:28px;width:380px;max-height:580px;
  background:${CFG.bgColor};border:1px solid ${CFG.accentColor}33;border-radius:12px;
  display:flex;flex-direction:column;z-index:2147483639;
  box-shadow:0 12px 48px rgba(0,0,0,.6);
  transform:translateY(20px) scale(.97);opacity:0;pointer-events:none;
  transition:transform .25s,opacity .25s;font-family:'Heebo',sans-serif;direction:rtl;}
#tom-panel.tom-open{transform:translateY(0) scale(1);opacity:1;pointer-events:all;}

.tom-header{display:flex;align-items:center;justify-content:space-between;
  padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.07);gap:10px;}
.tom-title{font-size:13px;font-weight:600;color:${CFG.accentColor};letter-spacing:.5px;}
.tom-sub{font-size:10px;color:rgba(255,255,255,.3);letter-spacing:1px;}
.tom-actions{display:flex;gap:6px;margin-right:auto;}
.tom-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.35);
  font-size:14px;padding:4px 6px;border-radius:4px;
  transition:color .15s,background .15s;line-height:1;}
.tom-btn:hover{color:${CFG.accentColor};background:${CFG.accentColor}14;}

.tom-welcome{display:flex;gap:10px;align-items:flex-start;padding:4px 0 8px;}
.tom-avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;margin-top:2px;
  background:linear-gradient(135deg,${CFG.userColor},${CFG.accentColor});
  display:flex;align-items:center;justify-content:center;
  font-size:14px;font-weight:700;color:#fff;}
.tom-welcome-bubble{background:rgba(255,255,255,.06);border-radius:10px;
  border-top-right-radius:3px;padding:11px 13px;font-size:13px;
  line-height:1.7;color:rgba(255,255,255,.8);}
.tom-welcome-bubble strong{color:${CFG.accentColor};}

.tom-sugg-btn{display:block;width:100%;background:${CFG.accentColor}12;
  border:1px solid ${CFG.accentColor}2e;border-radius:8px;
  color:rgba(255,255,255,.65);font-family:'Heebo',sans-serif;font-size:12px;
  padding:9px 12px;text-align:right;cursor:pointer;margin-top:6px;
  transition:background .15s,border-color .15s,color .15s;line-height:1.5;}
.tom-sugg-btn:hover{background:${CFG.accentColor}26;border-color:${CFG.accentColor}66;color:#fff;}

.tom-messages{flex:1;overflow-y:auto;padding:14px;display:flex;
  flex-direction:column;gap:10px;min-height:0;scroll-behavior:smooth;}
.tom-messages::-webkit-scrollbar{width:4px;}
.tom-messages::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px;}

.tom-msg{max-width:88%;padding:10px 13px;border-radius:10px;
  font-size:13px;line-height:1.65;word-break:break-word;position:relative;}
.tom-msg.user{align-self:flex-start;background:${CFG.userColor};color:#fff;border-bottom-left-radius:3px;}
.tom-msg.bot{align-self:flex-end;background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.85);border-bottom-right-radius:3px;padding-bottom:26px;}
.tom-msg.bot strong{color:${CFG.accentColor};}
.tom-msg a{color:${CFG.accentColor};text-decoration:underline;}
.tom-msg a:hover{color:#e0be6e;}

.tom-copy{position:absolute;bottom:6px;left:8px;background:none;border:none;
  cursor:pointer;color:rgba(255,255,255,.2);font-size:12px;padding:2px 5px;
  border-radius:3px;transition:color .15s,background .15s;line-height:1;font-family:monospace;}
.tom-copy:hover{color:${CFG.accentColor};background:${CFG.accentColor}1a;}

.tom-cursor{display:inline-block;color:${CFG.accentColor};margin-right:2px;
  animation:tom-blink .6s step-end infinite;}
@keyframes tom-blink{0%,100%{opacity:1}50%{opacity:0}}

.tom-typing{align-self:flex-end;background:rgba(255,255,255,.06);border-radius:10px;
  border-bottom-right-radius:3px;padding:12px 16px;display:flex;gap:5px;align-items:center;}
.tom-typing span{width:7px;height:7px;background:rgba(255,255,255,.4);border-radius:50%;
  display:inline-block;animation:tom-dot 1.1s infinite;}
.tom-typing span:nth-child(2){animation-delay:.18s;}
.tom-typing span:nth-child(3){animation-delay:.36s;}
@keyframes tom-dot{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}

.tom-input-row{display:flex;gap:8px;padding:10px 14px 14px;
  border-top:1px solid rgba(255,255,255,.07);}
.tom-input-row textarea{flex:1;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);border-radius:8px;
  color:rgba(255,255,255,.85);font-family:'Heebo',sans-serif;font-size:13px;
  padding:9px 11px;resize:none;outline:none;min-height:40px;max-height:100px;
  direction:rtl;transition:border-color .15s;line-height:1.5;}
.tom-input-row textarea:focus{border-color:${CFG.accentColor}66;}
.tom-input-row textarea::placeholder{color:rgba(255,255,255,.2);}
.tom-send{background:${CFG.userColor};border:none;border-radius:8px;
  width:40px;height:40px;cursor:pointer;display:flex;align-items:center;
  justify-content:center;flex-shrink:0;transition:background .15s;align-self:flex-end;}
.tom-send:hover{filter:brightness(1.15);}
.tom-send:disabled{background:rgba(255,255,255,.08);cursor:not-allowed;}
.tom-send svg{width:18px;height:18px;fill:#fff;}

@media(max-width:500px){
  #tom-panel{left:0;right:0;bottom:0;width:100%;max-height:80vh;
    border-radius:16px 16px 0 0;border-left:none;border-right:none;border-bottom:none;}
  #tom-fab{bottom:20px;left:16px;}
}`;

  /* ── Inject font + CSS ───────────────────────────────── */
  if (!document.querySelector('#tom-font')) {
    const lnk = document.createElement('link');
    lnk.id = 'tom-font';
    lnk.rel = 'stylesheet';
    lnk.href = 'https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600&display=swap';
    document.head.appendChild(lnk);
  }
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── Inject HTML ─────────────────────────────────────── */
  document.body.insertAdjacentHTML('beforeend', `
<button id="tom-fab" title="${CFG.botName}">
  <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6v-2h12v2zm0-3H6V7h12v2z"/></svg>
</button>
<div id="tom-panel">
  <div class="tom-header">
    <div><div class="tom-title">${CFG.botName}</div><div class="tom-sub">${CFG.botSubtitle}</div></div>
    <div class="tom-actions">
      <button class="tom-btn" id="tom-clear-btn" title="נקה שיחה">🗑</button>
      <button class="tom-btn" id="tom-close-btn" title="סגור">✕</button>
    </div>
  </div>
  <div class="tom-messages" id="tom-messages"></div>
  <div class="tom-input-row">
    <textarea id="tom-input" placeholder="שאל את ${CFG.botName}..." rows="1"></textarea>
    <button class="tom-send" id="tom-send-btn">
      <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
    </button>
  </div>
</div>`);

  /* ── State ───────────────────────────────────────────── */
  let history      = [];
  let busy         = false;
  let open         = false;
  let userScrolled = false; // true once user manually scrolls up during streaming

  /* ── Markdown renderer ───────────────────────────────── */
  function md(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,     '<em>$1</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
  }

  /* ── Copy button ─────────────────────────────────────── */
  function addCopy(div, plain) {
    const btn = document.createElement('button');
    btn.className = 'tom-copy'; btn.title = 'העתק'; btn.textContent = '⧉';
    btn.onclick = () => navigator.clipboard.writeText(plain).then(() => {
      btn.textContent = '✓'; btn.style.color = CFG.accentColor;
      setTimeout(() => { btn.textContent = '⧉'; btn.style.color = ''; }, 1600);
    });
    div.appendChild(btn);
  }

  /* ── History persistence ─────────────────────────────── */
  function saveHist() {
    try { localStorage.setItem(HIST_STORE, JSON.stringify(history.slice(-MAX_SAVE))); } catch(e) {}
  }
  function loadHist() {
    try { const s = localStorage.getItem(HIST_STORE); if (s) { history = JSON.parse(s); return history.length > 0; } } catch(e) {}
    return false;
  }

  /* ── Render ──────────────────────────────────────────── */
  function renderWelcome() {
    document.getElementById('tom-messages').innerHTML = `
      <div class="tom-welcome">
        <div class="tom-avatar">${CFG.botName[0]}</div>
        <div class="tom-welcome-bubble">
          <strong>שלום, אני ${CFG.botName} 👋</strong><br>
          העוזר האישי שלך לקורס Tomorrow.<br>
          אני יכול להסביר מושגים, להרחיב נושאים ולצרף מאמרים מדעיים מאומתים.<br><br>
          <span style="color:rgba(255,255,255,.4);font-size:11px;letter-spacing:1px">לדוגמה תוכל לשאול:</span>
          <button class="tom-sugg-btn" data-q="מה הם 12 ה-Hallmarks of Aging לפי Lopez-Otin 2023?">מה הם 12 ה-Hallmarks of Aging לפי Lopez-Otin 2023?</button>
          <button class="tom-sugg-btn" data-q="הסבר את הקשר בין mTOR ל-Autophagy — עם מאמרים">הסבר את הקשר בין mTOR ל-Autophagy — עם מאמרים</button>
          <button class="tom-sugg-btn" data-q="מה ההבדל בין Healthspan ל-Lifespan ומה המחקר העדכני אומר?">מה ההבדל בין Healthspan ל-Lifespan ומה המחקר העדכני אומר?</button>
        </div>
      </div>`;
  }

  function renderHistoryUI() {
    const box = document.getElementById('tom-messages');
    box.innerHTML = '';
    history.forEach(msg => {
      const role = msg.role === 'user' ? 'user' : 'bot';
      const div  = document.createElement('div');
      div.className = `tom-msg ${role}`;
      div.innerHTML = md(msg.content);
      if (role === 'bot') addCopy(div, msg.content);
      box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
  }

  function appendUser(text) {
    document.getElementById('tom-messages').querySelector('.tom-welcome')?.remove();
    const div = document.createElement('div');
    div.className = 'tom-msg user'; div.innerHTML = md(text);
    const box = document.getElementById('tom-messages');
    box.appendChild(div); box.scrollTop = box.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'tom-typing'; el.id = 'tom-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    const box = document.getElementById('tom-messages');
    box.appendChild(el); box.scrollTop = box.scrollHeight;
  }
  function hideTyping() { document.getElementById('tom-typing')?.remove(); }

  function scrollToBottom(box) {
    box.scrollTop = box.scrollHeight;
  }

  function mkStreamMsg() {
    const div = document.createElement('div'); div.className = 'tom-msg bot';
    const box = document.getElementById('tom-messages');
    box.appendChild(div); scrollToBottom(box); return div;
  }
  function updateStream(div, text) {
    div.innerHTML = md(text) + '<span class="tom-cursor">▋</span>';
    if (!userScrolled) scrollToBottom(document.getElementById('tom-messages'));
  }
  function finalStream(div, text) {
    div.innerHTML = md(text); addCopy(div, text);
  }

  /* ── API call ────────────────────────────────────────── */
  async function send(text) {
    if (busy || !text.trim()) return;
    userScrolled = false; // reset — new message always starts at bottom
    history.push({ role: 'user', content: text });
    appendUser(text); saveHist(); showTyping();
    busy = true; document.getElementById('tom-send-btn').disabled = true;

    try {
      const res = await fetch(CFG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048, stream: true,
          messages: history.slice(-MAX_SEND)
        })
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error?.message || `HTTP ${res.status}`);
      }

      hideTyping();
      const msgDiv = mkStreamMsg();
      let full = '', buf = '';
      const reader = res.body.getReader(), dec = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const j = JSON.parse(data);
            if (j.type === 'content_block_delta' && j.delta?.type === 'text_delta') {
              full += j.delta.text; updateStream(msgDiv, full);
            }
          } catch(_) {}
        }
      }
      finalStream(msgDiv, full);
      history.push({ role: 'assistant', content: full }); saveHist();

    } catch(e) {
      hideTyping();
      const div = document.createElement('div'); div.className = 'tom-msg bot';
      div.textContent = `שגיאה: ${e.message}`;
      document.getElementById('tom-messages').appendChild(div);
    } finally {
      busy = false; document.getElementById('tom-send-btn').disabled = false;
    }
  }

  /* ── Events ──────────────────────────────────────────── */
  // Detect manual scroll-up during streaming → stop auto-scroll
  document.getElementById('tom-messages').addEventListener('scroll', function() {
    if (busy) {
      const atBottom = this.scrollHeight - this.scrollTop - this.clientHeight < 80;
      userScrolled = !atBottom;
    }
  }, { passive: true });

  // Delegated listener — catches suggestion clicks even after innerHTML replacement
  document.getElementById('tom-messages').addEventListener('click', e => {
    const btn = e.target.closest('.tom-sugg-btn');
    if (btn && !busy) send(btn.dataset.q);
  });

  document.getElementById('tom-fab').addEventListener('click', () => {
    open = !open;
    document.getElementById('tom-panel').classList.toggle('tom-open', open);
  });
  document.getElementById('tom-close-btn').addEventListener('click', () => {
    open = false; document.getElementById('tom-panel').classList.remove('tom-open');
  });
  document.getElementById('tom-clear-btn').addEventListener('click', () => {
    history = [];
    try { localStorage.removeItem(HIST_STORE); } catch(e) {}
    renderWelcome();
  });
  document.getElementById('tom-send-btn').addEventListener('click', () => {
    const ta = document.getElementById('tom-input');
    const t = ta.value.trim(); ta.value = ''; ta.style.height = 'auto'; send(t);
  });
  document.getElementById('tom-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const ta = e.target, t = ta.value.trim(); ta.value = ''; ta.style.height = 'auto'; send(t);
    }
  });
  document.getElementById('tom-input').addEventListener('input', function() {
    this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px';
  });

  /* ── Init ────────────────────────────────────────────── */
  setTimeout(() => {}, 0); // yield to page load
  if (loadHist()) renderHistoryUI(); else renderWelcome();

})();
