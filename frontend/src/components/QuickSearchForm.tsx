'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type SearchTab = 'size' | 'car';

export function QuickSearchForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>('size');

  // Size search state
  const [width, setWidth] = useState('');
  const [aspectRatio, setAspectRatio] = useState('');
  const [diameter, setDiameter] = useState('');
  const [season, setSeason] = useState('');

  // Car search state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [carSeason, setCarSeason] = useState('');

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
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (year) params.set('year', year);
    if (carSeason) params.set('season', carSeason);
    params.set('tab', 'car');
    router.push(`/tyre-search?${params.toString()}`);
  };

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
                onChange={(e) => setWidth(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary"
              >
                <option value="">Оберіть</option>
                <option value="175">175</option>
                <option value="185">185</option>
                <option value="195">195</option>
                <option value="205">205</option>
                <option value="215">215</option>
                <option value="225">225</option>
                <option value="235">235</option>
                <option value="245">245</option>
                <option value="255">255</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Висота профілю</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary"
              >
                <option value="">Оберіть</option>
                <option value="40">40</option>
                <option value="45">45</option>
                <option value="50">50</option>
                <option value="55">55</option>
                <option value="60">60</option>
                <option value="65">65</option>
                <option value="70">70</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Діаметр</label>
              <select
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary"
              >
                <option value="">Оберіть</option>
                <option value="14">R14</option>
                <option value="15">R15</option>
                <option value="16">R16</option>
                <option value="17">R17</option>
                <option value="18">R18</option>
                <option value="19">R19</option>
                <option value="20">R20</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-100">Сезонність</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary"
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
              value={make}
              onChange={(e) => {
                setMake(e.target.value);
                setModel(''); // Reset model when make changes
              }}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary"
            >
              <option value="">Оберіть марку</option>
              <option value="BMW">BMW</option>
              <option value="Mercedes-Benz">Mercedes-Benz</option>
              <option value="Toyota">Toyota</option>
              <option value="Volkswagen">Volkswagen</option>
              <option value="Audi">Audi</option>
              <option value="Honda">Honda</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Kia">Kia</option>
              <option value="Mazda">Mazda</option>
              <option value="Nissan">Nissan</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Модель</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!make}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="">Оберіть модель</option>
                {make === 'BMW' && (
                  <>
                    <option value="3 Series">3 Series</option>
                    <option value="5 Series">5 Series</option>
                    <option value="X3">X3</option>
                    <option value="X5">X5</option>
                  </>
                )}
                {make === 'Mercedes-Benz' && (
                  <>
                    <option value="C-Class">C-Class</option>
                    <option value="E-Class">E-Class</option>
                    <option value="GLC">GLC</option>
                  </>
                )}
                {make === 'Toyota' && (
                  <>
                    <option value="Camry">Camry</option>
                    <option value="Corolla">Corolla</option>
                    <option value="RAV4">RAV4</option>
                  </>
                )}
                {make === 'Volkswagen' && (
                  <>
                    <option value="Golf">Golf</option>
                    <option value="Passat">Passat</option>
                    <option value="Tiguan">Tiguan</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Рік випуску</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary"
              >
                <option value="">Рік</option>
                {Array.from({ length: 15 }, (_, i) => 2024 - i).map((y) => (
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary"
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
