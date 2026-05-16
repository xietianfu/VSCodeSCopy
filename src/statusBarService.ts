import * as vscode from "vscode";
import { StorageService } from "./storageService";

export class StatusBarService {
  private statusBarItem: vscode.StatusBarItem;
  private storageService: StorageService;

  constructor(storageService: StorageService) {
    this.storageService = storageService;

    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBarItem.command = "s-copy.openPanel";
    this.statusBarItem.name = "S Copy";

    this.update();
    this.statusBarItem.show();
  }

  update() {
    const stash = this.storageService.getStash();
    const count = stash?.blocks.length || 0;

    if (count > 0) {
      this.statusBarItem.text = `📋 ${count}`;
      this.statusBarItem.tooltip = `S Copy: ${count} 个代码块已暂存（点击打开）`;
    } else {
      this.statusBarItem.text = "📋";
      this.statusBarItem.tooltip = "S Copy（点击打开面板）";
    }
    this.statusBarItem.show();
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}
