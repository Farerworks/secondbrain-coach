import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 제목 스타일
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>,
          
          // 단락
          p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
          
          // 강조
          strong: ({ children }) => <strong className="font-bold text-purple-600 dark:text-purple-400">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          
          // 리스트
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="ml-4">{children}</li>,
          
          // 코드
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) {
              return <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-sm font-mono">{children}</code>;
            }
            return (
              <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg mb-3 overflow-x-auto">
                <code className="text-sm font-mono">{children}</code>
              </pre>
            );
          },
          
          // 인용구
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-purple-500 pl-4 my-3 italic text-gray-700 dark:text-gray-300">
              {children}
            </blockquote>
          ),
          
          // 구분선
          hr: () => <hr className="my-6 border-gray-300 dark:border-gray-600" />,
          
          // 링크
          a: ({ href, children }) => (
            <a href={href} className="text-purple-600 dark:text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          
          // 표
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-gray-300 dark:border-gray-600">{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold border-r border-gray-300 dark:border-gray-600 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border-r border-gray-300 dark:border-gray-600 last:border-r-0">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};