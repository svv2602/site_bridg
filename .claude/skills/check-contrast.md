# Check Contrast Issues

This skill checks for low-contrast and forbidden patterns in the frontend codebase.

## Trigger

Use when: User asks to check contrast, find contrast issues, audit badge/button colors, or review UI consistency.

## Instructions

Search for these problematic patterns in `frontend/src/`:

### Forbidden Patterns to Find

**Low Contrast Badges:**
1. **`bg-muted text-muted-foreground`** — Both colors are muted, poor contrast
2. **`bg-primary/10 text-primary`** — Opacity background with colored text
3. **`bg-secondary/10 text-secondary`** — Same issue
4. **`bg-{color}-500/10 text-{color}-600`** — Opacity backgrounds with similar text

**Problematic Buttons:**
5. **`hover:bg-muted`** — Hover state has poor contrast
6. **`hover:bg-card`** — Implicit hover color
7. **`border-border`** without explicit dark: variant for buttons
8. **`bg-muted hover:bg-muted/80`** — Toggle buttons with muted background

**Cold Palettes (Forbidden):**
9. **`zinc-*`** — Use stone-* instead
10. **`gray-*`** — Use stone-* instead
11. **`slate-*`** — Use stone-* instead

### Search Commands

```bash
# Find muted background + muted text combinations
rg "bg-muted.*text-muted-foreground" frontend/src/

# Find primary/10 patterns
rg "bg-primary/10.*text-primary" frontend/src/

# Find problematic hover states
rg "hover:bg-muted|hover:bg-card" frontend/src/

# Find opacity backgrounds with text
rg "bg-\w+-\d+/\d+.*text-\w+-\d+" frontend/src/

# Find cold palettes
rg "zinc-|gray-|slate-" frontend/src/

# Find border-border without dark variant in buttons
rg "border-border.*font-semibold" frontend/src/
```

### Correct Replacements

**Badges:**
| Problematic Pattern | Replace With |
|---------------------|--------------|
| `bg-muted text-muted-foreground` | `bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200` |
| `bg-primary/10 text-primary` | `bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200` (neutral) or `bg-primary text-primary-text` (active) |
| `bg-green-500/10 text-green-600` | `bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200` |
| `bg-red-500/10 text-red-600` | `bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200` |

**Buttons:**
| Problematic Pattern | Replace With |
|---------------------|--------------|
| `hover:bg-muted` | `hover:bg-stone-100 dark:hover:bg-stone-700` |
| `hover:bg-card` | `hover:bg-stone-100 dark:hover:bg-stone-700` |
| `bg-muted hover:bg-muted/80` | `bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600` |
| `border-border ... text-foreground` | `border-stone-300 text-stone-700 dark:border-stone-600 dark:text-stone-200` |

**Cold Palettes:**
| Problematic | Replace With |
|-------------|--------------|
| `zinc-*` | `stone-*` |
| `gray-*` | `stone-*` |
| `slate-*` | `stone-*` |

### Exclusions

These patterns are OK and should NOT be changed:
- Hover states: `hover:bg-primary/10` (temporary visual feedback)
- Icon containers: `bg-primary/10` without text (just background for icon)
- Decorative backgrounds without text content
- `border-border` for cards (NOT buttons)
- `bg-card`, `bg-background` without explicit text classes

## Output

Report found issues with:
1. File path and line number
2. Current problematic pattern
3. Suggested fix

Example:
```
frontend/src/app/page.tsx:195
  Current: border-border hover:bg-card
  Fix: border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700
```
