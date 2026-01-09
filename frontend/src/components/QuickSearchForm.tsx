'use client';

import { useState } from 'react';

type SearchTab = 'size' | 'car';

export function QuickSearchForm() {
  const [activeTab, setActiveTab] = useState<SearchTab>('size');

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 text-zinc-50 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
      <h2 className="text-xl font-semibold">Швидкий пошук шин</h2>
      <p className="mt-1 text-sm text-zinc-100">
        Виберіть спосіб пошуку: за розміром або за вашим автомобілем.
      </p>

      <div className="mt-4 flex rounded-full bg-zinc-800 p-1 text-sm font-medium ring-1 ring-zinc-700">
        <button
          type="button"
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
        <form className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Ширина</label>
              <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                <option value="">Оберіть</option>
                <option>195</option>
                <option>205</option>
                <option>215</option>
                <option>225</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Висота профілю</label>
              <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                <option value="">Оберіть</option>
                <option>55</option>
                <option>60</option>
                <option>65</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Діаметр</label>
              <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                <option value="">Оберіть</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-100">Сезонність</label>
            <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
              <option value="">Не важливо</option>
              <option>Літні</option>
              <option>Зимові</option>
              <option>Всесезонні</option>
            </select>
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-full bg-zinc-50 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white"
          >
            Знайти шини
          </button>
          <p className="text-xs text-muted-foreground">
            Пізніше пошук буде підключено до каталогу шин Bridgestone.
          </p>
        </form>
      ) : (
        <form className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-100">Марка авто</label>
            <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
              <option value="">Оберіть марку</option>
              <option>BMW</option>
              <option>Mercedes-Benz</option>
              <option>Toyota</option>
              <option>Volkswagen</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Модель</label>
              <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                <option value="">Оберіть модель</option>
                <option>3 Series</option>
                <option>C-Class</option>
                <option>Corolla</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-100">Рік випуску</label>
              <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                <option value="">Рік</option>
                <option>2015</option>
                <option>2018</option>
                <option>2020</option>
                <option>2023</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-100">Тип шини</label>
            <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
              <option>Не важливо</option>
              <option>Літня</option>
              <option>Зимова</option>
              <option>Всесезонна</option>
            </select>
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-full bg-zinc-50 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white"
          >
            Підібрати шини
          </button>
          <p className="text-xs text-muted-foreground">
            У продакшн-версії результат буде сформовано на основі бази авто та
            рекомендованих типорозмірів Bridgestone.
          </p>
        </form>
      )}
    </div>
  );
}
