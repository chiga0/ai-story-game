import { describe, it, expect } from 'vitest'
import { SYSTEM_PROMPTS, DIALOGUE_TEMPLATES, buildPrompt } from '../../../src/lib/ai/prompts'

describe('AI Prompts', () => {
  describe('SYSTEM_PROMPTS', () => {
    it('should have gameMaster prompt', () => {
      expect(SYSTEM_PROMPTS.gameMaster).toBeDefined()
      expect(typeof SYSTEM_PROMPTS.gameMaster).toBe('string')
      expect(SYSTEM_PROMPTS.gameMaster.length).toBeGreaterThan(0)
    })

    it('should have npc prompt generator', () => {
      const prompt = SYSTEM_PROMPTS.npc('管家亨利', '忠诚、严肃')
      expect(prompt).toContain('管家亨利')
      expect(prompt).toContain('忠诚、严肃')
    })

    it('should have enhanceStory prompt', () => {
      expect(SYSTEM_PROMPTS.enhanceStory).toBeDefined()
      expect(typeof SYSTEM_PROMPTS.enhanceStory).toBe('string')
    })
  })

  describe('DIALOGUE_TEMPLATES', () => {
    it('should have sceneDescription template', () => {
      const template = DIALOGUE_TEMPLATES.sceneDescription('庄园大厅', '神秘')
      expect(template).toContain('庄园大厅')
      expect(template).toContain('神秘')
    })

    it('should have choiceGeneration template', () => {
      const template = DIALOGUE_TEMPLATES.choiceGeneration('测试情境', 3)
      expect(template).toContain('测试情境')
      expect(template).toContain('3')
    })

    it('should have endingCheck template', () => {
      const template = DIALOGUE_TEMPLATES.endingCheck({ courage: 50 })
      expect(template).toContain('courage')
    })
  })

  describe('buildPrompt', () => {
    it('should replace variables in template', () => {
      const template = 'Hello, {{name}}! Welcome to {{place}}.'
      const result = buildPrompt(template, { name: '玩家', place: '庄园' })
      
      expect(result).toBe('Hello, 玩家! Welcome to 庄园.')
    })

    it('should handle multiple occurrences', () => {
      const template = '{{name}} says: {{name}} is happy.'
      const result = buildPrompt(template, { name: 'Alice' })
      
      expect(result).toBe('Alice says: Alice is happy.')
    })

    it('should not modify template without variables', () => {
      const template = 'No variables here.'
      const result = buildPrompt(template, { name: 'test' })
      
      expect(result).toBe('No variables here.')
    })

    it('should handle empty variables', () => {
      const template = 'Test template'
      const result = buildPrompt(template, {})
      
      expect(result).toBe('Test template')
    })

    it('should preserve unmatched placeholders', () => {
      const template = 'Hello {{name}}, {{unknown}}'
      const result = buildPrompt(template, { name: 'World' })
      
      expect(result).toBe('Hello World, {{unknown}}')
    })
  })
})