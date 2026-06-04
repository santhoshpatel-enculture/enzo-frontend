import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

const components: Components = {
  p: ({ children }) => (
    <p className="ezo-md-p">{children}</p>
  ),
  h1: ({ children }) => (
    <h3 className="ezo-md-h">{children}</h3>
  ),
  h2: ({ children }) => (
    <h4 className="ezo-md-h">{children}</h4>
  ),
  h3: ({ children }) => (
    <h5 className="ezo-md-h ezo-md-h-sub">{children}</h5>
  ),
  ul: ({ children }) => <ul className="ezo-md-ul">{children}</ul>,
  ol: ({ children }) => <ol className="ezo-md-ol">{children}</ol>,
  li: ({ children }) => <li className="ezo-md-li">{children}</li>,
  strong: ({ children }) => <strong className="ezo-md-strong">{children}</strong>,
  em: ({ children }) => <em className="ezo-md-em">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="ezo-md-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="ezo-md-quote">{children}</blockquote>
  ),
  hr: () => <hr className="ezo-md-hr" />,
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return <code className={`ezo-md-code-block ${className ?? ''}`}>{children}</code>;
    }
    return <code className="ezo-md-code">{children}</code>;
  },
  pre: ({ children }) => <pre className="ezo-md-pre">{children}</pre>,
  table: ({ children }) => (
    <div className="ezo-md-table-wrap">
      <table className="ezo-md-table">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="ezo-md-thead">{children}</thead>,
  tbody: ({ children }) => <tbody className="ezo-md-tbody">{children}</tbody>,
  tr: ({ children }) => <tr className="ezo-md-tr">{children}</tr>,
  th: ({ children }) => <th className="ezo-md-th">{children}</th>,
  td: ({ children }) => <td className="ezo-md-td">{children}</td>,
};

interface ChatMarkdownProps {
  content: string;
}

export default function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <div className="ezo-chat-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
