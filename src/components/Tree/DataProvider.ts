import Node from './Node';

export interface DataProvider {
  getChildren(node: Node): Promise<Node[]>;
}

export default DataProvider;
