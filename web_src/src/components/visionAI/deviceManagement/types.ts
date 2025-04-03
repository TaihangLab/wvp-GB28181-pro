export interface TreeNode {
  label: string;
  children?: TreeNode[];
  status?: 'online' | 'offline';
} 