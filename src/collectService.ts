import * as vscode from "vscode";
import { CodeBlock } from "./types";
import { ProjectService } from "./projectService";
import { StorageService } from "./storageService";
import { DedupResult, deduplicateBlock, assignColorIndex } from "./dedupService";

export class CollectService {
  private projectService: ProjectService;
  private storageService: StorageService;

  constructor(projectService: ProjectService, storageService: StorageService) {
    this.projectService = projectService;
    this.storageService = storageService;
  }

  async collectFromEditor(editor: vscode.TextEditor): Promise<{ result: DedupResult; block?: CodeBlock } | null> {
    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showWarningMessage("请先选中代码");
      return null;
    }

    const document = editor.document;
    const projectId = this.projectService.getProjectId(document);
    const filePath = this.projectService.isUntitled(document)
      ? this.projectService.getFileName(document)
      : this.projectService.getRelativePath(document);
    const fileName = this.projectService.getFileName(document);

    const startLine = selection.start.line + 1;
    const endLine = selection.end.line + 1;

    const stash = this.storageService.getStash();
    const existingBlocks = stash?.blocks || [];

    const colorIndex = assignColorIndex(existingBlocks, filePath);

    const newBlock: CodeBlock = {
      filePath,
      fileName,
      startLine,
      endLine,
      colorIndex,
      projectId,
    };

    const result = deduplicateBlock(existingBlocks, newBlock);

    if (result.action === "skipped") {
      vscode.window.showInformationMessage("已存在，已跳过");
      return { result };
    }

    if (result.action === "merged") {
      const updatedStash = await this.storageService.removeBlockFromStash(
        result.originalBlock.filePath,
        result.originalBlock.startLine,
        result.originalBlock.endLine
      );
      const mergedWithColor: CodeBlock = {
        ...result.mergedBlock,
        colorIndex: assignColorIndex(updatedStash?.blocks || [], result.mergedBlock.filePath),
      };
      await this.storageService.addBlockToStash(mergedWithColor);
      vscode.window.showInformationMessage(
        `已合并为 ${mergedWithColor.fileName}:${mergedWithColor.startLine}-${mergedWithColor.endLine}`
      );
      return { result, block: mergedWithColor };
    }

    await this.storageService.addBlockToStash(newBlock);
    const lineInfo = startLine === endLine ? `${startLine}` : `${startLine}-${endLine}`;
    vscode.window.showInformationMessage(`已收集 ${fileName}:${lineInfo}`);
    return { result, block: newBlock };
  }
}
