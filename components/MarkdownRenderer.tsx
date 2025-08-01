import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // 디버깅: 받은 content 확인
  console.log('MarkdownRenderer received:', content.substring(0, 200));
  
  // 이스케이프된 마크다운 복원
  const cleanContent = content
    .replace(/\\\*/g, '*')           // \* -> *
    .replace(/\\#/g, '#')            // \# -> #
    .replace(/\\_/g, '_')            // \_ -> _
    .replace(/\\~/g, '~')            // \~ -> ~
    .replace(/\\`/g, '`')            // \` -> `
    .replace(/\\\[/g, '[')           // \[ -> [
    .replace(/\\\]/g, ']')           // \] -> ]
    .replace(/\\\(/g, '(')           // \( -> (
    .replace(/\\\)/g, ')');          // \) -> )
  
  return (
    <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 제목 스타일
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-white">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 text-gray-900 dark:text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-white">{children}</h3>,
          
          // 단락
          p: ({ children }) => <p className="mb-3 leading-relaxed text-gray-800 dark:text-gray-200">{children}</p>,
          
          // 강조 - 여기가 문제일 수 있음
          strong: ({ children }) => <strong className="font-bold text-purple-700 dark:text-purple-400">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
          
          // 리스트
          ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1 text-gray-800 dark:text-gray-200">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-1 text-gray-800 dark:text-gray-200">{children}</ol>,
          li: ({ children }) => <li className="mb-1 text-gray-800 dark:text-gray-200">{children}</li>,
          
          // 코드
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            if (isInline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                  {children}
                </code>
              );
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
            <a 
              href={href} 
              className="text-purple-600 dark:text-purple-400 hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;