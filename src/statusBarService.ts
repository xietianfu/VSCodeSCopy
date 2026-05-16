import * as vscode from "vscode";
import { StorageService } from "./storageService";

export class StatusBarService {
  private statusBarItem: vscode.StatusBarItem;
  private storageService: StorageService;

  constructor(storageService: StorageService) {
    this.storageService = storageService;

    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBarItem.command = "easy-copy.openPanel";
    this.statusBarItem.name = "Easy Copy";

    this.update();
    this.statusBarItem.show();
  }

  update() {
    const stash = this.storageService.getStash();
    const count = stash?.blocks.length || 0;

    if (count > 0) {
      this.statusBarItem.text = `$(clippy) ${count}`;
      this.statusBarItem.tooltip = `Easy Copy: ${count} 个代码块已暂存（点击打开）`;
      this.statusBarItem.show();
    } else {
      this.statusBarItem.text = "$(clippy)";
      this.statusBarItem.tooltip = "Easy Copy: 暂无暂存（点击打开面板）";
      this.statusBarItem.show();
    }
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}
