'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from '@/lib/utils';
import { AlertTriangle, Check, ChevronsUpDown, Loader2, Sparkles } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CityInfo {
  city: string;
  cityid: string;
}

interface WeatherApiResponse {
  code: string;
  message: string;
  value: Array<{
    city: string;
    cityid: string;
    weather: string;
    temp?: string;
    WD?: string;
    WS?: string;
    sd?: string; // 湿度
    aqi?: string;
    // ... other potential fields from Meizu API
  }>;
}

const WeatherMoodLink: React.FC = () => {
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [moodAnalysis, setMoodAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await fetch('/data/Meizu_cities.json');
        if (!response.ok) {
          throw new Error('Failed to load city data.');
        }
        const data = await response.json();
        if (data && data.cities) {
          setCities(data.cities);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load cities.');
      }
      setIsLoadingCities(false);
    };
    fetchCities();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedCityId) {
      setError('请选择一个城市！');
      setMoodAnalysis('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMoodAnalysis('');

    try {
      // Step 1: REMOVED - Frontend no longer fetches weather directly.
      // The backend /api/chat endpoint for 'weather-mood-link' will handle it.

      // Step 2: Send selectedCityId to our backend for mood analysis
      // The backend will use this cityId to fetch weather and then perform AI analysis.
      const apiChatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: selectedCityId }], // Send only the cityId
          toolId: 'weather-mood-link',
        }),
      });

      if (!apiChatResponse.ok) {
        const errorData = await apiChatResponse.json().catch(() => ({ message: '天气心情分析仪服务暂时不可用。' }));
        throw new Error(errorData.message || `HTTP error! status: ${apiChatResponse.status}`);
      }

      const data = await apiChatResponse.json();
      if (data && data.assistantMessage) {
        setMoodAnalysis(data.assistantMessage);
      } else {
        throw new Error('AI返回的分析结果格式不正确。');
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '分析天气与心情时发生未知错误。';
      setError(errorMessage);
      console.error("Error in handleSubmit for WeatherMoodLink:", errorMessage, e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCityId]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="sun behind cloud" className="mr-2 text-4xl">🌤️</span>
          天气心情关联分析
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          选择城市，让AI结合实时天气分析它对你工作心情的微妙影响！
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div>
          <label htmlFor="city-combobox-trigger" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            选择城市 <span className="text-red-500">*</span>
          </label>
          {isLoadingCities ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>正在加载城市列表...</span>
            </div>
          ) : cities.length > 0 ? (
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  id="city-combobox-trigger"
                  className="w-full justify-between bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                >
                  {selectedCityId
                    ? cities.find((city) => city.cityid === selectedCityId)?.city
                    : "请选择一个城市"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-60 overflow-y-auto">
                <Command>
                  <CommandInput placeholder="搜索城市..." />
                  <CommandList>
                    <CommandEmpty>未找到城市。</CommandEmpty>
                    <CommandGroup>
                      {cities.map((city) => (
                        <CommandItem
                          key={city.cityid}
                          value={city.city}
                          onSelect={(selectedCityName) => {
                            const cityObject = cities.find(c => c.city === selectedCityName);
                            if (cityObject) {
                              setSelectedCityId(cityObject.cityid);
                            } else {
                              setSelectedCityId('');
                            }
                            setComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCityId === city.cityid ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {city.city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <p className="text-red-500">无法加载城市列表。请确保 `public/data/Meizu_cities.json` 文件存在且格式正确。</p>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={isLoading || isLoadingCities || !selectedCityId} className="w-full">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> AI正在感知天气与心情...
            </>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> 分析心情
            </>
          )}
        </Button>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {moodAnalysis && !isLoading && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-center text-sky-700 dark:text-sky-300">AI心情洞察：</h3>
            <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{moodAnalysis}</ReactMarkdown>
            </div>
          </div>
        )}
         {isLoading && !moodAnalysis && !error && (
          <div className="text-center py-6 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400">AI正在结合实时天气进行分析，请稍候...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherMoodLink;
