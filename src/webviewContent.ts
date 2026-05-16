export function getWebviewContent(placeholder: string): string {
  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <title>S Copy</title>
  <style nonce="${nonce}">
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      color: var(--vscode-foreground, #cccccc);
      background: var(--vscode-sideBar-background, var(--vscode-editor-background, #1e1e1e));
      padding: 8px;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--vscode-sideBar-border, var(--vscode-panel-border, rgba(128,128,128,0.35)));
    }

    .header h2 {
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--vscode-foreground, #cccccc);
    }

    .header .count {
      color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.7));
      font-size: 11px;
      font-weight: 400;
    }

    .empty-state {
      text-align: center;
      padding: 24px 12px;
      color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.7));
    }

    .empty-state .icon { font-size: 28px; margin-bottom: 6px; }
    .empty-state .hint { font-size: 12px; margin-top: 4px; }

    .block-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
    }

    .block-card {
      border-radius: 4px;
      background: var(--vscode-input-background, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--vscode-input-border, rgba(128, 128, 128, 0.35));
      overflow: hidden;
      animation: fadeIn 0.2s ease;
    }

    .block-item {
      display: flex;
      align-items: center;
      padding: 5px 8px;
      gap: 6px;
    }

    .block-icon {
      font-size: 13px;
      flex-shrink: 0;
      line-height: 1;
    }

    .block-location {
      flex: 1;
      font-size: 12px;
      color: var(--vscode-foreground, #cccccc);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .block-location .warn-icon { color: #cca700; font-size: 11px; }

    .block-remove {
      background: none;
      border: none;
      color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.7));
      cursor: pointer;
      font-size: 13px;
      padding: 0 3px;
      border-radius: 3px;
      transition: all 0.15s;
      line-height: 1;
      flex-shrink: 0;
    }

    .block-remove:hover {
      color: #f44747;
      background: rgba(244, 71, 71, 0.1);
    }

    .file-desc-input {
      display: block;
      width: calc(100% - 32px);
      margin: 0 8px 6px 24px;
      padding: 3px 6px;
      border-radius: 3px;
      border: 1px solid var(--vscode-input-border, rgba(128, 128, 128, 0.35));
      background: var(--vscode-sideBar-background, var(--vscode-editor-background, #1e1e1e));
      color: var(--vscode-input-foreground, var(--vscode-foreground, #cccccc));
      font-family: var(--vscode-font-family, sans-serif);
      font-size: 11px;
      outline: none;
      transition: border-color 0.15s;
    }

    .file-desc-input:focus { border-color: var(--vscode-focusBorder, #007fd4); }
    .file-desc-input::placeholder { color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.5)); }

    .prompt-section { margin-bottom: 10px; }

    .prompt-label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.7));
      margin-bottom: 4px;
    }

    .prompt-input {
      width: 100%;
      padding: 6px 8px;
      border-radius: 4px;
      border: 1px solid var(--vscode-input-border, rgba(128, 128, 128, 0.35));
      background: var(--vscode-input-background, rgba(255, 255, 255, 0.05));
      color: var(--vscode-input-foreground, var(--vscode-foreground, #cccccc));
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      resize: vertical;
      min-height: 48px;
      outline: none;
      transition: border-color 0.15s;
    }

    .prompt-input:focus { border-color: var(--vscode-focusBorder, #007fd4); }
    .prompt-input::placeholder { color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.5)); }

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
      font-family: var(--vscode-font-family, sans-serif);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      text-align: center;
    }

    .btn-copy {
      background: var(--vscode-button-background, #0e639c);
      color: var(--vscode-button-foreground, #ffffff);
    }
    .btn-copy:hover { background: var(--vscode-button-hoverBackground, #1177bb); }
    .btn-copy:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-clear {
      background: none;
      color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.7));
      border: 1px solid var(--vscode-sideBar-border, var(--vscode-panel-border, rgba(128,128,128,0.35)));
      flex: 0.5;
    }
    .btn-clear:hover { background: rgba(244, 71, 71, 0.1); color: #f44747; }

    .copy-countdown {
      display: none;
      text-align: center;
      margin-top: 8px;
      font-size: 12px;
      color: #73c991;
      font-weight: 600;
    }

    .copy-countdown.show { display: block; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(2px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>已收集<span class="count" id="blockCount">0</span></h2>
  </div>

  <div id="emptyState" class="empty-state">
    <div class="icon">📝</div>
    <div>暂无收集的代码块</div>
    <div class="hint">选中代码后按 Cmd+; 收集</div>
  </div>

  <div id="blockList" class="block-list"></div>

  <div class="prompt-section">
    <div class="prompt-label">💬 汇总说明（可选）</div>
    <textarea
      id="promptInput"
      class="prompt-input"
      placeholder="${escapeHtml(placeholder)}"
    ></textarea>
  </div>

  <div class="actions">
    <button id="btnClear" class="btn btn-clear" title="清空所有">清空</button>
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
    var btnCopy = document.getElementById('btnCopy');
    var btnClear = document.getElementById('btnClear');
    var copyCountdown = document.getElementById('copyCountdown');

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function render() {
      blockCount.textContent = currentBlocks.length;
      emptyState.style.display = currentBlocks.length === 0 ? 'block' : 'none';
      btnCopy.disabled = currentBlocks.length === 0;

      blockList.innerHTML = '';

      currentBlocks.forEach(function(block, idx) {
        var warnIcon = block.isUntitled ? '<span class="warn-icon" title="未保存文件">⚠</span>' : '';
        var icon = block.isDirectory ? '📁' : '📄';

        var lineInfo = '';
        if (block.startLine === 0 && block.endLine === 0) {
          lineInfo = '';
        } else if (block.startLine === block.endLine) {
          lineInfo = ':' + block.startLine;
        } else {
          lineInfo = ':' + block.startLine + '-' + block.endLine;
        }

        var card = document.createElement('div');
        card.className = 'block-card';

        card.innerHTML =
          '<div class="block-item">' +
            '<span class="block-icon">' + icon + '</span>' +
            '<div class="block-location">' + warnIcon + escapeHtml(block.fileName) + lineInfo + '</div>' +
            '<button class="block-remove" data-idx="' + idx + '" title="移除">×</button>' +
          '</div>' +
          '<input type="text" class="file-desc-input" data-blockidx="' + idx + '" placeholder="添加说明（可选）" value="' + escapeHtml(block.description || '') + '">';

        blockList.appendChild(card);
      });

      bindDescInputs();
    }

    function bindDescInputs() {
      var inputs = blockList.querySelectorAll('.file-desc-input');
      inputs.forEach(function(input) {
        var timer = null;
        input.addEventListener('input', function() {
          var blockIdx = parseInt(input.dataset.blockidx);
          var val = input.value;
          var block = currentBlocks[blockIdx];
          if (block) {
            clearTimeout(timer);
            timer = setTimeout(function() {
              vscode.postMessage({
                type: 'updateDescription',
                payload: { filePath: block.filePath, startLine: block.startLine, endLine: block.endLine, description: val }
              });
            }, 300);
          }
        });
      });
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
    });

    blockList.addEventListener('click', function(e) {
      if (e.target.classList.contains('block-remove')) {
        var idx = parseInt(e.target.dataset.idx);
        var block = currentBlocks[idx];
        if (block) {
          vscode.postMessage({
            type: 'removeBlock',
            payload: { filePath: block.filePath, startLine: block.startLine, endLine: block.endLine }
          });
        }
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

    btnClear.addEventListener('click', function() {
      vscode.postMessage({ type: 'clearStash' });
    });

    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        vscode.postMessage({ type: 'copyAndClose' });
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
