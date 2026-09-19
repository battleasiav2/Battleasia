import { Link } from 'react-router-dom';
import { splitCaption } from '../lib/text';

export function CaptionText({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <p className={className}>
      {splitCaption(text).map((part, i) => {
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
