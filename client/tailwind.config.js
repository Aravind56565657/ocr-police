/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // Deep navy government aesthetic
                navy: {
                    50: '#f0f4ff',
                    100: '#e0e9ff',
                    200: '#c7d7fe',
                    300: '#a5bcfc',
                    400: '#8196f8',
                    500: '#6370f1',
                    600: '#4f51e5',
                    700: '#4040ca',
                    800: '#3535a3',
                    900: '#2f3181',
                    950: '#1c1d4e',
                },
                slate: {
                    950: '#0a0f1e',
                },
                amber: {
                    // Warning/flag color for low confidence
                    400: '#fbbf24',
                    500: '#f59e0b',
                }
            },
            fontFamily: {
                display: ['Space Grotesk', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 1.5s infinite',
            },
            keyframes: {
                fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
                slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
            },
            boxShadow: {
                'card': '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)',
                'card-hover': '0 4px 12px rgba(0,0,0,0.12), 0 16px 40px rgba(0,0,0,0.08)',
            }
        },
    },
    plugins: [],
};
