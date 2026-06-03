import * as vscode from "vscode";

type LocaleKey =
  | "selectCodeFirst"
  | "collected"
  | "openFileFirst"
  | "selectFileOrFolder"
  | "collectedCount"
  | "stashCleared"
  | "noBlocks"
  | "copiedToClipboard"
  | "copiedHistory"
  | "statusBarTooltipWithCount"
  | "statusBarTooltip"
  | "panelTitle"
  | "panelEmpty"
  | "panelHint"
  | "descPlaceholder"
  | "summaryLabel"
  | "btnClear"
  | "btnCopy"
  | "copyCountdown"
  | "historyTitle"
  | "historySearch"
  | "historyEmpty"
  | "historyProject"
  | "historyToday"
  | "historyYesterday"
  | "btnRecopy"
  | "btnDelete"
  | "wholeFile"
  | "pathModeRelative"
  | "pathModeAbsolute";

const zh: Record<LocaleKey, string> = {
  selectCodeFirst: "请先选中代码",
  collected: "已收集",
  openFileFirst: "请先打开一个文件",
  selectFileOrFolder: "请先选中文件或文件夹",
  collectedCount: "已收集 {0} 个文件/文件夹",
  stashCleared: "已清空暂存",
  noBlocks: "没有收集的代码块",
  copiedToClipboard: "✓ 已复制到剪贴板",
  copiedHistory: "✓ 已复制历史记录到剪贴板",
  statusBarTooltipWithCount: "S Copy: {0} 个代码块已暂存（点击打开）",
  statusBarTooltip: "S Copy（点击打开面板）",
  panelTitle: "📋 已收集 {0} 个代码块",
  panelEmpty: "暂无收集的代码块",
  panelHint: "选中代码后按 Cmd+; 收集",
  descPlaceholder: "添加说明（可选）",
  summaryLabel: "💬 汇总说明（可选）",
  btnClear: "清空",
  btnCopy: "✓ 完成并复制",
  copyCountdown: "✓ 已复制 ({0}s)",
  historyTitle: "📋 代码审查历史",
  historySearch: "🔍 搜索历史记录...",
  historyEmpty: "暂无历史记录",
  historyProject: "项目",
  historyToday: "今天",
  historyYesterday: "昨天",
  btnRecopy: "再次复制",
  btnDelete: "删除",
  wholeFile: "(整文件)",
  pathModeRelative: "相对路径",
  pathModeAbsolute: "绝对路径",
};

const en: Record<LocaleKey, string> = {
  selectCodeFirst: "Please select code first",
  collected: "Collected",
  openFileFirst: "Please open a file first",
  selectFileOrFolder: "Please select a file or folder",
  collectedCount: "Collected {0} file(s)/folder(s)",
  stashCleared: "Stash cleared",
  noBlocks: "No collected code blocks",
  copiedToClipboard: "✓ Copied to clipboard",
  copiedHistory: "✓ History copied to clipboard",
  statusBarTooltipWithCount: "S Copy: {0} block(s) stashed (click to open)",
  statusBarTooltip: "S Copy (click to open panel)",
  panelTitle: "📋 Collected {0} block(s)",
  panelEmpty: "No collected code blocks",
  panelHint: "Select code and press Cmd+; to collect",
  descPlaceholder: "Add description (optional)",
  summaryLabel: "💬 Summary (optional)",
  btnClear: "Clear",
  btnCopy: "✓ Copy All",
  copyCountdown: "✓ Copied ({0}s)",
  historyTitle: "📋 Review History",
  historySearch: "🔍 Search history...",
  historyEmpty: "No history records",
  historyProject: "Project",
  historyToday: "Today",
  historyYesterday: "Yesterday",
  btnRecopy: "Re-copy",
  btnDelete: "Delete",
  wholeFile: "(whole file)",
  pathModeRelative: "Relative",
  pathModeAbsolute: "Absolute",
};

const locales: Record<string, Record<LocaleKey, string>> = { zh, en };

let currentLocale = "zh";

export function initLocale() {
  const lang = (vscode.env.language || "zh").toLowerCase();
  if (lang.startsWith("zh")) {
    currentLocale = "zh";
  } else {
    currentLocale = "en";
  }
}

export function t(key: LocaleKey, ...args: (string | number)[]): string {
  const strings = locales[currentLocale] || locales["zh"];
  let result = strings[key];
  args.forEach((arg, i) => {
    result = result.replace(`{${i}}`, String(arg));
  });
  return result;
}

export function getLocale(): string {
  return currentLocale;
}

export function getWebviewStrings(): Record<string, string> {
  return {
    panelTitle: t("panelTitle"),
    panelEmpty: t("panelEmpty"),
    panelHint: t("panelHint"),
    descPlaceholder: t("descPlaceholder"),
    summaryLabel: t("summaryLabel"),
    btnClear: t("btnClear"),
    btnCopy: t("btnCopy"),
    copyCountdown: t("copyCountdown"),
    wholeFile: t("wholeFile"),
    pathModeRelative: t("pathModeRelative"),
    pathModeAbsolute: t("pathModeAbsolute"),
  };
}

export function getHistoryStrings(): Record<string, string> {
  return {
    historyTitle: t("historyTitle"),
    historySearch: t("historySearch"),
    historyEmpty: t("historyEmpty"),
    historyProject: t("historyProject"),
    historyToday: t("historyToday"),
    historyYesterday: t("historyYesterday"),
    btnRecopy: t("btnRecopy"),
    btnDelete: t("btnDelete"),
  };
}
