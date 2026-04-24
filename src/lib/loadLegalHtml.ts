import fs from 'node:fs';
import path from 'node:path';

/** `_old`에서 복사한 `content/legal/*.htm` 본문 */
export function loadLegalHtml(filename: 'privacyDoc.htm' | 'termsDoc.htm'): string {
  const filePath = path.join(process.cwd(), 'content', 'legal', filename);
  return fs.readFileSync(filePath, 'utf8');
}
