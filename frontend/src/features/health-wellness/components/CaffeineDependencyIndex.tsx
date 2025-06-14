'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface DrinkItem {
  name: string;
  amount: string;
  time: string;
}

export default function CaffeineDependencyIndex() {
  const [drinks, setDrinks] = useState<DrinkItem[]>([{ name: '', amount: '', time: '' }]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addDrink = () => {
    setDrinks([...drinks, { name: '', amount: '', time: '' }]);
  };

  const removeDrink = (index: number) => {
    if (drinks.length > 1) {
      setDrinks(drinks.filter((_, i) => i !== index));
    }
  };

  const updateDrink = (index: number, field: keyof DrinkItem, value: string) => {
    const newDrinks = [...drinks];
    newDrinks[index][field] = value;
    setDrinks(newDrinks);
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const consumptionDetails = drinks
        .filter(drink => drink.name.trim())
        .map(drink => `${drink.name}${drink.amount ? ` (${drink.amount})` : ''}${drink.time ? ` - ${drink.time}` : ''}`)
        .join('\n');

      if (!consumptionDetails.trim()) {
        alert('请至少添加一种饮品');
        return;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'caffeine-dependency-index',
          messages: [
            {
              role: 'user',
              content: `请帮我分析一下咖啡因依赖指数。

我的饮品消费情况：
${consumptionDetails}

补充信息：${additionalInfo || '无其他信息'}`
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('分析失败');
      }

      const data = await response.json();
      setResult(data.assistantMessage);
    } catch (error) {
      console.error('Error:', error);
      setResult('分析过程中出现错误，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">☕ 咖啡因依赖指数</h1>
        <p className="text-muted-foreground">
          计算您的每日咖啡因摄入量和依赖程度
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>饮品记录</CardTitle>
            <CardDescription>
              记录您今天喝的含咖啡因饮品
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {drinks.map((drink, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">饮品 {index + 1}</Label>
                  {drinks.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDrink(index)}
                    >
                      删除
                    </Button>
                  )}
                </div>
                <div className="grid gap-2">
                  <Input
                    placeholder="饮品名称 (如：美式咖啡、奶茶、红牛)"
                    value={drink.name}
                    onChange={(e) => updateDrink(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="分量 (如：大杯、500ml、2杯)"
                    value={drink.amount}
                    onChange={(e) => updateDrink(index, 'amount', e.target.value)}
                  />
                  <Input
                    placeholder="时间 (如：上午9点、下午3点)"
                    value={drink.time}
                    onChange={(e) => updateDrink(index, 'time', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addDrink} className="w-full">
              + 添加饮品
            </Button>

            <div className="space-y-2">
              <Label htmlFor="additional-info">补充信息（可选）</Label>
              <Textarea
                id="additional-info"
                placeholder="如：年龄、体重、是否孕妇、睡眠质量、是否有心脏病等健康状况..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  分析中...
                </>
              ) : (
                '开始分析'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>分析结果</CardTitle>
            <CardDescription>
              您的咖啡因依赖指数和健康建议
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-4xl mb-4">☕</div>
                <p>填写您的饮品记录，开始分析咖啡因依赖指数</p>
                <div className="mt-4 text-xs space-y-1">
                  <p>💡 常见饮品参考：</p>
                  <p>美式咖啡(中杯) ≈ 150mg咖啡因</p>
                  <p>奶茶(大杯) ≈ 80mg咖啡因</p>
                  <p>红牛(250ml) ≈ 80mg咖啡因</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
