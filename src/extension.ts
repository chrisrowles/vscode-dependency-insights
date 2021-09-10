'use strict'

import * as vscode from 'vscode'
import { Dependency } from './lib/dependency';
import { DependencyProvider } from './lib/dependency-provider';

export function activate(context: vscode.ExtensionContext) {
    const fsPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    const nodeDependenciesProvider = new DependencyProvider(fsPath);

    vscode.window.registerTreeDataProvider('nodeDependencies', nodeDependenciesProvider);
    
    vscode.commands.registerCommand('nodeDependencies.refreshEntry', () => {
        nodeDependenciesProvider.refresh()
    });

    vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`))
    });

    vscode.commands.registerCommand('nodeDependencies.addEntry', () => {
        vscode.window.showInformationMessage(`Successfully called add entry.`)
    });

    vscode.commands.registerCommand('nodeDependencies.editEntry', (node: Dependency) => {
        vscode.window.showInformationMessage(`Successfully called edit entry on ${node.label}.`)
    });

    vscode.commands.registerCommand('nodeDependencies.deleteEntry', (node: Dependency) => {
        vscode.window.showInformationMessage(`Successfully called delete entry on ${node.label}.`)
    });
}