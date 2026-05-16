export function getHistoryWebviewContent(): string {
  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <title>Easy Copy History</title>
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
      --danger: #f44747;
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

    .header h2 { font-size: 13px; font-weight: 600; }

    .search-input {
      width: 100%;
      padding: 5px 8px;
      border-radius: 4px;
      border: 1px solid var(--input-border);
      background: var(--input-bg);
      color: var(--input-fg);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      outline: none;
      margin-bottom: 10px;
    }

    .search-input:focus { border-color: var(--vscode-focusBorder); }
    .search-input::placeholder { color: var(--vscode-descriptionForeground); }

    .empty-state {
      text-align: center;
      padding: 24px 12px;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
    }

    .project-group { margin-bottom: 10px; }

    .project-header {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 0;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      color: var(--vscode-descriptionForeground);
      user-select: none;
    }

    .project-header:hover { color: var(--fg); }
    .project-header .arrow { font-size: 10px; transition: transform 0.15s; }
    .project-header.collapsed .arrow { transform: rotate(-90deg); }

    .project-records { display: flex; flex-direction: column; gap: 6px; padding-left: 14px; }
    .project-records.hidden { display: none; }

    .record-card {
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 4px;
      padding: 8px;
      animation: fadeIn 0.2s ease;
    }

    .record-time {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
    }

    .record-prompt {
      font-size: 11px;
      color: var(--fg);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .record-files {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.5;
      margin-bottom: 6px;
    }

    .record-actions {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }

    .record-btn {
      background: none;
      border: 1px solid var(--border);
      color: var(--vscode-descriptionForeground);
      font-family: var(--vscode-font-family);
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .record-btn:hover { background: rgba(255,255,255,0.05); color: var(--fg); }
    .record-btn.delete:hover { background: rgba(244,71,71,0.1); color: var(--danger); }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(2px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>📋 代码审查历史</h2>
  </div>

  <input type="text" id="searchInput" class="search-input" placeholder="🔍 搜索历史记录...">

  <div id="emptyState" class="empty-state">暂无历史记录</div>
  <div id="historyList"></div>

  <script nonce="${nonce}">
    var vscode = acquireVsCodeApi();
    var allRecords = [];
    var projectNameMap = {};
    var searchTerm = '';

    var historyList = document.getElementById('historyList');
    var emptyState = document.getElementById('emptyState');
    var searchInput = document.getElementById('searchInput');

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatTime(ts) {
      var d = new Date(ts);
      var now = new Date();
      var diffDays = Math.floor((now - d) / 86400000);
      if (diffDays === 0) return '今天 ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
      if (diffDays === 1) return '昨天 ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
      return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    }

    function formatBlockLines(blocks) {
      return blocks.map(function(b) {
        var lineInfo = b.startLine === b.endLine ? '' + b.startLine : b.startLine + '-' + b.endLine;
        return escapeHtml(b.fileName) + ':' + lineInfo;
      }).join('<br>');
    }

    function render() {
      var filtered = allRecords;
      if (searchTerm) {
        var term = searchTerm.toLowerCase();
        filtered = filtered.filter(function(r) {
          var fileMatch = r.blocks.some(function(b) { return b.fileName.toLowerCase().indexOf(term) >= 0; });
          var promptMatch = r.prompt && r.prompt.toLowerCase().indexOf(term) >= 0;
          return fileMatch || promptMatch;
        });
      }

      emptyState.style.display = filtered.length === 0 ? 'block' : 'none';
      historyList.innerHTML = '';

      var projectGroups = {};
      filtered.forEach(function(record) {
        var pid = record.projectId || 'global';
        if (!projectGroups[pid]) { projectGroups[pid] = []; }
        projectGroups[pid].push(record);
      });

      var pids = Object.keys(projectGroups);
      pids.forEach(function(pid) {
        var group = document.createElement('div');
        group.className = 'project-group';

        var pName = projectNameMap[pid] || pid;
        var header = document.createElement('div');
        header.className = 'project-header';
        header.innerHTML = '<span class="arrow">▼</span> 项目 ' + escapeHtml(pName);
        header.addEventListener('click', function() {
          header.classList.toggle('collapsed');
          records.classList.toggle('hidden');
        });
        group.appendChild(header);

        var records = document.createElement('div');
        records.className = 'project-records';

        projectGroups[pid].forEach(function(record) {
          var card = document.createElement('div');
          card.className = 'record-card';

          var promptHtml = record.prompt ? '<div class="record-prompt">💬 ' + escapeHtml(record.prompt) + '</div>' : '';

          card.innerHTML =
            '<div class="record-time">' + formatTime(record.createdAt) + '</div>' +
            promptHtml +
            '<div class="record-files">' + formatBlockLines(record.blocks) + '</div>' +
            '<div class="record-actions">' +
              '<button class="record-btn copy-btn" data-id="' + record.id + '">再次复制</button>' +
              '<button class="record-btn delete delete-btn" data-id="' + record.id + '">删除</button>' +
            '</div>';

          records.appendChild(card);
        });

        group.appendChild(records);
        historyList.appendChild(group);
      });
    }

    window.addEventListener('message', function(event) {
      var message = event.data;
      if (message.type === 'updateHistory') {
        var payload = message.payload;
        allRecords = payload.records || [];
        projectNameMap = payload.projectNameMap || {};
        render();
      }
    });

    historyList.addEventListener('click', function(e) {
      if (e.target.classList.contains('copy-btn')) {
        vscode.postMessage({ type: 'copyHistory', payload: e.target.dataset.id });
      }
      if (e.target.classList.contains('delete-btn')) {
        vscode.postMessage({ type: 'deleteHistory', payload: e.target.dataset.id });
      }
    });

    var searchTimer = null;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function() {
        searchTerm = searchInput.value;
        render();
      }, 200);
    });

    vscode.postMessage({ type: 'searchHistory' });
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
