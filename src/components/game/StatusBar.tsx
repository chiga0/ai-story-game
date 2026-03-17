import { Card, CardContent } from '@/components/ui/card'

interface StatusBarProps {
  attributes: Record<string, number>
  relationships?: Record<string, number>
  characterNames?: Record<string, string>
}

export function StatusBar({ attributes, relationships, characterNames }: StatusBarProps) {
  const attributeLabels: Record<string, string> = {
    courage: '勇气',
    wisdom: '智慧',
    charm: '魅力',
    luck: '运气',
    health: '健康',
    sanity: '理智',
  }

  const getAttributeColor = (value: number): string => {
    if (value >= 80) return 'bg-green-500'
    if (value >= 60) return 'bg-blue-500'
    if (value >= 40) return 'bg-yellow-500'
    if (value >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <Card className="bg-gray-900/90 border-gray-700">
      <CardContent className="p-3">
        {/* 属性 */}
        <div className="space-y-2 mb-3">
          <div className="text-xs text-gray-400 uppercase tracking-wider">属性</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(attributes).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-sm text-gray-300 w-12">
                  {attributeLabels[key] || key}
                </span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getAttributeColor(value)} transition-all duration-300`}
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 关系 */}
        {relationships && Object.keys(relationships).length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 uppercase tracking-wider">关系</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(relationships).map(([charId, value]) => (
                <div
                  key={charId}
                  className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-sm"
                >
                  <span className="text-gray-300">
                    {characterNames?.[charId] || charId}
                  </span>
                  <span
                    className={`font-mono ${
                      value >= 50
                        ? 'text-green-400'
                        : value >= 0
                          ? 'text-yellow-400'
                          : 'text-red-400'
                    }`}
                  >
                    {value > 0 ? '+' : ''}
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}