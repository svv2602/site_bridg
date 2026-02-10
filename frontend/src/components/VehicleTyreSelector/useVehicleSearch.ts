"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  CarBrand,
  CarModel,
  CarKit,
  VehicleSearchResult,
} from "@/lib/types/vehicles";

// Generic data fetching hook
function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json.data);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Помилка завантаження даних");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

export interface UseVehicleSearchProps {
  initialMake?: string;
  initialModel?: string;
  initialYear?: string;
  initialKit?: string;
  initialSeason?: string;
}

export interface UseVehicleSearchReturn {
  // Selection state
  brandId: string;
  setBrandId: (id: string) => void;
  modelId: string;
  setModelId: (id: string) => void;
  year: string;
  setYear: (year: string) => void;
  kitId: string;
  setKitId: (id: string) => void;
  season: string;
  setSeason: (season: string) => void;

  // Data from API
  brands: CarBrand[] | null;
  models: CarModel[] | null;
  years: number[] | null;
  kits: CarKit[] | null;

  // Loading states
  brandsLoading: boolean;
  modelsLoading: boolean;
  yearsLoading: boolean;
  kitsLoading: boolean;

  // Search results
  searchResult: VehicleSearchResult | null;
  searching: boolean;
  searchError: string | null;
  selectedSize: string | null;
  setSelectedSize: (size: string | null) => void;

  // Actions
  handleSearch: () => void;

  // Computed
  selectedKit: CarKit | undefined;
  brandOptions: { value: string; label: string }[];
  modelOptions: { value: string; label: string }[];
  yearOptions: { value: string; label: string }[];
  kitOptions: { value: string; label: string }[];
  seasonOptions: { value: string; label: string }[];
}

export function useVehicleSearch({
  initialMake,
  initialModel,
  initialYear,
  initialKit,
  initialSeason,
}: UseVehicleSearchProps): UseVehicleSearchReturn {
  // Selection state
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [year, setYear] = useState("");
  const [kitId, setKitId] = useState("");
  const [season, setSeason] = useState(initialSeason || "");

  // Search results
  const [searchResult, setSearchResult] = useState<VehicleSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Initialization step tracking
  const [initStep, setInitStep] = useState<'idle' | 'brand' | 'model' | 'year' | 'kit' | 'done'>(
    initialMake ? 'brand' : 'idle'
  );

  // Refs for tracking previous values (to detect user vs init changes)
  const prevBrandIdRef = useRef(brandId);
  const prevModelIdRef = useRef(modelId);
  const prevYearRef = useRef(year);

  // Fetching data for selects
  const { data: brands, loading: brandsLoading } = useFetch<CarBrand[]>(
    "/api/vehicles/brands"
  );

  const { data: models, loading: modelsLoading } = useFetch<CarModel[]>(
    brandId ? `/api/vehicles/models?brandId=${brandId}` : null
  );

  const { data: years, loading: yearsLoading } = useFetch<number[]>(
    modelId ? `/api/vehicles/years?modelId=${modelId}` : null
  );

  const { data: kits, loading: kitsLoading } = useFetch<CarKit[]>(
    modelId && year
      ? `/api/vehicles/kits?modelId=${modelId}&year=${year}`
      : null
  );

  // Initialization from props - step 1: select brand
  useEffect(() => {
    if (initStep !== 'brand' || !brands || !initialMake) return;
    const brand = brands.find(b => b.name.toLowerCase() === initialMake.toLowerCase());
    if (brand) {
      setBrandId(String(brand.id));
      setInitStep('model');
    } else {
      setInitStep('done');
    }
  }, [initStep, brands, initialMake]);

  // Initialization from props - step 2: select model
  useEffect(() => {
    if (initStep !== 'model' || !models || !initialModel) return;
    const model = models.find(m => m.name.toLowerCase() === initialModel.toLowerCase());
    if (model) {
      setModelId(String(model.id));
      setInitStep('year');
    } else {
      setInitStep('done');
    }
  }, [initStep, models, initialModel]);

  // Initialization from props - step 3: select year
  useEffect(() => {
    if (initStep !== 'year' || !years || !initialYear) return;
    const yearNum = parseInt(initialYear);
    if (years.includes(yearNum)) {
      setYear(initialYear);
      setInitStep(initialKit ? 'kit' : 'done');
    } else {
      setInitStep('done');
    }
  }, [initStep, years, initialYear, initialKit]);

  // Initialization from props - step 4: select kit
  useEffect(() => {
    if (initStep !== 'kit' || !kits || !initialKit) return;
    const kit = kits.find(k => k.name.toLowerCase() === initialKit.toLowerCase());
    if (kit) {
      setKitId(String(kit.id));
    }
    setInitStep('done');
  }, [initStep, kits, initialKit]);

  // Reset dependent fields (only on user change, not during initialization)
  useEffect(() => {
    if (prevBrandIdRef.current === brandId) return;
    prevBrandIdRef.current = brandId;
    if (initStep !== 'idle' && initStep !== 'done') return;
    setModelId("");
    setYear("");
    setKitId("");
    setSearchResult(null);
  }, [brandId, initStep]);

  useEffect(() => {
    if (prevModelIdRef.current === modelId) return;
    prevModelIdRef.current = modelId;
    if (initStep !== 'idle' && initStep !== 'done') return;
    setYear("");
    setKitId("");
    setSearchResult(null);
  }, [modelId, initStep]);

  useEffect(() => {
    if (prevYearRef.current === year) return;
    prevYearRef.current = year;
    if (initStep !== 'idle' && initStep !== 'done') return;
    setKitId("");
    setSearchResult(null);
  }, [year, initStep]);

  useEffect(() => {
    setSearchResult(null);
    setSelectedSize(null);
  }, [kitId]);

  // Auto-select if only one item
  useEffect(() => {
    if (models && models.length === 1 && !modelId) {
      setModelId(String(models[0].id));
    }
  }, [models, modelId]);

  useEffect(() => {
    if (years && years.length === 1 && !year) {
      setYear(String(years[0]));
    }
  }, [years, year]);

  useEffect(() => {
    if (kits && kits.length === 1 && !kitId) {
      setKitId(String(kits[0].id));
    }
  }, [kits, kitId]);

  // Search handler
  const searchAbortRef = useRef<AbortController | null>(null);
  const handleSearch = useCallback(async () => {
    if (!kitId) return;

    // Abort any in-flight search
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setSearching(true);
    setSearchError(null);

    try {
      let url = `/api/vehicles/search?kitId=${kitId}`;
      if (season) {
        url += `&season=${season}`;
      }
      const res = await fetch(url, { signal: controller.signal });
      const json = await res.json();

      if (json.error) {
        setSearchError(json.error);
      } else {
        setSearchResult(json.data);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setSearchError("Помилка пошуку шин");
    } finally {
      setSearching(false);
    }
  }, [kitId, season]);

  // Auto-search after initialization from home page
  const autoSearchDoneRef = useRef(false);

  useEffect(() => {
    if (autoSearchDoneRef.current) return;
    if (initStep !== 'done' || !kitId) return;
    if (!initialKit) return;
    autoSearchDoneRef.current = true;
    handleSearch();
  }, [initStep, kitId, initialKit, handleSearch]);

  // Computed options
  const brandOptions =
    brands?.map((b) => ({ value: String(b.id), label: b.name })) ?? [];
  const modelOptions =
    models?.map((m) => ({ value: String(m.id), label: m.name })) ?? [];
  const yearOptions =
    years?.map((y) => ({ value: String(y), label: String(y) })) ?? [];
  const kitOptions =
    kits?.map((k) => ({ value: String(k.id), label: k.name })) ?? [];
  const seasonOptions = [
    { value: "", label: "Не важливо" },
    { value: "summer", label: "Літні" },
    { value: "winter", label: "Зимові" },
    { value: "allseason", label: "Всесезонні" },
  ];

  // Selected kit
  const selectedKit = kits?.find((k) => String(k.id) === kitId);

  return {
    brandId,
    setBrandId,
    modelId,
    setModelId,
    year,
    setYear,
    kitId,
    setKitId,
    season,
    setSeason,
    brands,
    models,
    years,
    kits,
    brandsLoading,
    modelsLoading,
    yearsLoading,
    kitsLoading,
    searchResult,
    searching,
    searchError,
    selectedSize,
    setSelectedSize,
    handleSearch,
    selectedKit,
    brandOptions,
    modelOptions,
    yearOptions,
    kitOptions,
    seasonOptions,
  };
}
