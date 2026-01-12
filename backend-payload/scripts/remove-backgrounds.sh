#!/bin/bash
# Script to remove backgrounds from all tyre images using rembg

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MEDIA_DIR="$PROJECT_DIR/media"
VENV_REMBG="$PROJECT_DIR/.venv/bin/rembg"

echo "=== Background Removal Script ==="
echo "Media directory: $MEDIA_DIR"
echo "rembg path: $VENV_REMBG"

# Check if rembg is available
if [ ! -f "$VENV_REMBG" ]; then
    echo "Error: rembg not found at $VENV_REMBG"
    echo "Please install: python3 -m venv .venv && .venv/bin/pip install 'rembg[cpu,cli]'"
    exit 1
fi

# Process all images
processed=0
failed=0
skipped=0

shopt -s nullglob
for img in "$MEDIA_DIR"/*.png "$MEDIA_DIR"/*.jpg "$MEDIA_DIR"/*.jpeg "$MEDIA_DIR"/*.webp; do
    filename=$(basename "$img")
    basename="${filename%.*}"

    # Skip already processed images (ending with -nobg)
    if [[ "$basename" == *-nobg ]]; then
        echo "  Skipping (already processed): $filename"
        ((skipped++))
        continue
    fi

    output_path="$MEDIA_DIR/${basename}-nobg.png"

    # Skip if output already exists
    if [ -f "$output_path" ]; then
        echo "  Skipping (output exists): $filename -> ${basename}-nobg.png"
        ((skipped++))
        continue
    fi

    echo "  Processing: $filename"
    if "$VENV_REMBG" i "$img" "$output_path" 2>/dev/null; then
        echo "    -> Created: ${basename}-nobg.png"
        ((processed++))
    else
        echo "    -> Failed: $filename"
        ((failed++))
    fi
done
shopt -u nullglob

echo ""
echo "=== Summary ==="
echo "  Processed: $processed"
echo "  Failed: $failed"
echo "  Skipped: $skipped"
