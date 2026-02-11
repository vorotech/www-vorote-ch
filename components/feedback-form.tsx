"use client";

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react"
import { useTheme } from "next-themes";

declare global {
    interface Window {
        turnstile: any;
        onTurnstileSuccess: (token: string) => void;
        onTurnstileError: () => void;
        onTurnstileExpire: () => void;
    }
}

export const FeedbackForm = () => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [token, setToken] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    // Simple email validation for UI
    const validateEmailFormat = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        
        // Clear error when user starts typing
        if (emailError) setEmailError('');
        
        // Validate on blur or when email looks complete
        if (newEmail && !validateEmailFormat(newEmail) && newEmail.includes('@')) {
            setEmailError('Please enter a valid email address');
        }
    };

    const handleEmailBlur = () => {
        if (email && !validateEmailFormat(email)) {
            setEmailError('Please enter a valid email address');
        }
    };

    useEffect(() => {
        // Cleanup function to remove widget
        return () => {
            if (window.turnstile && widgetIdRef.current) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, []);

    const renderTurnstileWidget = () => {
        if (window.turnstile && containerRef.current && !widgetIdRef.current) {
            const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
            
            console.log('Rendering Turnstile widget with sitekey:', siteKey);

            try {
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    theme: theme === 'dark' ? 'dark' : 'light',
                    callback: (t: string) => {
                        console.log('Turnstile success token:', t ? t.substring(0, 10) + '...' : 'null');
                        setToken(t);
                        setErrorMessage(''); // Clear potential previous errors
                    },
                    'error-callback': () => {
                        console.error('Turnstile error');
                        setErrorMessage('Turnstile verification failed. Please try again.');
                    },
                    'expired-callback': () => {
                        console.warn('Turnstile expired');
                        setToken(null);
                        setErrorMessage('Turnstile expired. Please verify again.');
                    },
                });
            } catch (err) {
                console.error('Error rendering Turnstile:', err);
            }
        }
    };

    // Attempt to render if script is already loaded or when returning to form
    useEffect(() => {
        if (window.turnstile && status === 'idle') {
            // Small delay to ensure DOM is ready after status change
            const timeout = setTimeout(() => {
                renderTurnstileWidget();
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [theme, status]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate email before submission
        if (!validateEmailFormat(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        
        if (!token) {
            setErrorMessage('Please complete the human verification.');
            return;
        }

        setStatus('loading');
        setErrorMessage('');
        setEmailError('');

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, message, token }),
            });

            const data = await res.json() as { message: string };

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setStatus('success');
            setEmail('');
            setMessage('');
            setToken(null);
            
            // Remove the widget on success
            if (window.turnstile && widgetIdRef.current) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message || 'Failed to send feedback');
            
            // Reset the widget on error
            if (window.turnstile && widgetIdRef.current) {
                window.turnstile.reset(widgetIdRef.current);
            }
            setToken(null);
        }
    };

    // Check if email sending is enabled
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_EMAIL_SENDING !== 'false';
    
    if (!isEnabled) {
        return null;
    }

    return (
        <div className="w-full max-w-md mx-auto bg-card rounded-xl shadow-lg border border-border p-6">
            <Script 
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" 
                strategy="lazyOnload"
                onLoad={() => {
                    console.log('Turnstile script loaded');
                    renderTurnstileWidget();
                }}
            />
            <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Feedback & Requests
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
                Have a suggestion or found a bug? Let me know!
            </p>

            <AnimatePresence mode="wait">
                {status === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-8 text-center"
                    >
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="text-lg font-medium text-foreground mb-2">Thank you!</h4>
                        <p className="text-muted-foreground">
                            Your feedback has been sent successfully.
                        </p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-6 text-sm text-primary hover:text-primary/90 font-medium"
                        >
                            Send another message
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                onBlur={handleEmailBlur}
                                placeholder="your@email.com"
                                required
                                autoComplete="off"
                                data-form-type="other"
                                data-lpignore="true"
                                className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:border-primary outline-none transition-all text-foreground ${
                                    emailError 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-border focus:ring-primary'
                                }`}
                            />
                            {emailError && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    {emailError}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                                Message
                            </label>
                            <div className="relative">
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Tell me what you think..."
                                    required
                                    rows={4}
                                    maxLength={500}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none text-foreground"
                                />
                                <div className="text-xs text-muted-foreground mt-1 text-right">
                                    {message.length}/500
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center min-h-[65px]">
                            <div ref={containerRef} />
                        </div>

                        {errorMessage && (
                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Feedback'
                            )}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
};
