'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Ruler, Car, Filter, ChevronRight } from 'lucide-react';

type SearchTab = 'size' | 'car';

interface SizeOption {
  value: number;
  count: number;
}

interface BrandOption {
  id: number;
  name: string;
}

interface ModelOption {
  id: number;
  name: string;
}

export function QuickSearchForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>('size');

  // Size search state
  const [width, setWidth] = useState('');
  const [aspectRatio, setAspectRatio] = useState('');
  const [diameter, setDiameter] = useState('');
  const [season, setSeason] = useState('');

  // Size options (fetched from API)
  const [widths, setWidths] = useState<SizeOption[]>([]);
  const [heights, setHeights] = useState<SizeOption[]>([]);
  const [diameters, setDiameters] = useState<SizeOption[]>([]);
  const [loadingWidths, setLoadingWidths] = useState(true);
  const [loadingHeights, setLoadingHeights] = useState(false);
  const [loadingDiameters, setLoadingDiameters] = useState(false);

  // Car search state
  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [year, setYear] = useState('');
  const [carSeason, setCarSeason] = useState('');

  // Car options (fetched from API)
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);

  // Search loading state
  const [isSearching, setIsSearching] = useState(false);

  // Fetch widths on mount
  useEffect(() => {
    async function fetchWidths() {
      try {
        const res = await fetch('/api/tyres/sizes?type=width');
        const data = await res.json();
        setWidths(data.data || []);
      } catch (error) {
        console.error('Error fetching widths:', error);
      } finally {
        setLoadingWidths(false);
      }
    }
    fetchWidths();
  }, []);

  // Fetch heights when width changes
  useEffect(() => {
    if (!width) {
      setHeights([]);
      setAspectRatio('');
      return;
    }

    async function fetchHeights() {
      setLoadingHeights(true);
      try {
        const res = await fetch(`/api/tyres/sizes?type=height&width=${width}`);
        const data = await res.json();
        setHeights(data.data || []);
      } catch (error) {
        console.error('Error fetching heights:', error);
      } finally {
        setLoadingHeights(false);
      }
    }
    fetchHeights();
  }, [width]);

  // Fetch diameters when height changes
  useEffect(() => {
    if (!width || !aspectRatio) {
      setDiameters([]);
      setDiameter('');
      return;
    }

    async function fetchDiameters() {
      setLoadingDiameters(true);
      try {
        const res = await fetch(`/api/tyres/sizes?type=diameter&width=${width}&height=${aspectRatio}`);
        const data = await res.json();
        setDiameters(data.data || []);
      } catch (error) {
        console.error('Error fetching diameters:', error);
      } finally {
        setLoadingDiameters(false);
      }
    }
    fetchDiameters();
  }, [width, aspectRatio]);

  // Fetch brands on mount
  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await fetch('/api/vehicles/brands');
        const data = await res.json();
        setBrands(data.data || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoadingBrands(false);
      }
    }
    fetchBrands();
  }, []);

  // Fetch models when brand changes
  useEffect(() => {
    if (!brandId) {
      setModels([]);
      setModelId('');
      setYears([]);
      setYear('');
      return;
    }

    async function fetchModels() {
      setLoadingModels(true);
      try {
        const res = await fetch(`/api/vehicles/models?brandId=${brandId}`);
        const data = await res.json();
        setModels(data.data || []);
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        setLoadingModels(false);
      }
    }
    fetchModels();
  }, [brandId]);

  // Fetch years when model changes
  useEffect(() => {
    if (!modelId) {
      setYears([]);
      setYear('');
      return;
    }

    async function fetchYears() {
      setLoadingYears(true);
      try {
        const res = await fetch(`/api/vehicles/years?modelId=${modelId}`);
        const data = await res.json();
        setYears(data.data || []);
      } catch (error) {
        console.error('Error fetching years:', error);
      } finally {
        setLoadingYears(false);
      }
    }
    fetchYears();
  }, [modelId]);

  const handleSizeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const params = new URLSearchParams();
    if (width) params.set('width', width);
    if (aspectRatio) params.set('aspectRatio', aspectRatio);
    if (diameter) params.set('diameter', diameter);
    if (season) params.set('season', season);
    router.push(`/tyre-search?${params.toString()}`);
  };

  const handleCarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const params = new URLSearchParams();
    const selectedBrand = brands.find(b => b.id === parseInt(brandId));
    const selectedModel = models.find(m => m.id === parseInt(modelId));
    if (selectedBrand) params.set('make', selectedBrand.name);
    if (selectedModel) params.set('model', selectedModel.name);
    if (year) params.set('year', year);
    if (carSeason) params.set('season', carSeason);
    params.set('tab', 'car');
    router.push(`/tyre-search?${params.toString()}`);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveTab(prev => prev === 'size' ? 'car' : 'size');
    }
  };

  // Styles matching tyre-search page (always dark)
  const cardClass = "rounded-2xl border border-stone-800 bg-stone-900/95 p-6 text-stone-50 shadow-[0_18px_40px_rgba(0,0,0,0.45)]";
  const labelClass = "mb-2 block text-sm font-medium text-stone-100";
  const inputClass = "w-full appearance-none rounded-xl border border-stone-700 bg-stone-900 py-3 pl-10 pr-8 text-sm text-stone-50 outline-none focus:border-primary";
  const buttonClass = "w-full rounded-full bg-white py-3 text-base font-semibold text-stone-900 shadow-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const loadingClass = "flex h-12 w-full items-center justify-center rounded-xl border border-stone-700 bg-stone-900";

  return (
    <div className={cardClass}>
      <h2 className="text-xl font-semibold text-stone-50">Знайдіть ідеальні шини</h2>
      <p className="mt-1 text-sm text-stone-400">
        За розміром на боковині шини або за маркою вашого авто
      </p>

      <div
        role="tablist"
        aria-label="Спосіб пошуку шин"
        className="mt-4 inline-flex rounded-full bg-stone-800 p-1 ring-1 ring-stone-700"
      >
        <button
          type="button"
          role="tab"
          id="size-tab"
          tabIndex={activeTab === 'size' ? 0 : -1}
          aria-selected={activeTab === 'size'}
          aria-controls="size-panel"
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'size'
              ? 'bg-stone-50 text-stone-900'
              : 'text-stone-300 hover:text-stone-50'
          }`}
          onClick={() => setActiveTab('size')}
          onKeyDown={handleTabKeyDown}
        >
          <Ruler className="h-4 w-4" aria-hidden="true" />
          За розміром
        </button>
        <button
          type="button"
          role="tab"
          id="car-tab"
          tabIndex={activeTab === 'car' ? 0 : -1}
          aria-selected={activeTab === 'car'}
          aria-controls="car-panel"
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'car'
              ? 'bg-stone-50 text-stone-900'
              : 'text-stone-300 hover:text-stone-50'
          }`}
          onClick={() => setActiveTab('car')}
          onKeyDown={handleTabKeyDown}
        >
          <Car className="h-4 w-4" aria-hidden="true" />
          За авто
        </button>
      </div>

      {activeTab === 'size' ? (
        <form
          id="size-panel"
          role="tabpanel"
          aria-labelledby="size-tab"
          className="mt-6 space-y-4"
          onSubmit={handleSizeSearch}
        >
          <p className="mb-4 text-xs text-stone-400">Наприклад: 205/55 R16 — знайдіть на боковині шини</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Ширина</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                {loadingWidths ? (
                  <div className={loadingClass}>
                    <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                  </div>
                ) : (
                  <select
                    value={width}
                    onChange={(e) => {
                      setWidth(e.target.value);
                      setAspectRatio('');
                      setDiameter('');
                    }}
                    className={inputClass}
                  >
                    <option value="">Ширина</option>
                    {widths.map((w) => (
                      <option key={w.value} value={w.value}>{w.value}</option>
                    ))}
                  </select>
                )}
                <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-stone-500" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Профіль</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                {loadingHeights ? (
                  <div className={loadingClass}>
                    <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                  </div>
                ) : (
                  <select
                    value={aspectRatio}
                    onChange={(e) => {
                      setAspectRatio(e.target.value);
                      setDiameter('');
                    }}
                    disabled={!width}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <option value="">Профіль</option>
                    {heights.map((h) => (
                      <option key={h.value} value={h.value}>{h.value}</option>
                    ))}
                  </select>
                )}
                <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-stone-500" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Діаметр</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                {loadingDiameters ? (
                  <div className={loadingClass}>
                    <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                  </div>
                ) : (
                  <select
                    value={diameter}
                    onChange={(e) => setDiameter(e.target.value)}
                    disabled={!aspectRatio}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <option value="">Діаметр</option>
                    {diameters.map((d) => (
                      <option key={d.value} value={d.value}>R{d.value}</option>
                    ))}
                  </select>
                )}
                <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-stone-500" />
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Сезонність</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className={inputClass}
              >
                <option value="">Не важливо</option>
                <option value="summer">Літні</option>
                <option value="winter">Зимові</option>
                <option value="all-season">Всесезонні</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-stone-500" />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className={buttonClass}
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Пошук...
              </>
            ) : (
              'Знайти шини'
            )}
          </button>
        </form>
      ) : (
        <form
          id="car-panel"
          role="tabpanel"
          aria-labelledby="car-tab"
          className="mt-6 space-y-4"
          onSubmit={handleCarSearch}
        >
          <div>
            <label className={labelClass}>Марка авто</label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
              {loadingBrands ? (
                <div className={loadingClass}>
                  <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                </div>
              ) : (
                <select
                  value={brandId}
                  onChange={(e) => {
                    setBrandId(e.target.value);
                    setModelId('');
                    setYear('');
                  }}
                  className={inputClass}
                >
                  <option value="">Оберіть марку</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              )}
              <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-stone-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Модель</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                {loadingModels ? (
                  <div className={loadingClass}>
                    <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                  </div>
                ) : (
                  <select
                    value={modelId}
                    onChange={(e) => {
                      setModelId(e.target.value);
                      setYear('');
                    }}
                    disabled={!brandId}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <option value="">Модель</option>
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                )}
                <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-stone-500" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Рік</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                {loadingYears ? (
                  <div className={loadingClass}>
                    <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                  </div>
                ) : (
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    disabled={!modelId}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <option value="">Рік</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                )}
                <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-stone-500" />
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Тип шини</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
              <select
                value={carSeason}
                onChange={(e) => setCarSeason(e.target.value)}
                className={inputClass}
              >
                <option value="">Не важливо</option>
                <option value="summer">Літня</option>
                <option value="winter">Зимова</option>
                <option value="all-season">Всесезонна</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-stone-500" />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className={buttonClass}
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Пошук...
              </>
            ) : (
              'Підібрати шини'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
