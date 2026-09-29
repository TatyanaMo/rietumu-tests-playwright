import * as fs from 'node:fs';
import * as path from 'node:path';

export function loadDocument(relativePath: string): string {
    const fullPath = path.join(__dirname, '..', 'fixtures', relativePath);
    return fs.readFileSync(fullPath, 'utf-8');
}
