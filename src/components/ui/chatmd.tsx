import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMdProps {
  content: string;
}

const ChatMd = ({ content }: ChatMdProps) => {
  return (
    <div className="prose prose-sm mx-auto text-white">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default ChatMd;