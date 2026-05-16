import { CodeBlock } from "./types";

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

  const fileGroups = new Map<string, { fileName: string; blocks: CodeBlock[]; description?: string }>();
  for (const block of blocks) {
    const group = fileGroups.get(block.filePath);
    if (group) {
      group.blocks.push(block);
    } else {
      fileGroups.set(block.filePath, {
        fileName: block.fileName,
        blocks: [block],
        description: block.description,
      });
    }
  }

  for (const [, group] of fileGroups) {
    for (const block of group.blocks) {
      if (block.startLine === 0 && block.endLine === 0) {
        lines.push(group.fileName);
      } else if (block.startLine === block.endLine) {
        lines.push(`${group.fileName}:${block.startLine}`);
      } else {
        lines.push(`${group.fileName}:${block.startLine}-${block.endLine}`);
      }
    }

    if (group.description && group.description.trim()) {
      lines.push(group.description.trim());
    }

    lines.push("");
  }

  if (prompt && prompt.trim()) {
    lines.push(prompt.trim());
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines.join("\n");
}
