export interface CodeBlock {
  filePath: string;
  fileName: string;
  startLine: number;
  endLine: number;
  colorIndex: number;
  projectId: string;
  isUntitled: boolean;
  description?: string;
}

export interface Collection {
  id: string;
  blocks: CodeBlock[];
  prompt?: string;
  createdAt: number;
  projectId: string;
  projectName: string;
}

export interface HistoryRecord extends Collection {
  copied: boolean;
}

export interface StorageData {
  currentStash: Collection | null;
  history: HistoryRecord[];
}

export type MessageType =
  | "removeBlock"
  | "updatePrompt"
  | "updateDescription"
  | "copyAndClose"
  | "requestState"
  | "clearStash"
  | "copyHistory"
  | "deleteHistory"
  | "searchHistory";

export interface WebviewMessage {
  type: MessageType;
  payload?: unknown;
}

export interface WebviewState {
  blocks: CodeBlock[];
  prompt: string;
  colors: string[];
}

export interface HistoryWebviewState {
  records: HistoryRecord[];
  projectNameMap: Record<string, string>;
}
