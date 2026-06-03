import * as vscode from "vscode";
import { initLocale, t } from "./i18n";
import { StorageService } from "./storageService";
import { ProjectService } from "./projectService";
import { CollectService } from "./collectService";
import { SidebarProvider } from "./sidebarProvider";
import { HistoryProvider } from "./historyProvider";
import { StatusBarService } from "./statusBarService";

export function activate(context: vscode.ExtensionContext) {
  initLocale();

  const storageService = new StorageService(context);
  const projectService = new ProjectService();
  const collectService = new CollectService(projectService, storageService);
  const statusBar = new StatusBarService(storageService);
  const historyProvider = new HistoryProvider(storageService, projectService, context);

  const refreshAll = () => {
    statusBar.update();
    sidebarProvider.updateView();
    historyProvider.updateView();
  };

  const sidebarProvider = new SidebarProvider(
    context,
    storageService,
    projectService,
    refreshAll
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider
    )
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      HistoryProvider.viewType,
      historyProvider
    )
  );

  const collectCommand = vscode.commands.registerCommand(
    "s-copy.collect",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage(t("openFileFirst"));
        return;
      }

      await collectService.collectFromEditor(editor);
      refreshAll();
    }
  );

  const collectFromExplorerCommand = vscode.commands.registerCommand(
    "s-copy.collectFromExplorer",
    async (clickedUri: vscode.Uri, selectedUris: vscode.Uri[]) => {
      const uris = selectedUris && selectedUris.length > 0 ? selectedUris : clickedUri ? [clickedUri] : [];
      if (uris.length === 0) {
        vscode.window.showWarningMessage(t("selectFileOrFolder"));
        return;
      }

      const added = await collectService.collectFromUris(uris);
      if (added > 0) {
        vscode.window.showInformationMessage(t("collectedCount", added));
      }
      refreshAll();
    }
  );

  const openPanelCommand = vscode.commands.registerCommand(
    "s-copy.openPanel",
    () => {
      sidebarProvider.show();
    }
  );

  const clearStashCommand = vscode.commands.registerCommand(
    "s-copy.clearStash",
    async () => {
      await storageService.clearStash();
      refreshAll();
      vscode.window.showInformationMessage(t("stashCleared"));
    }
  );

  context.subscriptions.push(collectCommand);
  context.subscriptions.push(collectFromExplorerCommand);
  context.subscriptions.push(openPanelCommand);
  context.subscriptions.push(clearStashCommand);
  context.subscriptions.push(statusBar);

  refreshAll();
}

export function deactivate() {
  return;
}
