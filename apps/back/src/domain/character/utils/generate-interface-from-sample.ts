import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

const SCRIPT_FILE = 'src/domain/character/utils/generate-interface-from-sample.ts';
const SAMPLE_DIR = 'src/domain/character/types/samples';
const TYPE_DIR = 'src/domain/character/types';

function toPascalCase(value: string): string {
  return value
    .replace(/\.ts$/, '')
    .replace(/\.raw$/, '-raw')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function isDateLike(name: string): boolean {
  return /date|expire/i.test(name);
}

function isFlagLike(name: string): boolean {
  return /flag/i.test(name);
}

function getPropertyName(name: ts.PropertyName): string {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return name.getText();
}

function getIndent(depth: number): string {
  return '  '.repeat(depth);
}

function inferType(node: ts.Expression, keyName = '', depth = 1): string {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return isDateLike(keyName) ? 'string | null' : 'string';
  }

  if (ts.isNumericLiteral(node) || (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand))) {
    return isFlagLike(keyName) ? 'boolean' : 'number';
  }

  if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) {
    return 'boolean';
  }

  if (node.kind === ts.SyntaxKind.NullKeyword) {
    if (isDateLike(keyName)) return 'string | null';
    if (isFlagLike(keyName)) return 'boolean | null';
    return 'unknown | null';
  }

  if (ts.isArrayLiteralExpression(node)) {
    const firstElement = node.elements.find((element): element is ts.Expression => ts.isExpression(element));

    if (!firstElement) return 'unknown[]';

    const elementType = inferType(firstElement, keyName, depth);
    return `${elementType}[]`;
  }

  if (ts.isObjectLiteralExpression(node)) {
    const members = node.properties.filter(ts.isPropertyAssignment).map((property) => {
      const name = getPropertyName(property.name);
      const valueType = inferType(property.initializer, name, depth + 1);
      return `${getIndent(depth)}${name}: ${valueType};`;
    });

    if (members.length === 0) return '{}';

    return `{\n${members.join('\n')}\n${getIndent(depth - 1)}}`;
  }

  return 'unknown';
}

function findSampleObject(sourceFile: ts.SourceFile): ts.ObjectLiteralExpression {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
        return declaration.initializer;
      }
    }
  }

  throw new Error('No top-level sample object was found.');
}

function buildInterfaceContent(inputPath: string, interfaceName: string): string {
  const sourceText = readFileSync(inputPath, 'utf8');
  const sourceFile = ts.createSourceFile(inputPath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const sampleObject = findSampleObject(sourceFile);

  const body = sampleObject.properties
    .filter(ts.isPropertyAssignment)
    .map((property) => {
      const name = getPropertyName(property.name);
      const type = inferType(property.initializer, name, 2);
      return `  ${name}: ${type};`;
    })
    .join('\n');

  return `export interface ${interfaceName} {\n${body}\n}\n`;
}

function writeFromPath(inputArg: string, outputArg?: string, interfaceNameArg?: string) {
  const inputPath = path.resolve(process.cwd(), inputArg);
  const defaultInterfaceName = toPascalCase(path.basename(inputPath));
  const interfaceName = interfaceNameArg ?? defaultInterfaceName;
  const outputPath = outputArg ? path.resolve(process.cwd(), outputArg) : inputPath;
  const content = buildInterfaceContent(inputPath, interfaceName);

  writeFileSync(outputPath, content, 'utf8');
  console.log(`written: ${outputPath}`);
}

function writeFromTargetName(targetName: string) {
  const inputPath = path.resolve(process.cwd(), SAMPLE_DIR, `${targetName}.raw.sample.ts`);
  const outputPath = path.resolve(process.cwd(), TYPE_DIR, `${targetName}.raw.ts`);
  const interfaceName = toPascalCase(`${targetName}.raw.ts`);
  const content = buildInterfaceContent(inputPath, interfaceName);

  writeFileSync(outputPath, content, 'utf8');
  console.log(`written: ${outputPath}`);
}

function isPathLike(value: string): boolean {
  return value.includes('/') || value.endsWith('.ts');
}

function main() {
  const args = process.argv.slice(2);
  const inputArg = args[0];

  if (!inputArg) {
    throw new Error(
      [
        `Usage: ts-node ${SCRIPT_FILE} <input-ts-path> [output-ts-path] [interface-name]`,
        `   or: ts-node ${SCRIPT_FILE} <target-name> [target-name...]`,
        `   ex: ts-node ${SCRIPT_FILE} vmatrix skill dojang`,
      ].join('\n'),
    );
  }

  if (args.every((arg) => !isPathLike(arg))) {
    args.forEach(writeFromTargetName);
    return;
  }

  writeFromPath(args[0], args[1], args[2]);
}

main();
