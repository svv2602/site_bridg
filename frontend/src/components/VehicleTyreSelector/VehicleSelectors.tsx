"use client";

import {
  Car,
  Calendar,
  Settings,
  Filter,
} from "lucide-react";
import { SelectField } from "./SelectField";

// --- MakeSelector ---

export interface MakeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  loading: boolean;
}

export function MakeSelector({ value, onChange, options, loading }: MakeSelectorProps) {
  return (
    <SelectField
      label="Марка авто"
      value={value}
      onChange={onChange}
      options={options}
      loading={loading}
      icon={Car}
      placeholder="Оберіть марку"
      searchable={true}
    />
  );
}

// --- ModelSelector ---

export interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled: boolean;
  loading: boolean;
}

export function ModelSelector({ value, onChange, options, disabled, loading }: ModelSelectorProps) {
  return (
    <SelectField
      label="Модель"
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      loading={loading}
      icon={Car}
      placeholder="Оберіть модель"
      searchable={true}
    />
  );
}

// --- YearSelector ---

export interface YearSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled: boolean;
  loading: boolean;
}

export function YearSelector({ value, onChange, options, disabled, loading }: YearSelectorProps) {
  return (
    <SelectField
      label="Рік випуску"
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      loading={loading}
      icon={Calendar}
      placeholder="Оберіть рік"
    />
  );
}

// --- KitSelector ---

export interface KitSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled: boolean;
  loading: boolean;
}

export function KitSelector({ value, onChange, options, disabled, loading }: KitSelectorProps) {
  return (
    <SelectField
      label="Комплектація"
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      loading={loading}
      icon={Settings}
      placeholder="Оберіть комплектацію"
    />
  );
}

// --- SeasonSelector ---

export interface SeasonSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function SeasonSelector({ value, onChange, options }: SeasonSelectorProps) {
  return (
    <SelectField
      label="Сезонність"
      value={value}
      onChange={onChange}
      options={options}
      icon={Filter}
      placeholder="Не важливо"
    />
  );
}
