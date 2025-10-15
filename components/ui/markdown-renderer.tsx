import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none bg-white dark:bg-gray-900 p-4 rounded-md ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // 코드 블록 스타일링
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return isInline ? (
              <code className="bg-white dark:bg-gray-900 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-white dark:bg-gray-900 rounded-md p-4 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          // 링크 스타일링
          a({ children, href, ...props }) {
            return (
              <a 
                href={href} 
                className="text-blue-600 dark:text-blue-400 hover:underline" 
                target="_blank" 
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },
          // 테이블 스타일링
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          th({ children, ...props }) {
            return (
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-gray-700 font-semibold" {...props}>
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props}>
                {children}
              </td>
            );
          },
          // 인용구 스타일링
          blockquote({ children, ...props }) {
            return (
              <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300" {...props}>
                {children}
              </blockquote>
            );
          },
          // 목록 스타일링
          ul({ children, ...props }) {
            return (
              <ul className="list-disc list-inside space-y-1" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol className="list-decimal list-inside space-y-1" {...props}>
                {children}
              </ol>
            );
          },
          // 헤딩 스타일링
          h1({ children, ...props }) {
            return (
              <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0" {...props}>
                {children}
              </h1>
            );
          },
          h2({ children, ...props }) {
            return (
              <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0" {...props}>
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            return (
              <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0" {...props}>
                {children}
              </h3>
            );
          },
          // 문단 스타일링
          p({ children, ...props }) {
            return (
              <p className="mb-3 last:mb-0" {...props}>
                {children}
              </p>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
