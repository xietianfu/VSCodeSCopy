export function getWebviewContent(placeholder: string): string {
  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <title>Easy Copy</title>
  <style nonce="${nonce}">
    :root {
      --bg: var(--vscode-sideBar-background);
      --fg: var(--vscode-sideBar-foreground);
      --border: var(--vscode-sideBar-border, rgba(255,255,255,0.08));
      --input-bg: var(--vscode-input-background);
      --input-fg: var(--vscode-input-foreground);
      --input-border: var(--vscode-input-border, rgba(255,255,255,0.1));
      --btn-bg: var(--vscode-button-background);
      --btn-fg: var(--vscode-button-foreground);
      --btn-hover: var(--vscode-button-hoverBackground);
      --btn-secondary-bg: var(--vscode-button-secondaryBackground);
      --btn-secondary-fg: var(--vscode-button-secondaryForeground);
      --btn-secondary-hover: var(--vscode-button-secondaryHoverBackground);
      --danger: #f44747;
      --success: #73c991;
      --warn: #cca700;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--fg);
      background: var(--bg);
      padding: 8px;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border);
    }

    .header h2 {
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .header .count {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      font-weight: 400;
    }

    .empty-state {
      text-align: center;
      padding: 24px 12px;
      color: var(--vscode-descriptionForeground);
    }

    .empty-state .icon { font-size: 28px; margin-bottom: 6px; }
    .empty-state .hint { font-size: 12px; margin-top: 4px; }

    .block-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
    }

    .file-group {
      border-radius: 4px;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      overflow: hidden;
      animation: fadeIn 0.2s ease;
    }

    .file-group.flash {
      animation: flashAnim 0.6s ease;
    }

    .file-header {
      display: flex;
      align-items: center;
      padding: 6px 8px;
      gap: 6px;
    }

    .file-color {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .file-name {
      flex: 1;
      font-weight: 600;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .file-name .warn-icon {
      color: var(--warn);
      font-size: 12px;
    }

    .file-remove {
      background: none;
      border: none;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      font-size: 14px;
      padding: 0 4px;
      border-radius: 3px;
      transition: all 0.15s;
      line-height: 1;
    }

    .file-remove:hover {
      color: var(--danger);
      background: rgba(244, 71, 71, 0.1);
    }

    .line-list {
      padding: 0 8px 6px 22px;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      line-height: 1.6;
    }

    .prompt-section { margin-bottom: 10px; }

    .prompt-label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
    }

    .prompt-input {
      width: 100%;
      padding: 6px 8px;
      border-radius: 4px;
      border: 1px solid var(--input-border);
      background: var(--input-bg);
      color: var(--input-fg);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      resize: vertical;
      min-height: 48px;
      outline: none;
      transition: border-color 0.15s;
    }

    .prompt-input:focus { border-color: var(--vscode-focusBorder); }
    .prompt-input::placeholder { color: var(--vscode-descriptionForeground); }

    .actions {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }

    .btn {
      flex: 1;
      padding: 6px 12px;
      border-radius: 4px;
      border: none;
      font-family: var(--vscode-font-family);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      text-align: center;
    }

    .btn-stash {
      background: var(--btn-secondary-bg);
      color: var(--btn-secondary-fg);
    }
    .btn-stash:hover { background: var(--btn-secondary-hover); }

    .btn-copy {
      background: var(--btn-bg);
      color: var(--btn-fg);
    }
    .btn-copy:hover { background: var(--btn-hover); }
    .btn-copy:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-clear {
      background: none;
      color: var(--vscode-descriptionForeground);
      border: 1px solid var(--border);
      flex: 0.5;
    }
    .btn-clear:hover { background: rgba(244, 71, 71, 0.1); color: var(--danger); }

    .copy-countdown {
      display: none;
      text-align: center;
      margin-top: 8px;
      font-size: 12px;
      color: var(--success);
      font-weight: 600;
    }

    .copy-countdown.show { display: block; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(2px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes flashAnim {
      0%, 100% { background: var(--input-bg); }
      25% { background: rgba(255, 255, 255, 0.15); }
      50% { background: var(--input-bg); }
      75% { background: rgba(255, 255, 255, 0.15); }
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>📋 已收集 <span class="count" id="blockCount">0</span> 个代码块</h2>
  </div>

  <div id="emptyState" class="empty-state">
    <div class="icon">📝</div>
    <div>暂无收集的代码块</div>
    <div class="hint">选中代码后按 Cmd+; 收集</div>
  </div>

  <div id="blockList" class="block-list"></div>

  <div class="prompt-section">
    <div class="prompt-label">💬 给 AI 的提示（可选）</div>
    <textarea
      id="promptInput"
      class="prompt-input"
      placeholder="${escapeHtml(placeholder)}"
    ></textarea>
  </div>

  <div class="actions">
    <button id="btnClear" class="btn btn-clear" title="清空所有">清空</button>
    <button id="btnStash" class="btn btn-stash">暂存</button>
    <button id="btnCopy" class="btn btn-copy">✓ 完成并复制</button>
  </div>

  <div id="copyCountdown" class="copy-countdown"></div>

  <script nonce="${nonce}">
    var vscode = acquireVsCodeApi();
    var currentBlocks = [];
    var currentPrompt = '';
    var colors = ['#4A90E2', '#F5A623', '#7ED321', '#BD10E0', '#8B572A'];

    var blockList = document.getElementById('blockList');
    var emptyState = document.getElementById('emptyState');
    var blockCount = document.getElementById('blockCount');
    var promptInput = document.getElementById('promptInput');
    var btnStash = document.getElementById('btnStash');
    var btnCopy = document.getElementById('btnCopy');
    var btnClear = document.getElementById('btnClear');
    var copyCountdown = document.getElementById('copyCountdown');

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatLineInfo(startLine, endLine) {
      return startLine === endLine ? '' + startLine : startLine + '-' + endLine;
    }

    function render() {
      blockCount.textContent = currentBlocks.length;
      emptyState.style.display = currentBlocks.length === 0 ? 'block' : 'none';
      btnCopy.disabled = currentBlocks.length === 0;

      blockList.innerHTML = '';

      var groups = {};
      currentBlocks.forEach(function(block, idx) {
        if (!groups[block.filePath]) {
          groups[block.filePath] = { blocks: [], indices: [], colorIndex: block.colorIndex, fileName: block.fileName, isUntitled: block.isUntitled };
        }
        groups[block.filePath].blocks.push(block);
        groups[block.filePath].indices.push(idx);
      });

      var filePaths = Object.keys(groups);
      filePaths.forEach(function(fp) {
        var g = groups[fp];
        var color = colors[g.colorIndex % colors.length];

        var group = document.createElement('div');
        group.className = 'file-group';
        group.dataset.filepath = fp;

        var warnIcon = g.isUntitled ? '<span class="warn-icon" title="未保存文件">⚠</span>' : '';

        var lineInfos = g.blocks.map(function(b) {
          return formatLineInfo(b.startLine, b.endLine);
        }).join('\\n    ');

        group.innerHTML =
          '<div class="file-header">' +
            '<div class="file-color" style="background:' + color + '"></div>' +
            '<div class="file-name">' + warnIcon + escapeHtml(g.fileName) + '</div>' +
            '<button class="file-remove" data-filepath="' + escapeHtml(fp) + '" title="移除文件所有块">×</button>' +
          '</div>' +
          '<div class="line-list">' + lineInfos + '</div>';

        blockList.appendChild(group);
      });
    }

    function flashFileGroup(filePath) {
      var groups = blockList.querySelectorAll('.file-group');
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].dataset.filepath === filePath) {
          groups[i].classList.add('flash');
          setTimeout(function(el) { el.classList.remove('flash'); }, 700, groups[i]);
          break;
        }
      }
    }

    function startCountdown(seconds) {
      var remaining = seconds;
      copyCountdown.textContent = '✓ 已复制 (' + remaining + 's)';
      copyCountdown.classList.add('show');
      var timer = setInterval(function() {
        remaining--;
        if (remaining <= 0) {
          clearInterval(timer);
          copyCountdown.classList.remove('show');
        } else {
          copyCountdown.textContent = '✓ 已复制 (' + remaining + 's)';
        }
      }, 1000);
    }

    window.addEventListener('message', function(event) {
      var message = event.data;
      if (message.type === 'updateState') {
        var payload = message.payload;
        currentBlocks = payload.blocks || [];
        colors = payload.colors || colors;
        currentPrompt = payload.prompt || '';
        if (document.activeElement !== promptInput) {
          promptInput.value = currentPrompt;
        }
        render();
      }
      if (message.type === 'copySuccess') {
        startCountdown(3);
      }
      if (message.type === 'flashBlock') {
        flashFileGroup(message.payload);
      }
    });

    blockList.addEventListener('click', function(e) {
      if (e.target.classList.contains('file-remove')) {
        var fp = e.target.dataset.filepath;
        var toRemove = currentBlocks.filter(function(b) { return b.filePath === fp; });
        toRemove.forEach(function(block) {
          vscode.postMessage({
            type: 'removeBlock',
            payload: { filePath: block.filePath, startLine: block.startLine, endLine: block.endLine }
          });
        });
      }
    });

    var promptTimer = null;
    promptInput.addEventListener('input', function() {
      clearTimeout(promptTimer);
      promptTimer = setTimeout(function() {
        vscode.postMessage({ type: 'updatePrompt', payload: promptInput.value });
      }, 300);
    });

    btnCopy.addEventListener('click', function() {
      vscode.postMessage({ type: 'copyAndClose' });
    });

    btnStash.addEventListener('click', function() {
      vscode.postMessage({ type: 'stashAndClose' });
    });

    btnClear.addEventListener('click', function() {
      vscode.postMessage({ type: 'clearStash' });
    });

    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        vscode.postMessage({ type: 'copyAndClose' });
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        vscode.postMessage({ type: 'stashAndClose' });
      }
    });

    vscode.postMessage({ type: 'requestState' });
  </script>
</body>
</html>`;
}

function getNonce(): string {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
