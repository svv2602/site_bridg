# Audit: Dealers and Contacts Group

**Pages analyzed:**
- `/home/snisar/RubyProjects/site_Bridgestone/frontend/src/app/dealers/page.tsx` (`/dealers`)
- `/home/snisar/RubyProjects/site_Bridgestone/frontend/src/app/contacts/page.tsx` (`/contacts`)

**Related components:**
- `/home/snisar/RubyProjects/site_Bridgestone/frontend/src/components/DealersMap.tsx`
- `/home/snisar/RubyProjects/site_Bridgestone/frontend/src/lib/api/dealers.ts`

---

## 1. Functionality

### /dealers page

| Aspect | Status | Notes |
|--------|--------|-------|
| Component rendering | OK | All components render correctly |
| Error handling | PARTIAL | DealersMap has error handling, but page uses MOCK_DEALERS directly (no API call) |
| API calls | NOT USED | Page imports `MOCK_DEALERS` directly instead of using `getDealers()` from API layer |

**Critical issue:** The dealers page ignores the existing API layer (`lib/api/dealers.ts`) that supports Payload CMS fallback:
```tsx
// Current (line 5):
import { MOCK_DEALERS, type Dealer } from "@/lib/data";

// Should be:
import { getDealers } from "@/lib/api/dealers";
```

The API layer (`dealers.ts`) already has proper fallback logic:
```typescript
export async function getDealers(): Promise<Dealer[]> {
  try {
    const dealers = await getPayloadDealers();
    if (dealers.length > 0) { return dealers.map(...); }
  } catch (error) {
    console.warn("Payload CMS unavailable, using mock data:", error);
  }
  return MOCK_DEALERS;
}
```

### /contacts page

| Aspect | Status | Notes |
|--------|--------|-------|
| Component rendering | OK | All components render |
| Error handling | MISSING | Form has no submit handler, no error/success states |
| API calls | N/A | Static page with hardcoded data |

**Issues:**
1. Form has no `onSubmit` handler - button does nothing
2. No form validation feedback
3. Contact data is hardcoded in component

---

## 2. UX/UI States

### /dealers page

| State | Status | Implementation |
|-------|--------|----------------|
| Loading state | MISSING | No loading indicator when filtering (instant with mock data) |
| Empty state | OK | Shows "Дилерiв не знайдено" message with icon (line 186-196) |
| Error state | PARTIAL | DealersMap shows API key error, but page has no error boundary |
| Responsive design | OK | Uses responsive grid (`lg:grid-cols-3`, `md:grid-cols-2`) |

**Empty state implementation (good):**
```tsx
{filteredDealers.length === 0 ? (
  <motion.div className="rounded-2xl border border-border bg-card p-12 text-center">
    <Search className="mx-auto h-12 w-12 text-muted" />
    <h3 className="mt-4 text-xl font-semibold">Дилерів не знайдено</h3>
    <p className="mt-2 text-muted-foreground">
      Спробуйте змінити параметри пошуку або обрати інше місто.
    </p>
  </motion.div>
) : (...)}
```

### /contacts page

| State | Status | Implementation |
|-------|--------|----------------|
| Loading state | MISSING | No loading state for form submission |
| Empty state | N/A | Static content |
| Error state | MISSING | No form error handling |
| Success state | MISSING | No form success feedback |
| Responsive design | OK | Uses responsive grid (`lg:grid-cols-2`, `sm:grid-cols-2`) |

---

## 3. DealersMap Component

| Aspect | Status | Notes |
|--------|--------|-------|
| API key missing | OK | Shows helpful placeholder with instructions |
| Load error | OK | Shows error message |
| Loading state | OK | Shows spinner with "Завантаження карти..." |
| No dealers with coords | OK | Defaults to Ukraine center |

**Good error handling example:**
```tsx
if (!apiKey) {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center...">
      <Navigation className="mb-4 h-12 w-12 text-zinc-400" />
      <p className="font-medium">Карта дилерів Bridgestone</p>
      <p className="mt-2 text-sm text-zinc-500">
        Для відображення карти необхідний Google Maps API ключ.
      </p>
      <p className="mt-1 text-xs text-zinc-400">
        Додайте NEXT_PUBLIC_GOOGLE_MAPS_API_KEY в .env.local
      </p>
    </div>
  );
}
```

---

## 4. Internationalization (i18n)

### /dealers page - Hardcoded Ukrainian text

| Location | Text |
|----------|------|
| Line 15-19 | `dealerTypes` array labels |
| Line 82-91 | Hero breadcrumbs and heading |
| Line 107-157 | Search form labels and buttons |
| Line 184 | Section heading "Список дилерів" |
| Line 192-195 | Empty state text |
| Line 218-222 | Type labels (repeated logic) |
| Line 281 | "Детальніше" / "Менше" button |
| Line 294-304 | Expanded dealer info text |
| Line 324-334 | CTA section text |

### /contacts page - Hardcoded Ukrainian text

| Location | Text |
|----------|------|
| Lines 6-38 | `contactMethods` array |
| Lines 41-58 | `faqs` array |
| Lines 72-87 | Hero section |
| Lines 107-118 | Contact method cards |
| Lines 135-197 | Contact form labels and text |
| Lines 209-226 | FAQ section |
| Lines 263-274 | CTA section |

**Recommendation:** Extract all UI text to a centralized i18n file or use a library like `next-intl`.

---

## 5. Accessibility

### /dealers page

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Missing input ID/label association | HIGH | Lines 115-121 | Input lacks `id`, label lacks `htmlFor` |
| Missing select ID/label association | HIGH | Lines 128-138 | Select lacks `id`, label lacks `htmlFor` |
| Non-semantic breadcrumb | MEDIUM | Lines 82-86 | Uses `<span>` instead of proper `<a>` links |
| Decorative icons lack aria-hidden | LOW | Multiple | Icons from lucide-react should have `aria-hidden="true"` |
| Button without clear purpose | MEDIUM | Lines 283-285 | "Побудувати маршрут" button has no action |
| CTA buttons without href | MEDIUM | Lines 330-334 | Buttons should be links or have click handlers |

**Example fix for input accessibility:**
```tsx
// Current:
<label className="mb-2 block text-sm font-medium text-zinc-100">
  Місто або адреса
</label>
<input type="text" ... />

// Should be:
<label htmlFor="city-search" className="mb-2 block text-sm font-medium text-zinc-100">
  Місто або адреса
</label>
<input id="city-search" type="text" ... />
```

### /contacts page

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Missing input ID/label association | HIGH | Lines 141-158 | Form inputs lack proper label association |
| Missing select ID/label association | HIGH | Lines 170-177 | Select lacks `id` |
| Missing textarea ID/label association | HIGH | Lines 180-186 | Textarea lacks `id` |
| Form has no ARIA live region | MEDIUM | Form section | No feedback announced to screen readers |
| FAQ not using proper disclosure pattern | MEDIUM | Lines 211-219 | Static FAQ, could use `<details>`/`<summary>` |
| Non-semantic breadcrumb | MEDIUM | Lines 72-76 | Uses `<span>` instead of proper `<a>` links |

---

## 6. SEO

### /dealers page

| Aspect | Status | Notes |
|--------|--------|-------|
| Metadata | OK | Defined in `layout.tsx` |
| Schema.org | OK | LocalBusiness + BreadcrumbList schemas |
| Canonical URL | MISSING | Should be added |
| OpenGraph | MISSING | No OG tags defined |

### /contacts page

| Aspect | Status | Notes |
|--------|--------|-------|
| Metadata | MISSING | No `layout.tsx` with metadata |
| Schema.org | MISSING | No ContactPage or Organization schema |
| Canonical URL | MISSING | Should be added |
| OpenGraph | MISSING | No OG tags defined |

---

## 7. Code Quality Issues

### /dealers page

1. **Duplicate type label logic** (lines 218-222 and 14-19):
   ```tsx
   // Type labels repeated in dealerTypes array AND in JSX conditional
   {dealer.type === "official" ? "Офіційний дилер" : dealer.type === "partner" ? "Партнер" : "Сервісний центр"}
   ```
   Should use a shared lookup function.

2. **Hardcoded "additional info"** (lines 294-304):
   All dealers show same generic description instead of actual dealer data.

3. **Non-functional buttons**:
   - "Побудувати маршрут" (line 283-285) - no click handler
   - "Зателефонувати" (line 330) - should be `<a href="tel:...">`
   - "Заповнити форму" (line 333) - should link to `/contacts`

### /contacts page

1. **Form has no submission logic**:
   ```tsx
   <form className="space-y-6">  // Missing onSubmit handler
     ...
     <button type="submit" ...>Надіслати запит</button>
   </form>
   ```

2. **Map placeholder** (lines 236-247):
   Shows static placeholder instead of real map. Could reuse `DealersMap` component.

3. **Dead links**:
   - `href="#"` on map location card (line 29)
   - `href="#"` on "Дізнатися більше" (line 37)
   - "Відкрити карту" button (line 243-244) - no action

---

## 8. Summary of Issues by Priority

### Critical (P0)
1. Dealers page uses mock data directly instead of API layer with CMS fallback

### High (P1)
2. Contact form has no submit handler (broken functionality)
3. Missing label/input associations (accessibility)
4. No loading/error/success states for contact form

### Medium (P2)
5. Missing metadata for contacts page
6. Non-functional CTA buttons on both pages
7. No Schema.org for contacts page
8. Breadcrumbs are not semantic links

### Low (P3)
9. All text hardcoded (i18n)
10. Duplicate type label logic
11. Map placeholder on contacts page could use DealersMap
12. Missing OpenGraph tags

---

## 9. Recommendations

### Immediate fixes (P0-P1):

1. **Use API layer for dealers data:**
   ```tsx
   // Convert to async server component or use useEffect
   const dealers = await getDealers();
   ```

2. **Add form submission handler:**
   ```tsx
   const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

   async function handleSubmit(e: FormEvent) {
     e.preventDefault();
     setStatus('loading');
     try {
       await submitContactForm(formData);
       setStatus('success');
     } catch {
       setStatus('error');
     }
   }
   ```

3. **Fix accessibility:**
   - Add `id` to all form inputs
   - Add `htmlFor` to all labels
   - Convert breadcrumbs to `<Link>` components

### Future improvements (P2-P3):

4. Create contacts `layout.tsx` with metadata
5. Add Schema.org ContactPage schema
6. Extract UI text to i18n constants
7. Make CTA buttons functional (proper links or handlers)
8. Integrate DealersMap on contacts page
