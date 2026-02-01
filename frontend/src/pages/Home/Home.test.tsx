import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './Home'

describe('Home', () => {
  it('renders home page with title', () => {
    render(<Home />)
    expect(screen.getByText('MasterChef')).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<Home />)
    expect(screen.getByText('Welcome to MasterChef')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<Home />)
    expect(screen.getByText('Get Started')).toBeInTheDocument()
    expect(screen.getByText('Learn More')).toBeInTheDocument()
  })
})
