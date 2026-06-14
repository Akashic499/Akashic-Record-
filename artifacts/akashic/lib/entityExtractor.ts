const STOP_WORDS = new Set([
  'The', 'A', 'An', 'This', 'That', 'These', 'Those', 'It', 'He', 'She',
  'They', 'We', 'I', 'My', 'His', 'Her', 'Their', 'Our', 'Your', 'Its',
  'In', 'On', 'At', 'By', 'For', 'With', 'From', 'To', 'Of', 'And', 'But',
  'Or', 'However', 'Therefore', 'Also', 'When', 'While', 'After', 'Before',
  'During', 'Since', 'Although', 'Because', 'If', 'Unless', 'Until', 'Where',
  'Who', 'Which', 'What', 'How', 'Why', 'All', 'Some', 'Many', 'Most', 'More',
  'New', 'Other', 'First', 'Last', 'One', 'Two', 'Three', 'Four', 'Five',
  'According', 'As', 'So', 'Then', 'Now', 'Here', 'There', 'Up', 'Down',
  'Over', 'Under', 'About', 'Around', 'Just', 'Only', 'Not', 'No', 'Yes',
  'Use', 'Used', 'Using', 'Get', 'Got', 'Getting', 'Make', 'Made', 'Making',
  'See', 'Seen', 'Seeing', 'Go', 'Going', 'Gone', 'Come', 'Coming',
  'Inc', 'Ltd', 'Corp', 'Co', 'LLC', 'Ltd',
]);

export function extractEntities(text: string): string[] {
  if (!text || text.length < 50) return [];

  const properNounPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/g;
  const matches: string[] = [];
  let match;

  while ((match = properNounPattern.exec(text)) !== null) {
    matches.push(match[1]);
  }

  const counts: Record<string, number> = {};
  for (const name of matches) {
    const parts = name.split(' ');
    const filtered = parts.filter(p => !STOP_WORDS.has(p));
    if (filtered.length === 0) continue;
    if (name.length < 3) continue;
    counts[name] = (counts[name] || 0) + 1;
  }

  return Object.entries(counts)
    .filter(([name, count]) => count >= 1 && name.length >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name]) => name);
}

export function generateSummary(content: string, maxLength = 200): string {
  if (!content) return '';
  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.length < 300);

  const summary = sentences.slice(0, 2).join(' ');
  if (summary.length <= maxLength) return summary;
  return summary.substring(0, maxLength).replace(/\s\w+$/, '') + '…';
}
