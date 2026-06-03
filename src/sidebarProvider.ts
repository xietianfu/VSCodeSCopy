import * as vscode from "vscode";
import { WebviewMessage, WebviewState } from "./types";
import { StorageService } from "./storageService";
import { ProjectService } from "./projectService";
import { formatOutput } from "./dedupService";
import { getWebviewContent } from "./webviewContent";
import { t, getWebviewStrings } from "./i18n";

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "sCopySidebar";
  private view?: vscode.WebviewView;
  private storageService: StorageService;
  private projectService: ProjectService;
  private onDidChange?: () => void;
  private pathMode: "relative" | "absolute";

  constructor(
    private context: vscode.ExtensionContext,
    storageService: StorageService,
    projectService: ProjectService,
    onDidChange?: () => void
  ) {
    this.storageService = storageService;
    this.projectService = projectService;
    this.onDidChange = onDidChange;
    this.pathMode = this.context.globalState.get<"relative" | "absolute">("s-copy.pathMode", "relative");
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

    webviewView.webview.html = this.getHtml();

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

    const stash = this.storageService.getStash();
    const config = vscode.workspace.getConfiguration("s-copy");
    const colors = config.get<string[]>("colors", [
      "#4A90E2",
      "#F5A623",
      "#7ED321",
      "#BD10E0",
      "#8B572A",
    ]);

    const state: WebviewState = {
      blocks: stash?.blocks || [],
      prompt: stash?.prompt || "",
      colors,
      strings: getWebviewStrings(),
      pathMode: this.pathMode,
    };

    this.view.webview.postMessage({ type: "updateState", payload: state });
  }

  public show() {
    if (this.view) {
      this.view.show(true);
      this.updateView();
    }
  }

  private async handleMessage(message: WebviewMessage) {
    switch (message.type) {
      case "removeBlock": {
        const payload = message.payload as {
          filePath: string;
          startLine: number;
          endLine: number;
        };
        await this.storageService.removeBlockFromStash(
          payload.filePath,
          payload.startLine,
          payload.endLine
        );
        this.updateView();
        this.fireChange();
        break;
      }
      case "updatePrompt": {
        const payload = message.payload as string;
        await this.storageService.updateStashPrompt(payload);
        break;
      }
      case "updateDescription": {
        const payload = message.payload as { filePath: string; startLine: number; endLine: number; description: string };
        await this.storageService.updateBlockDescription(payload.filePath, payload.startLine, payload.endLine, payload.description);
        break;
      }
      case "copyAndClose": {
        await this.handleCopy();
        break;
      }
      case "requestState": {
        this.updateView();
        break;
      }
      case "clearStash": {
        await this.storageService.clearStash();
        this.updateView();
        this.fireChange();
        break;
      }
      case "togglePathMode": {
        this.pathMode = this.pathMode === "relative" ? "absolute" : "relative";
        await this.context.globalState.update("s-copy.pathMode", this.pathMode);
        this.updateView();
        break;
      }
    }
  }

  private async handleCopy() {
    const stash = this.storageService.getStash();
    if (!stash || stash.blocks.length === 0) {
      vscode.window.showWarningMessage(t("noBlocks"));
      return;
    }

    const output = formatOutput(stash.blocks, stash.prompt, this.pathMode);
    await vscode.env.clipboard.writeText(output);

    const historyRecord = {
      ...stash,
      copied: true,
    };
    await this.storageService.addHistory(historyRecord);
    await this.storageService.clearStash();

    if (this.view) {
      this.view.webview.postMessage({ type: "copySuccess" });
    }

    vscode.window.showInformationMessage(t("copiedToClipboard"));
    this.updateView();
    this.fireChange();
  }

  private getHtml(): string {
    const config = vscode.workspace.getConfiguration("s-copy");
    const placeholder = config.get<string>(
      "promptPlaceholder",
      t("summaryLabel")
    );
    return getWebviewContent(placeholder, getWebviewStrings());
  }

  private fireChange() {
    if (this.onDidChange) {
      this.onDidChange();
    }
  }
}
