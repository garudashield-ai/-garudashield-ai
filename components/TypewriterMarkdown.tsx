// new release garudashield source
"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function TypewriterMarkdown({ content, speed = 20 }: { content: string, speed?: number }) {
  const [displayedContent, setDisplayedContent] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedContent(content.substring(0, i));
      i++;
      if (i > content.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [content, speed]);

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {displayedContent}
    </ReactMarkdown>
  );
}
