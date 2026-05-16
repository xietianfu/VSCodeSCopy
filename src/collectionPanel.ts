import * as vscode from "vscode";
import { WebviewMessage, WebviewState } from "./types";
import { StorageService } from "./storageService";
import { ProjectService } from "./projectService";
import { formatOutput } from "./dedupService";
import { getWebviewContent } from "./webviewContent";

export class CollectionPanel {
  public static currentPanel: CollectionPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];
  private storageService: StorageService;
  private projectService: ProjectService;
  private onDidCopy?: () => void;
  private onDidStash?: () => void;

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    storageService: StorageService,
    projectService: ProjectService,
    callbacks?: { onDidCopy?: () => void; onDidStash?: () => void }
  ) {
    this.panel = panel;
    this.storageService = storageService;
    this.projectService = projectService;
    this.onDidCopy = callbacks?.onDidCopy;
    this.onDidStash = callbacks?.onDidStash;

    this.panel.webview.html = this.getHtml();

    this.panel.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      await this.handleMessage(message);
    });

    this.panel.onDidDispose(() => this.dispose());

    this.updateView();
  }

  public static show(
    context: vscode.ExtensionContext,
    storageService: StorageService,
    projectService: ProjectService,
    callbacks?: { onDidCopy?: () => void; onDidStash?: () => void }
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (CollectionPanel.currentPanel) {
      CollectionPanel.currentPanel.panel.reveal(column);
      CollectionPanel.currentPanel.updateView();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "easyCopyCollection",
      "📋 Easy Copy",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [],
      }
    );

    CollectionPanel.currentPanel = new CollectionPanel(panel, context, storageService, projectService, callbacks);
  }

  public static close() {
    if (CollectionPanel.currentPanel) {
      CollectionPanel.currentPanel.panel.dispose();
    }
  }

  public updateView() {
    const stash = this.storageService.getStash();
    const config = vscode.workspace.getConfiguration("easy-copy");
    const colors = config.get<string[]>("colors", ["#4A90E2", "#F5A623", "#7ED321", "#BD10E0", "#8B572A"]);

    const state: WebviewState = {
      blocks: stash?.blocks || [],
      prompt: stash?.prompt || "",
      colors,
    };

    this.panel.webview.postMessage({ type: "updateState", payload: state });
  }

  private async handleMessage(message: WebviewMessage) {
    switch (message.type) {
      case "removeBlock": {
        const payload = message.payload as { filePath: string; startLine: number; endLine: number };
        await this.storageService.removeBlockFromStash(payload.filePath, payload.startLine, payload.endLine);
        this.updateView();
        break;
      }
      case "updatePrompt": {
        const payload = message.payload as string;
        await this.storageService.updateStashPrompt(payload);
        break;
      }
      case "copyAndClose": {
        await this.handleCopyAndClose();
        break;
      }
      case "stashAndClose": {
        this.panel.dispose();
        if (this.onDidStash) {
          this.onDidStash();
        }
        break;
      }
      case "requestState": {
        this.updateView();
        break;
      }
      case "clearStash": {
        await this.storageService.clearStash();
        this.updateView();
        break;
      }
    }
  }

  private async handleCopyAndClose() {
    const stash = this.storageService.getStash();
    if (!stash || stash.blocks.length === 0) {
      vscode.window.showWarningMessage("没有收集的代码块");
      return;
    }

    const output = formatOutput(stash.blocks, stash.prompt);
    await vscode.env.clipboard.writeText(output);

    const historyRecord = {
      ...stash,
      copied: true,
    };
    await this.storageService.addHistory(historyRecord);
    await this.storageService.clearStash();

    this.panel.webview.postMessage({ type: "copySuccess" });

    if (this.onDidCopy) {
      this.onDidCopy();
    }

    setTimeout(() => {
      this.panel.dispose();
    }, 1500);
  }

  private getHtml(): string {
    const config = vscode.workspace.getConfiguration("easy-copy");
    const placeholder = config.get<string>("promptPlaceholder", "例如：修复类型错误，检查边界情况...");
    return getWebviewContent(placeholder);
  }

  private dispose() {
    CollectionPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
