import { useEffect, useState, type DragEvent } from 'react';

type FilePickProps = {
  accept: string;
  multiple?: boolean;
  max?: number;
  disabled?: boolean;
  hint: string;
  files?: File[];
  onFiles: (files: File[]) => void;
};

function isVisual(file: File) {
  return file.type.startsWith('image/') || file.type.startsWith('video/');
}

export function FilePick({
  accept,
  multiple = true,
  max,
  disabled,
  hint,
  files = [],
  onFiles,
}: FilePickProps) {
  const [over, setOver] = useState(false);
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([]);
  const limit = max ?? (multiple ? 8 : 1);

  useEffect(() => {
    const next = files.map((file) => ({
      file,
      url: isVisual(file) ? URL.createObjectURL(file) : '',
    }));
    setPreviews(next);
    return () => {
      for (const item of next) {
        if (item.url) URL.revokeObjectURL(item.url);
      }
    };
  }, [files]);

  function take(list: FileList | null) {
    const picked = Array.from(list || []);
    if (!picked.length) return;
    if (!multiple) {
      onFiles(picked.slice(0, 1));
      return;
    }
    const merged = [...files, ...picked];
    const seen = new Set<string>();
    const unique = merged.filter((f) => {
      const key = `${f.name}-${f.size}-${f.lastModified}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    onFiles(unique.slice(0, limit));
  }

  function onDrag(e: DragEvent, next: boolean) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setOver(next);
  }

  function removeAt(index: number) {
    onFiles(files.filter((_, i) => i !== index));
  }

  return (
    <div className={`file-attach${disabled ? ' is-off' : ''}`}>
      {previews.length ? (
        <ul className="file-thumbs" aria-label={hint}>
          {previews.map((item, i) => (
            <li key={`${item.file.name}-${item.file.size}-${i}`}>
              {item.url && item.file.type.startsWith('image/') ? (
                <img src={item.url} alt="" />
              ) : item.url && item.file.type.startsWith('video/') ? (
                <video src={item.url} muted playsInline />
              ) : (
                <span className="file-thumb-name">{item.file.name}</span>
              )}
              <button type="button" className="file-thumb-x" aria-label="Remove" disabled={disabled} onClick={() => removeAt(i)}>
                ×
              </button>
            </li>
          ))}
          {multiple && files.length < limit ? (
            <li className="file-thumb-add">
              <label>
                <input
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  disabled={disabled}
                  onChange={(e) => {
                    take(e.target.files);
                    e.target.value = '';
                  }}
                />
                <span>+</span>
              </label>
            </li>
          ) : null}
        </ul>
      ) : null}

      <label
        className={`file-pick${over ? ' is-over' : ''}${disabled ? ' is-off' : ''}${previews.length ? ' is-compact' : ''}`}
        onDragEnter={(e) => onDrag(e, true)}
        onDragOver={(e) => onDrag(e, true)}
        onDragLeave={(e) => onDrag(e, false)}
        onDrop={(e) => {
          onDrag(e, false);
          take(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            take(e.target.files);
            e.target.value = '';
          }}
        />
        <span className="file-pick-mark" aria-hidden>
          +
        </span>
        <span>{files.length ? `${files.length}/${limit}` : hint}</span>
      </label>
    </div>
  );
}
