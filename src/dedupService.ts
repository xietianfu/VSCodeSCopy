import { CodeBlock } from "./types";

export type DedupResult =
  | { action: "added"; block: CodeBlock }
  | { action: "skipped"; reason: "duplicate" | "contained"; existingBlock: CodeBlock }
  | { action: "merged"; originalBlock: CodeBlock; mergedBlock: CodeBlock };

export function deduplicateBlock(existingBlocks: CodeBlock[], newBlock: CodeBlock): DedupResult {
  const sameFileBlocks = existingBlocks.filter((b) => b.filePath === newBlock.filePath);

  for (const existing of sameFileBlocks) {
    if (existing.startLine === newBlock.startLine && existing.endLine === newBlock.endLine) {
      return { action: "skipped", reason: "duplicate", existingBlock: existing };
    }

    if (newBlock.startLine >= existing.startLine && newBlock.endLine <= existing.endLine) {
      return { action: "skipped", reason: "contained", existingBlock: existing };
    }

    const overlaps =
      (newBlock.startLine >= existing.startLine && newBlock.startLine <= existing.endLine) ||
      (newBlock.endLine >= existing.startLine && newBlock.endLine <= existing.endLine) ||
      (newBlock.startLine <= existing.startLine && newBlock.endLine >= existing.endLine);

    if (overlaps) {
      const mergedBlock: CodeBlock = {
        ...existing,
        startLine: Math.min(existing.startLine, newBlock.startLine),
        endLine: Math.max(existing.endLine, newBlock.endLine),
      };
      return { action: "merged", originalBlock: existing, mergedBlock };
    }
  }

  return { action: "added", block: newBlock };
}

export function assignColorIndex(blocks: CodeBlock[], filePath: string): number {
  const existingColors = blocks
    .filter((b) => b.filePath === filePath)
    .map((b) => b.colorIndex);

  if (existingColors.length > 0) {
    return existingColors[0];
  }

  const usedColors = new Set(blocks.map((b) => b.colorIndex));
  for (let i = 0; i < 10; i++) {
    if (!usedColors.has(i)) {
      return i;
    }
  }
  return 0;
}

export function formatOutput(blocks: CodeBlock[], prompt?: string): string {
  const lines: string[] = [];

  if (prompt && prompt.trim()) {
    lines.push(prompt.trim());
    lines.push("");
  }

  const fileGroups = new Map<string, CodeBlock[]>();
  for (const block of blocks) {
    const existing = fileGroups.get(block.filePath) || [];
    existing.push(block);
    fileGroups.set(block.filePath, existing);
  }

  for (const [filePath, fileBlocks] of fileGroups) {
    for (const block of fileBlocks) {
      if (block.startLine === block.endLine) {
        lines.push(`${filePath}:${block.startLine}`);
      } else {
        lines.push(`${filePath}:${block.startLine}-${block.endLine}`);
      }
    }
  }

  return lines.join("\n");
}
