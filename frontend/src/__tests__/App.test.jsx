import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import React from 'react';

// Mock browser APIs
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock geolocation
global.navigator.geolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn()
};

describe('RakshakPath Frontend Interactions', () => {
  it('should render the Auth Wall securely on first load', () => {
    // Reset local storage
    localStorage.clear();
    
    render(<App />);
    const loginHeader = screen.getByText(/LOGIN TO PROCEED/i);
    expect(loginHeader).toBeInTheDocument();
  });

  it('should maintain user session if localStorage is populated', () => {
    localStorage.setItem('rakshak_user', JSON.stringify({ name: 'TestUser' }));
    
    render(<App />);
    const headerTitle = screen.getByText(/RAKSHAKPATH/i);
    expect(headerTitle).toBeInTheDocument();
    expect(screen.queryByText(/LOGIN TO PROCEED/i)).not.toBeInTheDocument();
  });

});
