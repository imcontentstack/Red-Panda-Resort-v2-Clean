import { useEffect, useRef } from 'react';

export default function TypingIndicator({ isTyping }) {
    const dotsRef = useRef([]);

    useEffect(() => {
        if (!isTyping) {
            dotsRef.current.forEach(dot => dot.classList.remove('animate-bounce'));
        } else {
            dotsRef.current.forEach((dot, i) => {
                dot.classList.add('animate-bounce');
                dot.style.animationDelay = `${i * 0.2}s`;
            });
        }
    }, [isTyping]);

    return (
        <div className="flex space-x-1 items-center h-4">
            {[0, 1, 2].map((_, i) => (
                <span
                    key={i}
                    ref={el => (dotsRef.current[i] = el)}
                    className="w-1 h-1 bg-gray-500 rounded-full"
                />
            ))}
        </div>
    );
}