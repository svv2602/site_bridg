# Check Contrast Issues

This skill checks for low-contrast badge and text patterns in the frontend codebase.

## Trigger
Use when: User asks to check contrast, find contrast issues, or audit badge colors.

## Instructions

Search for these problematic patterns in `frontend/src/`:

### Low Contrast Patterns to Find

**Badges:**
1. **`bg-muted text-muted-foreground`** - Both colors are muted, poor contrast
2. **`bg-primary/10 text-primary`** - Very light background with colored text
3. **`bg-secondary/10 text-secondary`** - Same issue as above
4. **`bg-{color}-500/10 text-{color}-600`** - Opacity backgrounds with similar text

**Buttons:**
5. **`hover:bg-muted`** - Hover state has poor contrast in light theme
6. **`bg-muted hover:bg-muted/80`** - Toggle buttons with muted background

### Search Commands

```bash
# Find muted background + muted text combinations
rg "bg-muted.*text-muted-foreground" frontend/src/ --type tsx

# Find primary/10 patterns
rg "bg-primary/10.*text-primary" frontend/src/ --type tsx

# Find any opacity background with matching text
rg "bg-\w+-\d+/\d+.*text-\w+-\d+" frontend/src/ --type tsx
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
| `bg-muted hover:bg-muted/80` | `bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600` |
| `border-border ... text-foreground` | `border-stone-300 text-stone-700 dark:border-stone-600 dark:text-stone-200` |

### Exclusions

These patterns are OK and should NOT be changed:
- Hover states: `hover:bg-primary/10` (temporary visual feedback)
- Icon containers: `bg-primary/10` without text (just background for icon)
- Decorative backgrounds without text content

## Output

Report found issues with:
1. File path and line number
2. Current problematic pattern
3. Suggested fix
