import * as vscode from "vscode";

export class ProjectService {
  getProjectId(document: vscode.TextDocument): string {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (workspaceFolder) {
      return workspaceFolder.uri.fsPath;
    }
    return "global";
  }

  getProjectName(projectId: string): string {
    if (projectId === "global") {
      return "全局";
    }
    const parts = projectId.split("/");
    return parts[parts.length - 1] || projectId;
  }

  getRelativePath(document: vscode.TextDocument): string {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (workspaceFolder) {
      return vscode.workspace.asRelativePath(document.uri, false);
    }
    return document.fileName.split("/").pop() || document.fileName;
  }

  getFileName(document: vscode.TextDocument): string {
    if (document.isUntitled) {
      return document.uri.path.split("/").pop() || "Untitled";
    }
    return document.fileName.split("/").pop() || "unknown";
  }

  isUntitled(document: vscode.TextDocument): boolean {
    return document.isUntitled;
  }
}
