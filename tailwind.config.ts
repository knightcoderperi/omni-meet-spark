
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
				'8xl': ['6rem', { lineHeight: '1' }],
				'9xl': ['8rem', { lineHeight: '1' }],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Premium dark theme colors
				'electric-blue': '#0066ff',
				'neon-green': '#00ff88',
				'cyber-purple': '#8b5cf6',
				'dark-primary': '#0a0a0a',
				'dark-secondary': '#111111',
				'dark-tertiary': '#1a1a1a',
				'surface-primary': '#1f1f1f',
				'surface-secondary': '#2a2a2a',
				'surface-tertiary': '#333333',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': '1rem',
				'3xl': '1.5rem',
				'4xl': '2rem',
			},
			backdropBlur: {
				'xs': '2px',
				'4xl': '72px',
				'5xl': '96px',
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'scale-in': 'scale-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'slide-up': 'slide-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'float': 'float3D 6s ease-in-out infinite',
				'float-slow': 'float3D 8s ease-in-out infinite',
				'float-fast': 'float3D 4s ease-in-out infinite',
				'gradient': 'gradientShift 4s ease infinite',
				'shimmer': 'shimmer 2.5s infinite',
				'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
				'morph': 'morphGradient 8s ease-in-out infinite',
				'particle': 'particleFloat 12s ease-in-out infinite',
				'bounce-premium': 'bounce 1s infinite',
				'spin-slow': 'spin 3s linear infinite',
				'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px) scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.9)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(30px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'gradientShift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'pulseGlow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px rgba(0, 102, 255, 0.2)',
						transform: 'scale(1)'
					},
					'50%': { 
						boxShadow: '0 0 40px rgba(0, 102, 255, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)',
						transform: 'scale(1.02)'
					}
				},
				'float3D': {
					'0%, 100%': {
						transform: 'translateY(0px) rotateX(0deg) rotateY(0deg)'
					},
					'25%': {
						transform: 'translateY(-10px) rotateX(5deg) rotateY(2deg)'
					},
					'50%': {
						transform: 'translateY(-20px) rotateX(0deg) rotateY(5deg)'
					},
					'75%': {
						transform: 'translateY(-10px) rotateX(-2deg) rotateY(2deg)'
					}
				},
				'morphGradient': {
					'0%, 100%': {
						borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
						transform: 'rotate(0deg)'
					},
					'50%': {
						borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
						transform: 'rotate(180deg)'
					}
				},
				'particleFloat': {
					'0%, 100%': {
						transform: 'translateY(0px) translateX(0px) scale(1)',
						opacity: '0.7'
					},
					'25%': {
						transform: 'translateY(-20px) translateX(10px) scale(1.1)',
						opacity: '1'
					},
					'50%': {
						transform: 'translateY(-40px) translateX(-5px) scale(0.9)',
						opacity: '0.8'
					},
					'75%': {
						transform: 'translateY(-20px) translateX(-10px) scale(1.05)',
						opacity: '0.9'
					}
				}
			},
			boxShadow: {
				'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
				'electric': '0 0 20px rgba(0, 102, 255, 0.3), 0 0 40px rgba(0, 102, 255, 0.2)',
				'neon': '0 0 20px rgba(0, 255, 136, 0.4), 0 0 40px rgba(0, 255, 136, 0.2)',
				'cyber': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
				'rainbow': '0 0 30px rgba(0, 102, 255, 0.3), 0 0 60px rgba(139, 92, 246, 0.2), 0 0 90px rgba(0, 255, 136, 0.1)',
			},
			blur: {
				'xs': '2px',
				'4xl': '72px',
				'5xl': '96px',
			},
			scale: {
				'102': '1.02',
				'103': '1.03',
				'104': '1.04',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
