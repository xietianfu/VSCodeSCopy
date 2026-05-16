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

  const fileGroups = new Map<string, { fileName: string; blocks: CodeBlock[] }>();
  for (const block of blocks) {
    const group = fileGroups.get(block.filePath);
    if (group) {
      group.blocks.push(block);
    } else {
      fileGroups.set(block.filePath, { fileName: block.fileName, blocks: [block] });
    }
  }

  for (const [, group] of fileGroups) {
    for (const block of group.blocks) {
      if (block.startLine === block.endLine) {
        lines.push(`${group.fileName}:${block.startLine}`);
      } else {
        lines.push(`${group.fileName}:${block.startLine}-${block.endLine}`);
      }
    }
  }

  return lines.join("\n");
}
