import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Dependency } from './dependency';
import { VersionChecker } from './version-checker';

export class DependencyProvider implements vscode.TreeDataProvider<Dependency> {
    
    private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;

    private versionChecker: VersionChecker = new VersionChecker;
    
    constructor(private workspaceRoot: string | undefined)
    {}
    
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
    
    getTreeItem(element: Dependency): vscode.TreeItem {
        return element;
    }
    
    getChildren(element?: Dependency): Thenable<Dependency[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No dependency in empty workspace');
            return Promise.resolve([]);
        }
        
        if (element) {
            return Promise.resolve(this.fetchFromPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
        } else {
            const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
            if (this.pathExists(packageJsonPath)) {
                return Promise.resolve(this.fetchFromPackageJson(packageJsonPath));
            } else {
                vscode.window.showInformationMessage('Workspace has no package.json');
                return Promise.resolve([]);
            }
        }
        
    }

    private fetchFromPackageJson(packageJsonPath: string): Dependency[] {
        if (this.pathExists(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            
            const toDependency = (moduleName: string, version: string): Dependency =>
            {
                this.versionChecker.setInsight(moduleName, version);

                if (this.pathExists(path.join(this.workspaceRoot, 'node_modules', moduleName))) {
                    return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed);
                } else {
                    return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None, {
                        command: 'extension.openPackageOnNpm',
                        title: '',
                        arguments: [moduleName]
                    });
                }
            };
            
            const deps = packageJson.dependencies
                ? Object.keys(packageJson.dependencies).map(dep => toDependency(dep, packageJson.dependencies[dep]))
                : [];
                
            const devDeps = packageJson.devDependencies
                ? Object.keys(packageJson.devDependencies).map(dep => toDependency(dep, packageJson.devDependencies[dep]))
                : [];
            
            return deps.concat(devDeps);
        } else {
            return [];
        }
    }
    
    private pathExists(p: string): boolean {
        try {
            fs.accessSync(p);
        } catch (err) {
            return false;
        }
        
        return true;
    }
}