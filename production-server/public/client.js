(() => {
  const socket = io();
  const room = new URLSearchParams(location.search).get('room') || 'default';
  const name = (localStorage.getItem('ub-name') || `User-${Math.floor(Math.random()*9000)+1000}`);
  const color = localStorage.getItem('ub-color') || null;

  // UI elements
  const editor = document.getElementById('editor');
  const cursors = document.getElementById('cursors');
  const presence = document.getElementById('presence');

  function createFlagEl(user) {
    const el = document.createElement('div');
    el.className = 'flag';
    el.dataset.id = user.id;
    el.style.setProperty('--flag-color', user.color || '#f06');
    el.innerHTML = `<span class="dot" style="background:${user.color}"></span><span class="label">${user.name}</span>`;
    return el;
  }

  const remoteFlags = new Map();

  socket.on('connect', () => {
    socket.emit('join', room, { name, color });
  });

  socket.on('doc', (content) => {
    editor.value = content || '';
  });

  // When other clients send content
  socket.on('content', (content) => {
    // naive merge: replace entire content
    const pos = editor.selectionStart;
    editor.value = content;
    // try to keep cursor roughly where it was
    editor.selectionStart = editor.selectionEnd = Math.min(pos, editor.value.length);
  });

  // Presence updates
  socket.on('presence', (users) => {
    presence.innerHTML = '';
    users.forEach(u => {
      const pill = document.createElement('div');
      pill.className = 'presence-pill';
      pill.textContent = u.name;
      pill.style.background = u.color;
      presence.appendChild(pill);
    });
  });

  socket.on('cursor', ({ id, user, rect }) => {
    let el = remoteFlags.get(id);
    if (!el) {
      el = createFlagEl(user);
      remoteFlags.set(id, el);
      cursors.appendChild(el);
    }
    // position the flag above the rect
    if (rect) {
      el.style.display = 'block';
      el.style.left = `${rect.x}px`;
      el.style.top = `${Math.max(0, rect.y - 28)}px`;
    }
  });

  socket.on('leave', (id) => {
    const el = remoteFlags.get(id);
    if (el) {
      el.remove();
      remoteFlags.delete(id);
    }
  });

  // send content on input (debounced)
  let contentTimer = null;
  editor.addEventListener('input', () => {
    clearTimeout(contentTimer);
    contentTimer = setTimeout(() => {
      socket.emit('content', { room, content: editor.value });
    }, 150);
  });

  // send cursor position (mouse or keyboard movement)
  function sendCursor() {
    const rect = editor.getBoundingClientRect();
    // approximate cursor position inside textarea by using caret coordinates via range on a mirror
    // We'll compute a simple approximation using selectionStart ratio
    const idx = editor.selectionStart;
    const lines = editor.value.substr(0, idx).split('\n');
    const line = lines.length - 1;
    const col = lines[lines.length - 1].length;

    // approximate character size
    const approxCharWidth = 7; // px (may vary)
    const approxLineHeight = 18; // px

    const x = rect.left + 8 + col * approxCharWidth;
    const y = rect.top + 8 + line * approxLineHeight;

    socket.emit('cursor', { room, rect: { x: Math.round(x), y: Math.round(y) } });
  }

  editor.addEventListener('keyup', sendCursor);
  editor.addEventListener('click', sendCursor);
  editor.addEventListener('scroll', sendCursor);

  // initial cursor send
  setTimeout(sendCursor, 500);
})();
