import * as vscode from "vscode";
import { StorageService } from "./storageService";
import { ProjectService } from "./projectService";
import { CollectService } from "./collectService";
import { SidebarProvider } from "./sidebarProvider";
import { StatusBarService } from "./statusBarService";

export function activate(context: vscode.ExtensionContext) {
  const storageService = new StorageService(context);
  const projectService = new ProjectService();
  const collectService = new CollectService(projectService, storageService);
  const statusBar = new StatusBarService(storageService);

  const sidebarProvider = new SidebarProvider(
    context,
    storageService,
    projectService,
    () => {
      statusBar.update();
    }
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider
    )
  );

  const refreshUI = () => {
    statusBar.update();
    sidebarProvider.updateView();
  };

  const collectCommand = vscode.commands.registerCommand(
    "easy-copy.collect",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("请先打开一个文件");
        return;
      }

      const result = await collectService.collectFromEditor(editor);
      if (
        result &&
        (result.result.action === "added" || result.result.action === "merged")
      ) {
        sidebarProvider.show();
      }
      refreshUI();
    }
  );

  const openPanelCommand = vscode.commands.registerCommand(
    "easy-copy.openPanel",
    () => {
      sidebarProvider.show();
    }
  );

  const clearStashCommand = vscode.commands.registerCommand(
    "easy-copy.clearStash",
    async () => {
      await storageService.clearStash();
      refreshUI();
      vscode.window.showInformationMessage("已清空暂存");
    }
  );

  context.subscriptions.push(collectCommand);
  context.subscriptions.push(openPanelCommand);
  context.subscriptions.push(clearStashCommand);
  context.subscriptions.push(statusBar);

  refreshUI();
}

export function deactivate() {
  return;
}
