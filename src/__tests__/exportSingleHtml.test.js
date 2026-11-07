import { describe, it, expect } from 'vitest'
import { generateSingleHtml } from '../utils/exportSingleHtml'

describe('generateSingleHtml', () => {
  it('generates a valid HTML5 document string', () => {
    const card = {
      recipientName: 'Aarav',
      senderName: 'Meera',
      message: 'Happy Diwali with light and joy!',
      targetDate: '2026-11-08T18:00:00',
      tagline: 'Illuminating your world',
      photos: [],
      scrapbookPages: [],
    }

    const html = generateSingleHtml(card)
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Aarav')
    expect(html).toContain('Meera')
    expect(html).toContain('Happy Diwali with light and joy!')
    expect(html).toContain('scroll-progress')
    expect(html).toContain('Light a Diya for Us')
    expect(html).toContain('This Diwali, my favourite')
    expect(html).toContain('Open Your Surprise')
  })
})

