// src/components/ThemeToggle.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Cambiar tema"
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}

export default ThemeToggle;