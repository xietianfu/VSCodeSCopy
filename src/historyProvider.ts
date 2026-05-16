import * as vscode from "vscode";
import { HistoryWebviewState, WebviewMessage } from "./types";
import { StorageService } from "./storageService";
import { ProjectService } from "./projectService";
import { formatOutput } from "./dedupService";
import { getHistoryWebviewContent } from "./historyWebviewContent";

export class HistoryProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "sCopyHistory";
  private view?: vscode.WebviewView;
  private storageService: StorageService;
  private projectService: ProjectService;

  constructor(
    storageService: StorageService,
    projectService: ProjectService
  ) {
    this.storageService = storageService;
    this.projectService = projectService;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [],
    };

    webviewView.webview.html = getHistoryWebviewContent();

    webviewView.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      await this.handleMessage(message);
    });

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.updateView();
      }
    });

    this.updateView();
  }

  public updateView() {
    if (!this.view) {
      return;
    }

    const records = this.storageService.getHistory();
    const projectNameMap: Record<string, string> = {};
    for (const record of records) {
      if (!projectNameMap[record.projectId]) {
        projectNameMap[record.projectId] = this.projectService.getProjectName(record.projectId);
      }
    }

    const state: HistoryWebviewState = {
      records,
      projectNameMap,
    };

    this.view.webview.postMessage({ type: "updateHistory", payload: state });
  }

  private async handleMessage(message: WebviewMessage) {
    switch (message.type) {
      case "copyHistory": {
        const id = message.payload as string;
        const records = this.storageService.getHistory();
        const record = records.find((r) => r.id === id);
        if (record) {
          const output = formatOutput(record.blocks, record.prompt);
          await vscode.env.clipboard.writeText(output);
          vscode.window.showInformationMessage("✓ 已复制历史记录到剪贴板");
        }
        break;
      }
      case "deleteHistory": {
        const id = message.payload as string;
        await this.storageService.removeHistory(id);
        this.updateView();
        break;
      }
      case "searchHistory": {
        this.updateView();
        break;
      }
    }
  }
}
