export function getHistoryWebviewContent(strings: Record<string, string>): string {
  const nonce = getNonce();
  const s = strings;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <title>S Copy History</title>
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
      color: var(--vscode-foreground, #cccccc);
    }

    .search-input {
      width: 100%;
      padding: 5px 8px;
      border-radius: 4px;
      border: 1px solid var(--vscode-input-border, rgba(128, 128, 128, 0.35));
      background: var(--vscode-input-background, rgba(255, 255, 255, 0.05));
      color: var(--vscode-input-foreground, var(--vscode-foreground, #cccccc));
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      outline: none;
      margin-bottom: 10px;
    }

    .search-input:focus { border-color: var(--vscode-focusBorder, #007fd4); }
    .search-input::placeholder { color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.5)); }

    .empty-state {
      text-align: center;
      padding: 24px 12px;
      color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.7));
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
      color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.7));
      user-select: none;
    }

    .project-header:hover { color: var(--vscode-foreground, #cccccc); }
    .project-header .arrow { font-size: 10px; transition: transform 0.15s; }
    .project-header.collapsed .arrow { transform: rotate(-90deg); }

    .project-records { display: flex; flex-direction: column; gap: 6px; padding-left: 14px; }
    .project-records.hidden { display: none; }

    .record-card {
      background: var(--vscode-input-background, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--vscode-input-border, rgba(128, 128, 128, 0.35));
      border-radius: 4px;
      padding: 8px;
      animation: fadeIn 0.2s ease;
    }

    .record-time {
      font-size: 10px;
      color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.7));
      margin-bottom: 4px;
    }

    .record-prompt {
      font-size: 11px;
      color: var(--vscode-foreground, #cccccc);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .record-files {
      font-size: 11px;
      color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.7));
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
      border: 1px solid var(--vscode-sideBar-border, var(--vscode-panel-border, rgba(128,128,128,0.35)));
      color: var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.7));
      font-family: var(--vscode-font-family, sans-serif);
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .record-btn:hover {
      background: rgba(128, 128, 128, 0.15);
      color: var(--vscode-foreground, #cccccc);
    }
    .record-btn.delete:hover {
      background: rgba(244,71,71,0.1);
      color: #f44747;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(2px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>${escapeHtml(s.historyTitle)}</h2>
  </div>

  <input type="text" id="searchInput" class="search-input" placeholder="${escapeHtml(s.historySearch)}">

  <div id="emptyState" class="empty-state">${escapeHtml(s.historyEmpty)}</div>
  <div id="historyList"></div>

  <script nonce="${nonce}">
    var vscode = acquireVsCodeApi();
    var allRecords = [];
    var projectNameMap = {};
    var searchTerm = '';
    var strings = ${JSON.stringify(s)};

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
      var time = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
      if (diffDays === 0) return strings.historyToday + ' ' + time;
      if (diffDays === 1) return strings.historyYesterday + ' ' + time;
      return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + time;
    }

    function formatBlockLines(blocks) {
      return blocks.map(function(b) {
        if (b.startLine === 0 && b.endLine === 0) return escapeHtml(b.fileName);
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
        header.innerHTML = '<span class="arrow">▼</span> ' + escapeHtml(strings.historyProject) + ' ' + escapeHtml(pName);
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
              '<button class="record-btn copy-btn" data-id="' + record.id + '">' + escapeHtml(strings.btnRecopy) + '</button>' +
              '<button class="record-btn delete delete-btn" data-id="' + record.id + '">' + escapeHtml(strings.btnDelete) + '</button>' +
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
        if (payload.strings) { strings = payload.strings; }
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
