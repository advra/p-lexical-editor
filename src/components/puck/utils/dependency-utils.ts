import type { PuckPageData } from '@/app/puck/types';

export type DependencyMap = {
  [blockId: string]: string[];
};

/**
 * Recursively scans all blocks and their children to find completion dependencies
 */
export function getCompletionDependencies(content: any[]): DependencyMap {
  const dependencies: DependencyMap = {};
  
  function scanBlock(block: any) {
    // MarkCompleteButton dependencies
    if (block.type === 'MarkCompleteButton' && block.props?.id) {
      dependencies[block.props.id] = block.props.dependencies || [];
    }
    
    // TaskItemBlock dependencies
    if (block.type === 'TaskItemBlock' && block.props?.id) {
      dependencies[block.props.id] = block.props.dependencies || [];
    }
    
    // Recursively scan slots/children
    if (block.props?.content) {
      scanBlocks(block.props.content);
    }
    if (block.props?.items) {
      scanBlocks(block.props.items);
    }
    if (block.props?.embeddedSlot) {
      // Handle embedded slots if they contain blocks
      scanBlocks([{ type: 'slot', props: { content: block.props.embeddedSlot } }]);
    }
  }
  
  function scanBlocks(blocks: any[]) {
    blocks.forEach(scanBlock);
  }
  
  scanBlocks(content);
  return dependencies;
}

/**
 * Validates if a block can be completed based on its dependencies
 */
export function canCompleteBlock(
  blockId: string, 
  completionStore: { completions: Record<string, { completed?: boolean }> }, 
  dependencies: DependencyMap
): boolean {
  const blockDependencies = dependencies[blockId] || [];
  return blockDependencies.every(depId => 
    completionStore.completions[depId]?.completed === true
  );
}

/**
 * Gets all completion block IDs from the page content
 */
export function getAllCompletionBlockIds(content: any[]): string[] {
  const completionIds: string[] = [];
  
  function scanBlock(block: any) {
    if ((block.type === 'MarkCompleteButton' || block.type === 'TaskItemBlock') && block.props?.id) {
      completionIds.push(block.props.id);
    }
    
    // Recursively scan children
    if (block.props?.content) {
      scanBlocks(block.props.content);
    }
    if (block.props?.items) {
      scanBlocks(block.props.items);
    }
  }
  
  function scanBlocks(blocks: any[]) {
    blocks.forEach(scanBlock);
  }
  
  scanBlocks(content);
  return completionIds;
}

/**
 * Gets completion block options for select fields
 */
export function getCompletionBlockOptions(content: any[]): Array<{ label: string; value: string }> {
  const options: Array<{ label: string; value: string }> = [];
  
  function scanBlock(block: any) {
    if (block.type === 'MarkCompleteButton' && block.props?.id) {
      options.push({
        label: `${block.props.label || 'Mark Complete'} (${block.props.id})`,
        value: block.props.id
      });
    }
    
    if (block.type === 'TaskItemBlock' && block.props?.id) {
      options.push({
        label: `Task: ${block.props.step || 'Untitled'} (${block.props.id})`,
        value: block.props.id
      });
    }
    
    // Recursively scan children
    if (block.props?.content) {
      scanBlocks(block.props.content);
    }
    if (block.props?.items) {
      scanBlocks(block.props.items);
    }
  }
  
  function scanBlocks(blocks: any[]) {
    blocks.forEach(scanBlock);
  }
  
  scanBlocks(content);
  return options;
}
