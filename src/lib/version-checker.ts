import * as child from 'child_process';

export class VersionChecker {
    
    constructor() {}

    public setInsight(moduleName: string, version: string): void {
        child.exec(`npm show ${moduleName} version`, (err, stdout, stderr) => {
            if (stdout !== '') {
                if (this.checkVersion(version.replace('^', ''), stdout.trim()) < 0) {
                    console.log(`${moduleName} is outdated, current version: ${version.replace('^', '')}, latest: ${stdout.trim()}`)
                }
            }
        })
    }

    private checkVersion(currentVersion: string, nextVersion: string): number {
        const currentVersionParts = currentVersion.split('.');
        const nextVersionParts = nextVersion.split('.');
        
        const validateParts = (parts: Array<string>) => {
            for (let i = 0; i < parts.length; ++i) {
                if (!/^\d+$/.test(parts[i])) {
                    return false;
                }
            }

            return true;
        }
        
        if (!validateParts(currentVersionParts) || !validateParts(nextVersionParts)) {
            return NaN;
        }
        
        for (let i = 0; i < currentVersionParts.length; ++i) {
            if (nextVersionParts.length === i) {
                return 1;
            }
            
            if (currentVersionParts[i] === nextVersionParts[i]) {
                continue;
            }

            if (currentVersionParts[i] > nextVersionParts[i]) {
                return 1;
            }

            return -1;
        }
        
        if (currentVersionParts.length != nextVersionParts.length) {
            return -1;
        }
        
        return 0;
    }
}