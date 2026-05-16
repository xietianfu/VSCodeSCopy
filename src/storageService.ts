import * as vscode from "vscode";
import { CodeBlock, Collection, HistoryRecord, StorageData } from "./types";

const STORAGE_KEY = "easyCopyStorage";

export class StorageService {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  private loadData(): StorageData {
    const raw = this.context.globalState.get<string>(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return { currentStash: null, history: [] };
      }
    }
    return { currentStash: null, history: [] };
  }

  private saveData(data: StorageData): Thenable<void> {
    return this.context.globalState.update(STORAGE_KEY, JSON.stringify(data));
  }

  getStash(): Collection | null {
    return this.loadData().currentStash;
  }

  saveStash(collection: Collection): Thenable<void> {
    const data = this.loadData();
    data.currentStash = collection;
    return this.saveData(data);
  }

  clearStash(): Thenable<void> {
    const data = this.loadData();
    data.currentStash = null;
    return this.saveData(data);
  }

  getHistory(): HistoryRecord[] {
    return this.loadData().history;
  }

  addHistory(record: HistoryRecord): Thenable<void> {
    const data = this.loadData();
    const config = vscode.workspace.getConfiguration("easy-copy");
    const limit = config.get<number>("historyLimit", 50);

    data.history.unshift(record);
    if (data.history.length > limit) {
      data.history = data.history.slice(0, limit);
    }
    return this.saveData(data);
  }

  removeHistory(id: string): Thenable<void> {
    const data = this.loadData();
    data.history = data.history.filter((r) => r.id !== id);
    return this.saveData(data);
  }

  addBlockToStash(block: CodeBlock): Promise<Collection> {
    const data = this.loadData();
    let stash = data.currentStash;

    if (!stash) {
      stash = {
        id: this.generateId(),
        blocks: [],
        createdAt: Date.now(),
        projectId: block.projectId,
        projectName: block.projectId,
      };
    }

    stash.blocks.push(block);
    data.currentStash = stash;
    const result = stash;
    return new Promise<Collection>((resolve) => {
      this.saveData(data).then(() => resolve(result));
    });
  }

  removeBlockFromStash(filePath: string, startLine: number, endLine: number): Promise<Collection | null> {
    const data = this.loadData();
    if (!data.currentStash) {
      return Promise.resolve(null);
    }

    data.currentStash.blocks = data.currentStash.blocks.filter(
      (b) => !(b.filePath === filePath && b.startLine === startLine && b.endLine === endLine)
    );

    if (data.currentStash.blocks.length === 0) {
      data.currentStash = null;
    }

    return new Promise<Collection | null>((resolve) => {
      this.saveData(data).then(() => resolve(data.currentStash));
    });
  }

  updateStashPrompt(prompt: string): Thenable<void> {
    const data = this.loadData();
    if (data.currentStash) {
      data.currentStash.prompt = prompt;
    }
    return this.saveData(data);
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
}
