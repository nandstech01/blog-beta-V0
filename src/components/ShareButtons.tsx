'use client';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${url}`;
  
  return (
    <div className="flex items-center gap-3 mt-6">
      {/* LINEでシェア */}
      <a
        href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-24 h-8 bg-[#06C755] hover:bg-[#05B54C] rounded-md transition-all duration-200"
        aria-label="LINEでシェア"
      >
        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C5.93 2 1 6.17 1 11.32c0 4.49 3.97 8.25 9.33 8.97.36.08.85.25.97.9.11.58-.05 1.15-.03 1.71 0 .16.15.31.34.24 1.75-.77 9.4-5.54 12.87-9.49C25.94 11.08 26 9.22 26 8.66 26 6.17 21.07 2 12 2zM7.83 14.27a.83.83 0 01-.83-.83V9.89a.83.83 0 111.66 0v2.72h1.78a.83.83 0 110 1.66H7.83zm3.02-.83a.83.83 0 11-1.66 0V9.89a.83.83 0 111.66 0v3.55zm4.99 0a.83.83 0 01-1.49.51l-2.49-3.41v2.9a.83.83 0 11-1.66 0V9.89a.83.83 0 011.49-.51l2.49 3.41V9.89a.83.83 0 111.66 0v3.55zm3.02 0a.83.83 0 01-1.66 0V9.89a.83.83 0 111.66 0v3.55z"/>
        </svg>
      </a>

      {/* Xでシェア */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-24 h-8 bg-black hover:bg-gray-800 rounded-md transition-all duration-200"
        aria-label="Xでシェア"
      >
        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246zm0 0"/>
        </svg>
      </a>
    </div>
  );
}