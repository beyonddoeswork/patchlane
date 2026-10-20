/** @type {import('next').NextConfig} */

// Define CSP directives allowing self, Firebase Auth/API, Google APIs, and inline styles for Tailwind/Next.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.firebaseio.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.googleusercontent.com https://firebasestorage.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com wss://*.firebaseio.com;
  frame-src 'self' https://*.firebaseapp.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  // 1. Content-Security-Policy (XSS & Injection Protection)
  {
    key: 'Content-Security-Policy',
    value: cspHeader,
  },
  // 2. X-Content-Type-Options (MIME-Sniffing Prevention)
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // 3. X-Frame-Options (Clickjacking Protection)
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // 4. X-XSS-Protection (Legacy Browser Filter)
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // 5. Referrer-Policy & Permissions-Policy (Defense-in-depth)
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
];

const nextConfig = {
  serverExternalPackages: ["firebase-admin"],
  async headers() {
    return [
      // Apply baseline security headers to all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Cache-Control: Prevent sensitive user data & ticket queues from being cached
      {
        source: '/(api|dashboard|admin)(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;