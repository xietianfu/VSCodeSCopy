import * as vscode from "vscode";
import { CodeBlock } from "./types";
import { ProjectService } from "./projectService";
import { StorageService } from "./storageService";
import { assignColorIndex } from "./dedupService";
import { t } from "./i18n";

export class CollectService {
  private projectService: ProjectService;
  private storageService: StorageService;

  constructor(projectService: ProjectService, storageService: StorageService) {
    this.projectService = projectService;
    this.storageService = storageService;
  }

  async collectFromEditor(editor: vscode.TextEditor): Promise<CodeBlock | null> {
    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showWarningMessage("请先选中代码");
      return null;
    }

    const document = editor.document;
    const projectId = this.projectService.getProjectId(document);
    const isUntitled = this.projectService.isUntitled(document);
    const filePath = isUntitled
      ? this.projectService.getFileName(document)
      : this.projectService.getRelativePath(document);
    const fileName = this.projectService.getFileName(document);
    const absolutePath = isUntitled
      ? fileName
      : document.uri.fsPath;

    const startLine = selection.start.line + 1;
    const endLine = selection.end.line + 1;

    const stash = this.storageService.getStash();
    const existingBlocks = stash?.blocks || [];

    const colorIndex = assignColorIndex(existingBlocks, filePath);

    const newBlock: CodeBlock = {
      filePath,
      fileName,
      absolutePath,
      startLine,
      endLine,
      colorIndex,
      projectId,
      isUntitled,
      isDirectory: false,
    };

    await this.storageService.addBlockToStash(newBlock);
    const lineInfo = startLine === endLine ? `${startLine}` : `${startLine}-${endLine}`;
    vscode.window.showInformationMessage(`${t("collected")} ${fileName}:${lineInfo}`);
    return newBlock;
  }

  async collectFromUris(uris: vscode.Uri[]): Promise<number> {
    let added = 0;

    for (const uri of uris) {
      const stat = await vscode.workspace.fs.stat(uri);
      const isDir = (stat.type & vscode.FileType.Directory) !== 0;
      await this.addUriToStash(uri, isDir);
      added++;
    }

    return added;
  }

  private async addUriToStash(uri: vscode.Uri, isDir: boolean): Promise<void> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    const projectId = workspaceFolder ? workspaceFolder.uri.fsPath : "global";

    let filePath: string;
    let fileName: string;
    let absolutePath: string;

    if (workspaceFolder) {
      filePath = vscode.workspace.asRelativePath(uri, false);
      absolutePath = uri.fsPath;
    } else {
      filePath = uri.path.split("/").pop() || uri.path;
      absolutePath = uri.fsPath;
    }
    fileName = uri.path.split("/").pop() || "unknown";

    if (isDir) {
      fileName = fileName + "/";
    }

    const stash = this.storageService.getStash();
    const existingBlocks = stash?.blocks || [];
    const colorIndex = assignColorIndex(existingBlocks, filePath);

    const newBlock: CodeBlock = {
      filePath,
      fileName,
      absolutePath,
      startLine: 0,
      endLine: 0,
      colorIndex,
      projectId,
      isUntitled: false,
      isDirectory: isDir,
    };

    await this.storageService.addBlockToStash(newBlock);
  }
}
