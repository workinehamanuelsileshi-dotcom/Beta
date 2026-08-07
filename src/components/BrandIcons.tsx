import React from 'react';

// Crisp, pixel-perfect brand SVG icons matching the premium design
export const BrandIcon = ({ name, className = "w-5 h-5" }: { name: string; className?: string }) => {
  switch (name.toLowerCase()) {
    case 'zendesk':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#03363D" />
          <path d="M6 7.5c0-.828.672-1.5 1.5-1.5h1c.828 0 1.5.672 1.5 1.5v3c0 .828-.672 1.5-1.5 1.5h-1A1.5 1.5 0 016 10.5v-3zM14 13.5c0-.828.672-1.5 1.5-1.5h1c.828 0 1.5.672 1.5 1.5v3c0 .828-.672 1.5-1.5 1.5h-1a1.5 1.5 0 01-1.5-1.5v-3zM6 13.5c0-.828.672-1.5 1.5-1.5h1c.828 0 1.5.672 1.5 1.5v3c0 .828-.672 1.5-1.5 1.5h-1a1.5 1.5 0 01-1.5-1.5v-3z" fill="#FFF" />
          <path d="M14 7.5c0-.828.672-1.5 1.5-1.5h1c.828 0 1.5.672 1.5 1.5v3c0 .828-.672 1.5-1.5 1.5h-1A1.5 1.5 0 0114 10.5v-3z" fill="#FFF" opacity="0.6" />
        </svg>
      );
    case 'openai':
    case 'gemini':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#10A37F" />
          <path d="M16.5 10a1.5 1.5 0 00-1.24-.66c-.4 0-.75.16-1.01.42l-.5.5-.5-.5a1.44 1.44 0 00-2.02 0l-.5.5-.5-.5a1.44 1.44 0 00-2.02 0l-.5.5a1.5 1.5 0 001.01 2.58c.4 0 .75-.16 1.01-.42l.5-.5.5.5c.26.26.61.42 1.01.42s.75-.16 1.01-.42l.5-.5.5.5c.26.26.61.42 1.01.42s.75-.16 1.01-.42l.5-.5a1.5 1.5 0 00-1.01-2.58z" fill="#FFF" />
          <circle cx="12" cy="12" r="3.5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'slack':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#4A154B" />
          <circle cx="9.5" cy="8.5" r="1.5" fill="#36C5F0" />
          <rect x="12" y="7" width="3" height="3" rx="1.5" fill="#2EB67D" />
          <circle cx="14.5" cy="15.5" r="1.5" fill="#ECB22E" />
          <rect x="9" y="14" width="3" height="3" rx="1.5" fill="#E01E5A" />
        </svg>
      );
    case 'hubspot':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#FF7A59" />
          <path d="M12 6a2 2 0 11-4 0 2 2 0 014 0zM10 10v4.5a1.5 1.5 0 103 0V11a3 3 0 113 3h-2" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'stripe':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#635BFF" />
          <path d="M14.2 11.1c-.6-.3-1.3-.5-1.9-.5-.6 0-1 .2-1 .6 0 .8 2.2.6 2.2 2.1 0 1-.9 1.7-2.3 1.7-.8 0-1.6-.2-2.2-.5v-1.6c.7.4 1.4.6 2.1.6.5 0 .9-.2.9-.6 0-.8-2.2-.6-2.2-2.1 0-1 .9-1.7 2.2-1.7.8 0 1.5.2 2 .4v1.5z" fill="#FFF" />
        </svg>
      );
    case 'quickbooks':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#2CA01C" />
          <path d="M8 8h8v8H8V8z" stroke="#FFF" strokeWidth="2" />
          <path d="M11 11h2v2h-2v-2z" fill="#FFF" />
        </svg>
      );
    case 'shopify':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#95BF47" />
          <path d="M8 8.5L7 17l8 2 2-10.5L8 8.5z" fill="#FFF" />
          <path d="M12 6a1.5 1.5 0 011.5 1.5v1h-3v-1A1.5 1.5 0 0112 6z" stroke="#FFF" strokeWidth="1" fill="none" />
        </svg>
      );
    case 'airtable':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#18BFFF" />
          <path d="M12 7l5 3v4l-5 3-5-3v-4l5-3z" fill="#FFF" />
          <path d="M12 7l-5 3 5 3 5-3-5-3zM7 14l5 3v4l-5-3v-4z" fill="#FFF" opacity="0.8" />
        </svg>
      );
    case 'google workspace':
    case 'gmail':
    case 'email':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#EA4335" />
          <path d="M6 8l6 4 6-4v8H6V8z" fill="#FFF" />
          <path d="M6 8l6 4 6-4" stroke="#B31412" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'apollo':
    case 'clearbit':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#1E293B" />
          <path d="M12 6l6 11H6L12 6z" fill="#FFF" />
        </svg>
      );
    default:
      return (
        <div className="w-6 h-6 rounded-lg bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center">
          {name.charAt(0).toUpperCase()}
        </div>
      );
  }
};
