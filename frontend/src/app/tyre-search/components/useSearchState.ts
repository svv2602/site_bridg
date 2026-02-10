"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Brand, TyreModel } from "@/lib/data";

type SearchMode = "size" | "car";

export interface SizeOption {
  value: number;
  count: number;
}

// Legacy sessionStorage type kept for backward compatibility migration
interface StoredSearchParams {
  mode: 'size' | 'car';
  width?: string;
  aspectRatio?: string;
  diameter?: string;
  season?: string;
  make?: string;
  model?: string;
  year?: string;
  kit?: string;
  timestamp?: number;
}

export interface UseSearchStateReturn {
  // Mode
  mode: SearchMode;
  handleModeChange: (newMode: SearchMode) => void;

  // Size filter values
  width: string;
  aspectRatio: string;
  diameter: string;
  season: string;
  handleWidthChange: (newWidth: string) => void;
  handleAspectChange: (newAspect: string) => void;
  handleDiameterChange: (newDiameter: string) => void;
  handleSeasonChange: (newSeason: string) => void;

  // Size options from database
  widthOptions: SizeOption[];
  aspectOptions: SizeOption[];
  diameterOptions: SizeOption[];
  loadingWidths: boolean;
  loadingAspects: boolean;
  loadingDiameters: boolean;

  // Search results
  results: TyreModel[];
  filteredResults: TyreModel[];
  hasSearched: boolean;
  searching: boolean;
  searchedSize: string;
  searchedSeason: string;

  // Brand filter
  selectedBrands: Brand[];
  toggleBrand: (brand: Brand) => void;

  // Search actions
  performSearch: () => Promise<void>;
  handleSizeSearch: (e: React.FormEvent) => void;
  handleResetFilters: () => void;

  // Results ref for scroll
  resultsRef: React.RefObject<HTMLDivElement | null>;

  // URL params for car mode
  urlMake: string;
  urlModel: string;
  urlYear: string;
  urlSeason: string;
}

export function useSearchState(): UseSearchStateReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial values from URL params
  const urlMode = searchParams.get('mode') as SearchMode | null;
  const urlWidth = searchParams.get('width') || "";
  const urlProfile = searchParams.get('profile') || "";
  const urlDiameter = searchParams.get('diameter') || "";
  const urlSeason = searchParams.get('season') || "";
  const urlMake = searchParams.get('make') || "";
  const urlModel = searchParams.get('model') || "";
  const urlYear = searchParams.get('year') || "";

  const [mode, setMode] = useState<SearchMode>(urlMode === 'car' ? 'car' : 'size');
  const [width, setWidth] = useState(urlWidth);
  const [aspectRatio, setAspectRatio] = useState(urlProfile);
  const [diameter, setDiameter] = useState(urlDiameter);
  const [season, setSeason] = useState<string>(urlSeason);
  const [results, setResults] = useState<TyreModel[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchedSize, setSearchedSize] = useState("");
  const [searchedSeason, setSearchedSeason] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>(["bridgestone", "firestone"]);
  const [initialSearchDone, setInitialSearchDone] = useState(false);
  const [restoredFromUrl, setRestoredFromUrl] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isUpdatingUrl = useRef(false);

  // Helper: update URL search params without history pollution
  const updateUrlParams = useCallback((params: Record<string, string>) => {
    isUpdatingUrl.current = true;
    const newParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        newParams.set(key, value);
      }
    }
    const queryString = newParams.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
    // Reset the flag after a tick to allow external URL changes through
    setTimeout(() => { isUpdatingUrl.current = false; }, 0);
  }, [router]);

  // Sync URL params when filters change (size mode)
  const syncSizeParamsToUrl = useCallback((
    currentMode: SearchMode,
    currentWidth: string,
    currentProfile: string,
    currentDiameter: string,
    currentSeason: string,
  ) => {
    if (currentMode === 'size') {
      updateUrlParams({
        mode: 'size',
        width: currentWidth,
        profile: currentProfile,
        diameter: currentDiameter,
        season: currentSeason,
      });
    }
  }, [updateUrlParams]);

  // Update mode when URL params change (page navigation)
  useEffect(() => {
    if (isUpdatingUrl.current) return;
    if (urlMode === 'car' || urlMode === 'size') {
      setMode(urlMode);
    }
  }, [urlMode]);

  // Filter results by selected brands
  const filteredResults = results.filter(tyre => selectedBrands.includes(tyre.brand));

  function toggleBrand(brand: Brand) {
    setSelectedBrands(prev => {
      if (prev.includes(brand)) {
        if (prev.length === 1) return prev;
        return prev.filter(b => b !== brand);
      }
      return [...prev, brand];
    });
  }

  // Check if URL has params to restore
  useEffect(() => {
    if (restoredFromUrl) return;
    setRestoredFromUrl(true);

    if (urlMode === 'size' && urlWidth && urlProfile && urlDiameter) {
      return;
    }

    // Legacy: read from sessionStorage for backward compatibility
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem('tyreSearchParams');
    if (stored) {
      try {
        const params: StoredSearchParams = JSON.parse(stored);
        if (params.timestamp && Date.now() - params.timestamp < 5 * 60 * 1000) {
          setMode(params.mode || 'size');
          if (params.mode === 'size') {
            if (params.width) setWidth(params.width);
            if (params.aspectRatio) setAspectRatio(params.aspectRatio);
            if (params.diameter) setDiameter(params.diameter);
            if (params.season) setSeason(params.season);
          }
          sessionStorage.removeItem('tyreSearchParams');
        } else {
          sessionStorage.removeItem('tyreSearchParams');
        }
      } catch {
        sessionStorage.removeItem('tyreSearchParams');
      }
    }
  }, [restoredFromUrl, urlMode, urlWidth, urlProfile, urlDiameter]);

  // Dynamic options from database
  const [widthOptions, setWidthOptions] = useState<SizeOption[]>([]);
  const [aspectOptions, setAspectOptions] = useState<SizeOption[]>([]);
  const [diameterOptions, setDiameterOptions] = useState<SizeOption[]>([]);
  const [loadingWidths, setLoadingWidths] = useState(false);
  const [loadingAspects, setLoadingAspects] = useState(false);
  const [loadingDiameters, setLoadingDiameters] = useState(false);

  // Load widths on mount
  useEffect(() => {
    setLoadingWidths(true);
    fetch('/api/tyres/sizes?type=width')
      .then(res => res.json())
      .then(json => {
        if (json.data) setWidthOptions(json.data);
      })
      .catch(console.error)
      .finally(() => setLoadingWidths(false));
  }, []);

  // Load aspect ratios when width changes
  useEffect(() => {
    if (!width) {
      setAspectOptions([]);
      return;
    }
    setLoadingAspects(true);
    fetch(`/api/tyres/sizes?type=height&width=${width}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) setAspectOptions(json.data);
      })
      .catch(console.error)
      .finally(() => setLoadingAspects(false));
  }, [width]);

  // Load diameters when aspect ratio changes
  useEffect(() => {
    if (!width || !aspectRatio) {
      setDiameterOptions([]);
      return;
    }
    setLoadingDiameters(true);
    fetch(`/api/tyres/sizes?type=diameter&width=${width}&height=${aspectRatio}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) setDiameterOptions(json.data);
      })
      .catch(console.error)
      .finally(() => setLoadingDiameters(false));
  }, [width, aspectRatio]);

  // Search function
  const performSearch = useCallback(async () => {
    if (!width || !aspectRatio || !diameter) return;

    setSearching(true);
    setSearchedSize(`${width}/${aspectRatio} R${diameter}`);
    setSearchedSeason(season);

    try {
      let url = `/api/tyres/search?width=${width}&height=${aspectRatio}&diameter=${diameter}`;
      if (season) url += `&season=${season}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.data?.tyres) {
        setResults(json.data.tyres);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setSearching(false);
      setHasSearched(true);
      // Scroll to results after DOM updates
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [width, aspectRatio, diameter, season]);

  // Auto-search on page load with URL params
  useEffect(() => {
    if (initialSearchDone) return;
    if (loadingWidths || loadingAspects || loadingDiameters) return;
    if (mode !== 'size') return;

    if (!width || !aspectRatio || !diameter) return;

    const hasWidth = widthOptions.some(o => o.value === parseInt(width));
    const hasAspect = aspectOptions.some(o => o.value === parseInt(aspectRatio));
    const hasDiameter = diameterOptions.some(o => o.value === parseInt(diameter));

    if (hasWidth && hasAspect && hasDiameter) {
      setInitialSearchDone(true);
      setTimeout(() => {
        performSearch();
      }, 0);
    }
  }, [width, aspectRatio, diameter, widthOptions, aspectOptions, diameterOptions, loadingWidths, loadingAspects, loadingDiameters, initialSearchDone, mode, performSearch]);

  // Wrapper handlers that sync state to URL
  function handleModeChange(newMode: SearchMode) {
    setMode(newMode);
    if (newMode === 'car') {
      updateUrlParams({ mode: 'car' });
    } else {
      syncSizeParamsToUrl('size', width, aspectRatio, diameter, season);
    }
  }

  function handleWidthChange(newWidth: string) {
    setWidth(newWidth);
    setAspectRatio("");
    setDiameter("");
    syncSizeParamsToUrl('size', newWidth, "", "", season);
  }

  function handleAspectChange(newAspect: string) {
    setAspectRatio(newAspect);
    setDiameter("");
    syncSizeParamsToUrl('size', width, newAspect, "", season);
  }

  function handleDiameterChange(newDiameter: string) {
    setDiameter(newDiameter);
    syncSizeParamsToUrl('size', width, aspectRatio, newDiameter, season);
  }

  function handleSeasonChange(newSeason: string) {
    setSeason(newSeason);
    syncSizeParamsToUrl('size', width, aspectRatio, diameter, newSeason);
  }

  function handleSizeSearch(e: React.FormEvent) {
    e.preventDefault();
    syncSizeParamsToUrl('size', width, aspectRatio, diameter, season);
    performSearch();
  }

  function handleResetFilters() {
    setWidth("");
    setAspectRatio("");
    setDiameter("");
    setSeason("");
    setResults([]);
    setHasSearched(false);
    updateUrlParams({ mode: 'size' });
  }

  return {
    mode,
    handleModeChange,
    width,
    aspectRatio,
    diameter,
    season,
    handleWidthChange,
    handleAspectChange,
    handleDiameterChange,
    handleSeasonChange,
    widthOptions,
    aspectOptions,
    diameterOptions,
    loadingWidths,
    loadingAspects,
    loadingDiameters,
    results,
    filteredResults,
    hasSearched,
    searching,
    searchedSize,
    searchedSeason,
    selectedBrands,
    toggleBrand,
    performSearch,
    handleSizeSearch,
    handleResetFilters,
    resultsRef,
    urlMake,
    urlModel,
    urlYear,
    urlSeason,
  };
}
