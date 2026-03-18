/**
 * 剧本生成器测试
 */

import { describe, it, expect, vi } from 'vitest'
import {
  validateOptions,
  getEstimatedTime,
  THEME_CONFIG,
  DIFFICULTY_CONFIG,
  DURATION_CONFIG,
  type ScriptGeneratorOptions,
} from '#/lib/ai/script-generator'

describe('ScriptGenerator', () => {
  describe('validateOptions', () => {
    it('should return no errors for valid options', () => {
      const options: ScriptGeneratorOptions = {
        theme: 'mystery',
        difficulty: 'normal',
        duration: 'medium',
      }
      const errors = validateOptions(options)
      expect(errors).toHaveLength(0)
    })

    it('should return error for invalid theme', () => {
      const options = {
        theme: 'invalid',
        difficulty: 'normal',
        duration: 'medium',
      } as unknown as ScriptGeneratorOptions
      const errors = validateOptions(options)
      expect(errors).toContain('无效的主题类型')
    })

    it('should return error for invalid difficulty', () => {
      const options = {
        theme: 'mystery',
        difficulty: 'invalid',
        duration: 'medium',
      } as unknown as ScriptGeneratorOptions
      const errors = validateOptions(options)
      expect(errors).toContain('无效的难度等级')
    })

    it('should return error for invalid duration', () => {
      const options = {
        theme: 'mystery',
        difficulty: 'normal',
        duration: 'invalid',
      } as unknown as ScriptGeneratorOptions
      const errors = validateOptions(options)
      expect(errors).toContain('无效的时长设置')
    })

    it('should return error when customElements exceeds 5', () => {
      const options: ScriptGeneratorOptions = {
        theme: 'mystery',
        difficulty: 'normal',
        duration: 'medium',
        customElements: ['a', 'b', 'c', 'd', 'e', 'f'],
      }
      const errors = validateOptions(options)
      expect(errors).toContain('自定义元素不能超过 5 个')
    })
  })

  describe('getEstimatedTime', () => {
    it('should return base time for normal settings', () => {
      const options: ScriptGeneratorOptions = {
        theme: 'mystery',
        difficulty: 'normal',
        duration: 'medium',
      }
      const time = getEstimatedTime(options)
      expect(time).toBe(45) // 45 * 1.0 * 1.0
    })

    it('should return shorter time for easy difficulty and short duration', () => {
      const options: ScriptGeneratorOptions = {
        theme: 'mystery',
        difficulty: 'easy',
        duration: 'short',
      }
      const time = getEstimatedTime(options)
      expect(time).toBe(25) // 45 * 0.7 * 0.8
    })

    it('should return longer time for hard difficulty and long duration', () => {
      const options: ScriptGeneratorOptions = {
        theme: 'mystery',
        difficulty: 'hard',
        duration: 'long',
      }
      const time = getEstimatedTime(options)
      expect(time).toBe(88) // 45 * 1.5 * 1.3 ≈ 88
    })
  })

  describe('THEME_CONFIG', () => {
    it('should have all required themes', () => {
      const themes = ['mystery', 'fantasy', 'scifi', 'horror', 'romance', 'adventure']
      themes.forEach((theme) => {
        expect(THEME_CONFIG).toHaveProperty(theme)
      })
    })

    it('should have required properties for each theme', () => {
      Object.entries(THEME_CONFIG).forEach(([key, config]) => {
        expect(config).toHaveProperty('name')
        expect(config).toHaveProperty('description')
        expect(config).toHaveProperty('icon')
        expect(config).toHaveProperty('defaultElements')
      })
    })
  })

  describe('DIFFICULTY_CONFIG', () => {
    it('should have all difficulty levels', () => {
      expect(DIFFICULTY_CONFIG).toHaveProperty('easy')
      expect(DIFFICULTY_CONFIG).toHaveProperty('normal')
      expect(DIFFICULTY_CONFIG).toHaveProperty('hard')
    })

    it('should have increasing choices per scene', () => {
      expect(DIFFICULTY_CONFIG.easy.choicesPerScene).toBeLessThan(
        DIFFICULTY_CONFIG.normal.choicesPerScene
      )
      expect(DIFFICULTY_CONFIG.normal.choicesPerScene).toBeLessThan(
        DIFFICULTY_CONFIG.hard.choicesPerScene
      )
    })
  })

  describe('DURATION_CONFIG', () => {
    it('should have all duration options', () => {
      expect(DURATION_CONFIG).toHaveProperty('short')
      expect(DURATION_CONFIG).toHaveProperty('medium')
      expect(DURATION_CONFIG).toHaveProperty('long')
    })

    it('should have increasing scene counts', () => {
      expect(DURATION_CONFIG.short.sceneCount.max).toBeLessThan(DURATION_CONFIG.medium.sceneCount.min)
      expect(DURATION_CONFIG.medium.sceneCount.max).toBeLessThan(DURATION_CONFIG.long.sceneCount.min)
    })
  })
})