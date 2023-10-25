interface Node {
    [k: string]: Node;
}

export class TreeLogger {
    private root: Node = {};
    withPath(nodes: string[]) {
        let cursor = this.root;
        const items = nodes.slice();
        while (items.length) {
            const next = items.shift();
            cursor = this.attachAndMove(cursor, next!);
        }
        return this;
    }
    attachAndMove(node: Node, subNodeKey: string): Node {
        if (!node[subNodeKey]) {
            node[subNodeKey] = {};
        }
        return node[subNodeKey];
    }
    dump() {
        return this.root;
    }
}
