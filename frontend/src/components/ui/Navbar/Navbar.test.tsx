import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from './Navbar'

describe('Navbar', () => {
  it('renders navigation', () => {
    render(<Navbar />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('toggles theme on button click', () => {
    render(<Navbar />)
    const themeButton = screen.getByText('🌙')
    fireEvent.click(themeButton)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
