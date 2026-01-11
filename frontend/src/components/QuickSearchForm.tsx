'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    const params = new URLSearchParams();
    if (width) params.set('width', width);
    if (aspectRatio) params.set('aspectRatio', aspectRatio);
    if (diameter) params.set('diameter', diameter);
    if (season) params.set('season', season);
    router.push(`/tyre-search?${params.toString()}`);
  };

  const handleCarSearch = (e: React.FormEvent) => {
    e.preventDefault();
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

  const selectClasses = "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary disabled:opacity-50";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 text-zinc-50 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
      <h2 className="text-xl font-semibold">Швидкий пошук шин</h2>
      <p className="mt-1 text-sm text-zinc-100">
        Виберіть спосіб пошуку: за розміром або за вашим автомобілем.
      </p>

      <div
        role="tablist"
        aria-label="Спосіб пошуку шин"
        className="mt-4 flex rounded-full bg-zinc-800 p-1 text-sm font-medium ring-1 ring-zinc-700"
      >
        <button
          type="button"
          role="tab"
          id="size-tab"
          aria-selected={activeTab === 'size'}
          aria-controls="size-panel"
          className={`flex-1 rounded-full px-4 py-2 transition-colors ${
            activeTab === 'size'
              ? 'bg-zinc-50 text-zinc-900'
              : 'text-zinc-300 hover:text-zinc-50'
          }`}
          onClick={() => setActiveTab('size')}
        >
          За розміром
        </button>
        <button
          type="button"
          role="tab"
          id="car-tab"
          aria-selected={activeTab === 'car'}
          aria-controls="car-panel"
          className={`flex-1 rounded-full px-4 py-2 transition-colors ${
            activeTab === 'car'
              ? 'bg-zinc-50 text-zinc-900'
              : 'text-zinc-300 hover:text-zinc-50'
          }`}
          onClick={() => setActiveTab('car')}
        >
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Ширина</label>
              <select
                value={width}
                onChange={(e) => {
                  setWidth(e.target.value);
                  setAspectRatio('');
                  setDiameter('');
                }}
                disabled={loadingWidths}
                className={selectClasses}
              >
                <option value="">{loadingWidths ? 'Завантаження...' : 'Оберіть'}</option>
                {widths.map((w) => (
                  <option key={w.value} value={w.value}>{w.value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Висота профілю</label>
              <select
                value={aspectRatio}
                onChange={(e) => {
                  setAspectRatio(e.target.value);
                  setDiameter('');
                }}
                disabled={!width || loadingHeights}
                className={selectClasses}
              >
                <option value="">{loadingHeights ? 'Завантаження...' : 'Оберіть'}</option>
                {heights.map((h) => (
                  <option key={h.value} value={h.value}>{h.value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Діаметр</label>
              <select
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                disabled={!aspectRatio || loadingDiameters}
                className={selectClasses}
              >
                <option value="">{loadingDiameters ? 'Завантаження...' : 'Оберіть'}</option>
                {diameters.map((d) => (
                  <option key={d.value} value={d.value}>R{d.value}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-100">Сезонність</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className={selectClasses}
            >
              <option value="">Не важливо</option>
              <option value="summer">Літні</option>
              <option value="winter">Зимові</option>
              <option value="all-season">Всесезонні</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-zinc-50 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white"
          >
            Знайти шини
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
            <label className="mb-1 block text-sm font-medium text-zinc-100">Марка авто</label>
            <select
              value={brandId}
              onChange={(e) => {
                setBrandId(e.target.value);
                setModelId('');
                setYear('');
              }}
              disabled={loadingBrands}
              className={selectClasses}
            >
              <option value="">{loadingBrands ? 'Завантаження...' : 'Оберіть марку'}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Модель</label>
              <select
                value={modelId}
                onChange={(e) => {
                  setModelId(e.target.value);
                  setYear('');
                }}
                disabled={!brandId || loadingModels}
                className={selectClasses}
              >
                <option value="">{loadingModels ? 'Завантаження...' : 'Оберіть модель'}</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Рік випуску</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={!modelId || loadingYears}
                className={selectClasses}
              >
                <option value="">{loadingYears ? 'Завантаження...' : 'Рік'}</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-100">Тип шини</label>
            <select
              value={carSeason}
              onChange={(e) => setCarSeason(e.target.value)}
              className={selectClasses}
            >
              <option value="">Не важливо</option>
              <option value="summer">Літня</option>
              <option value="winter">Зимова</option>
              <option value="all-season">Всесезонна</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-zinc-50 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white"
          >
            Підібрати шини
          </button>
        </form>
      )}
    </div>
  );
}
