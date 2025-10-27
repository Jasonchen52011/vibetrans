'use client';

import React from 'react';

interface LinkableTextProps {
  text: string;
  className?: string;
}

export function LinkableText({ text, className = '' }: LinkableTextProps) {
  // 检查是否包含HTML链接
  if (text.includes('<a href=')) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  // 检查是否包含Markdown链接
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = [...text.matchAll(markdownLinkRegex)];

  if (matches.length > 0) {
    let processedText = text;
    const elements: JSX.Element[] = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
      // 添加链接前的文本
      if (match.index! > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {processedText.slice(lastIndex, match.index)}
          </span>
        );
      }

      // 添加链接
      const linkText = match[1];
      const linkUrl = match[2];
      elements.push(
        <a
          key={`link-${index}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {linkText}
        </a>
      );

      lastIndex = match.index! + match[0].length;
    });

    // 添加剩余的文本
    if (lastIndex < processedText.length) {
      elements.push(
        <span key="text-final">
          {processedText.slice(lastIndex)}
        </span>
      );
    }

    return <div className={className}>{elements}</div>;
  }

  // 如果没有链接，返回普通文本
  return <div className={className}>{text}</div>;
}