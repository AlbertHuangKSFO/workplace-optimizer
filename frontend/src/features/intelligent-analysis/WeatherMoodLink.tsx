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
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { AlertTriangle, Check, ChevronsUpDown, Loader2, Sparkles } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface WeatherMoodLinkProps {
  locale?: ValidLocale;
}

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

const WeatherMoodLink: React.FC<WeatherMoodLinkProps> = ({ locale = 'zh-CN' }) => {
  const { t, loading: translationsLoading } = useTranslations(locale);

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
      setError(t('weatherMoodLink.selectCityError'));
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
          language: locale
        }),
      });

      if (!apiChatResponse.ok) {
        const errorData = await apiChatResponse.json().catch(() => ({ message: t('weatherMoodLink.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${apiChatResponse.status}`);
      }

      const data = await apiChatResponse.json();
      if (data && data.assistantMessage) {
        setMoodAnalysis(data.assistantMessage);
      } else {
        throw new Error(t('weatherMoodLink.formatError'));
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : t('weatherMoodLink.unknownError');
      setError(errorMessage);
      console.error("Error in handleSubmit for WeatherMoodLink:", errorMessage, e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCityId, t, locale]);

  // 如果翻译还在加载，显示加载器
  if (translationsLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="sun behind cloud" className="mr-2 text-4xl">🌤️</span>
          {t('weatherMoodLink.title')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('weatherMoodLink.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div>
          <label htmlFor="city-combobox-trigger" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('weatherMoodLink.selectCityLabel')} <span className="text-red-500">*</span>
          </label>
          {isLoadingCities ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t('weatherMoodLink.loadingCities')}</span>
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
                    : t('weatherMoodLink.selectCityPlaceholder')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-60 overflow-y-auto">
                <Command>
                  <CommandInput placeholder={t('weatherMoodLink.searchCityPlaceholder')} />
                  <CommandList>
                    <CommandEmpty>{t('weatherMoodLink.cityNotFound')}</CommandEmpty>
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
            <p className="text-red-500">{t('weatherMoodLink.loadCityError')}</p>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={isLoading || isLoadingCities || !selectedCityId} className="w-full">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('weatherMoodLink.analyzing')}
            </>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> {t('weatherMoodLink.analyzeMoodButton')}
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
            <h3 className="text-lg font-semibold mb-2 text-center text-sky-700 dark:text-sky-300">{t('weatherMoodLink.resultTitle')}</h3>
            <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{moodAnalysis}</ReactMarkdown>
            </div>
          </div>
        )}
         {isLoading && !moodAnalysis && !error && (
          <div className="text-center py-6 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400">{t('weatherMoodLink.loadingMessage')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherMoodLink;
