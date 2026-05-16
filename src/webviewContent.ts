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
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

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

    .empty-state .icon {
      font-size: 28px;
      margin-bottom: 6px;
    }

    .empty-state .hint {
      font-size: 12px;
      margin-top: 4px;
    }

    .block-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 10px;
    }

    .block-item {
      display: flex;
      align-items: center;
      padding: 6px 8px;
      border-radius: 4px;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      transition: background 0.15s;
      animation: fadeIn 0.2s ease;
    }

    .block-item:hover {
      background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.05));
    }

    .block-color {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
      flex-shrink: 0;
    }

    .block-info {
      flex: 1;
      min-width: 0;
    }

    .block-file {
      font-weight: 600;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .block-lines {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      margin-top: 1px;
    }

    .block-remove {
      background: none;
      border: none;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      font-size: 14px;
      padding: 2px 4px;
      border-radius: 3px;
      transition: all 0.15s;
      flex-shrink: 0;
      line-height: 1;
    }

    .block-remove:hover {
      color: var(--danger);
      background: rgba(244, 71, 71, 0.1);
    }

    .prompt-section {
      margin-bottom: 10px;
    }

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

    .prompt-input:focus {
      border-color: var(--vscode-focusBorder);
    }

    .prompt-input::placeholder {
      color: var(--vscode-descriptionForeground);
    }

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

    .btn-stash:hover {
      background: var(--btn-secondary-hover);
    }

    .btn-copy {
      background: var(--btn-bg);
      color: var(--btn-fg);
    }

    .btn-copy:hover {
      background: var(--btn-hover);
    }

    .btn-copy:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-clear {
      background: none;
      color: var(--vscode-descriptionForeground);
      border: 1px solid var(--border);
      flex: 0.5;
    }

    .btn-clear:hover {
      background: rgba(244, 71, 71, 0.1);
      color: var(--danger);
    }

    .success-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 100;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    .success-overlay.show {
      display: flex;
    }

    .success-overlay .icon {
      font-size: 36px;
      margin-bottom: 4px;
    }

    .success-overlay .text {
      font-size: 14px;
      font-weight: 600;
      color: var(--success);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(2px); }
      to { opacity: 1; transform: translateY(0); }
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

  <div id="successOverlay" class="success-overlay">
    <div class="icon">✓</div>
    <div class="text">已复制到剪贴板</div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    let currentBlocks = [];
    let currentPrompt = '';
    let colors = ['#4A90E2', '#F5A623', '#7ED321', '#BD10E0', '#8B572A'];

    const blockList = document.getElementById('blockList');
    const emptyState = document.getElementById('emptyState');
    const blockCount = document.getElementById('blockCount');
    const promptInput = document.getElementById('promptInput');
    const btnStash = document.getElementById('btnStash');
    const btnCopy = document.getElementById('btnCopy');
    const btnClear = document.getElementById('btnClear');
    const successOverlay = document.getElementById('successOverlay');

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function render() {
      blockCount.textContent = currentBlocks.length;
      emptyState.style.display = currentBlocks.length === 0 ? 'block' : 'none';
      btnCopy.disabled = currentBlocks.length === 0;

      blockList.innerHTML = '';

      var idx = 0;
      currentBlocks.forEach(function(block) {
        var item = document.createElement('div');
        item.className = 'block-item';

        var lineInfo = block.startLine === block.endLine
          ? '' + block.startLine
          : block.startLine + '-' + block.endLine;

        var color = colors[block.colorIndex % colors.length];

        item.innerHTML =
          '<div class="block-color" style="background:' + color + '"></div>' +
          '<div class="block-info">' +
            '<div class="block-file">' + escapeHtml(block.fileName) + '</div>' +
            '<div class="block-lines">' + escapeHtml(lineInfo) + '</div>' +
          '</div>' +
          '<button class="block-remove" data-idx="' + idx + '" title="移除">×</button>';

        blockList.appendChild(item);
        idx++;
      });
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
        successOverlay.classList.add('show');
        setTimeout(function() {
          successOverlay.classList.remove('show');
        }, 1500);
      }
    });

    blockList.addEventListener('click', function(e) {
      if (e.target.classList.contains('block-remove')) {
        var idx = parseInt(e.target.dataset.idx);
        var block = currentBlocks[idx];
        if (block) {
          vscode.postMessage({
            type: 'removeBlock',
            payload: {
              filePath: block.filePath,
              startLine: block.startLine,
              endLine: block.endLine
            }
          });
        }
      }
    });

    var promptTimer = null;
    promptInput.addEventListener('input', function() {
      clearTimeout(promptTimer);
      promptTimer = setTimeout(function() {
        vscode.postMessage({
          type: 'updatePrompt',
          payload: promptInput.value
        });
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
