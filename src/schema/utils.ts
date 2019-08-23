import * as path from "path";

import * as fse from "fs-extra";
import * as ts from "typescript";

export function isKind(node: ts.Node, syntaxKind: ts.SyntaxKind) {
    return node.kind === syntaxKind;
}

/**
 * 通过api ts的地址，获取ts的SourceFile (抽象语法树的根节点)
 * 
 */
export async function getSourceFile(filePath: string): Promise<ts.SourceFile> {
    const content = await fse.readFile(filePath, "utf8");
    return ts.createSourceFile("", content, ts.ScriptTarget.ES2015);
}


export async function getAPIFilePath(apiFilePath: string): Promise<string | null> {

    if (!apiFilePath.match(/\.ts$/)) {
        apiFilePath += ".ts"
    }

    const filePath = path.resolve(apiFilePath);

    if (await fse.pathExists(filePath)) {
        return filePath
    }

    return null;
}


export function getTypeName(sourceFile: ts.Node, syntaxKind: ts.SyntaxKind): string {
    let typeName = "";
    function traverse(node) {
        if (isKind(node, syntaxKind)) {
            switch (syntaxKind) {
                case ts.SyntaxKind.TypeReference:
                    typeName = node.typeName.text
                    break;
                case ts.SyntaxKind.FunctionDeclaration:
                    typeName = node.name.text
                    break;
                default:
                    typeName = node.text
                    break;
            }
        }
        else {
            ts.forEachChild(node, traverse);
        }
    }
    traverse(sourceFile);

    return typeName;
}
interface TsNode {
    node: ts.Node,
    name: string
}
export function getNode(sourceFile: ts.Node, syntaxKind: ts.SyntaxKind): TsNode {
    let tsNode: ts.Node, typeName = "";
    function traverse(node) {
        if (isKind(node, syntaxKind)) {
            tsNode = node
            typeName = getTypeName(node, syntaxKind)
        }
        else {
            ts.forEachChild(node, traverse);
        }
    }
    traverse(sourceFile);

    return {
        node: tsNode,
        name: typeName
    };
} 