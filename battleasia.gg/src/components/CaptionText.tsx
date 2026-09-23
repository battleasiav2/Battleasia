import { Link } from 'react-router-dom';
import { splitCaption } from '../lib/text';

export function CaptionText({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;
  const clean = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!clean) return null;
  return (
    <p className={className}>
      {splitCaption(clean).map((part, i) => {
        if (part.startsWith('#')) {
          return (
            <Link key={`${part}-${i}`} className="tag-link" to={`/user/hashtag/${encodeURIComponent(part.slice(1).toLowerCase())}`}>
              {part}
            </Link>
          );
        }
        if (part.startsWith('@')) {
          return (
            <span key={`${part}-${i}`} className="mention">
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
