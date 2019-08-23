import * as TJS from "typescript-json-schema";
import * as ts from "typescript";
import { getAPIFilePath, getSourceFile, getNode, getTypeName, isKind } from "./utils"


export interface ApiInfo {
    name: string; // 函数的名字
    request: string;
    response: string;
    url: string;
    jsDoc?: {
        tags?: ts.NodeArray<ts.JSDocTag>;
        comment?: string;
    },
    schema?: TJS.Definition
}

async function getFunctionInfo(sourceFile: ts.SourceFile): Promise<Array<ApiInfo> | null> {
    let typeName: ApiInfo | null = null;
    const list: Array<ApiInfo> = []

    function traverseAST(node) {
        if (isKind(node, ts.SyntaxKind.FunctionDeclaration)) {
            const parameters = node.parameters
            const callExpressionNode = getNode(node, ts.SyntaxKind.CallExpression).node;
            const responseNode = getNode(callExpressionNode, ts.SyntaxKind.TypeReference).node;

            typeName = {
                name: getTypeName(node.name, ts.SyntaxKind.Identifier),
                request: getTypeName(parameters[0].type, ts.SyntaxKind.TypeReference),
                response: getNode(responseNode, ts.SyntaxKind.Identifier).name,
                url: getNode(callExpressionNode, ts.SyntaxKind.StringLiteral).name
            };
            list.push(typeName)
        } else {
            ts.forEachChild(node, traverseAST);
        }
    }

    traverseAST(sourceFile);

    return list;
}
interface Schemas {
    [key: string]: Array<ApiInfo>
}


export async function getAPISchema(apiPath: string): Promise<Array<ApiInfo> | null> {

    const filePath = await getAPIFilePath(apiPath)
    if (!filePath) {
        throw new Error("Unable to get api file.");
    }

    const sourceFile = await getSourceFile(filePath);

    let funs = await getFunctionInfo(sourceFile);

    const errMsg = "Unable to get api schema.";
    if (funs && funs.length > 0) {
        const program = TJS.getProgramFromFiles([filePath]);
        return funs.map(info => {
            const schema = TJS.generateSchema(program, info.response, {
                ignoreErrors: true,
                required: true
            });
            if (!schema) throw new Error(errMsg);

            return {
                ...info,
                schema
            }

        })

    } else {
        throw new Error(errMsg);
    }
}
