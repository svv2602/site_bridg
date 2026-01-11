#!/usr/bin/env python3
"""
Remove background from tyre images using rembg (U²-Net neural network).

Usage:
    # Process all images in media folder
    python scripts/remove_background.py

    # Process specific folder
    python scripts/remove_background.py --input ./input_images --output ./output_images

    # Process single image
    python scripts/remove_background.py --input ./image.jpg --output ./image-nobg.png

Requirements:
    pip install rembg pillow
"""

import os
import sys
import argparse
from pathlib import Path

try:
    from rembg import remove
    from PIL import Image
except ImportError:
    print("Error: Required packages not installed.")
    print("Run: pip install rembg pillow")
    sys.exit(1)


SUPPORTED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'}


def remove_background(input_path: Path, output_path: Path) -> bool:
    """Remove background from a single image."""
    try:
        with open(input_path, "rb") as inp:
            input_data = inp.read()
            output_data = remove(input_data)

        # Ensure output directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "wb") as out:
            out.write(output_data)

        return True
    except Exception as e:
        print(f"  Error processing {input_path.name}: {e}")
        return False


def process_folder(input_folder: Path, output_folder: Path, replace: bool = False) -> tuple[int, int]:
    """Process all images in a folder."""
    processed = 0
    failed = 0

    # Get all image files
    image_files = [
        f for f in input_folder.iterdir()
        if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    if not image_files:
        print(f"No images found in {input_folder}")
        return 0, 0

    print(f"Found {len(image_files)} images to process...")

    for i, input_path in enumerate(image_files, 1):
        # Skip already processed images (with -nobg suffix)
        if '-nobg' in input_path.stem:
            print(f"  [{i}/{len(image_files)}] Skipping {input_path.name} (already processed)")
            continue

        # Generate output filename
        output_filename = f"{input_path.stem}-nobg.png"

        if replace:
            output_path = input_folder / output_filename
        else:
            output_path = output_folder / output_filename

        # Skip if output already exists
        if output_path.exists():
            print(f"  [{i}/{len(image_files)}] Skipping {input_path.name} (output exists)")
            continue

        print(f"  [{i}/{len(image_files)}] Processing {input_path.name}...", end=" ", flush=True)

        if remove_background(input_path, output_path):
            print("Done")
            processed += 1
        else:
            failed += 1

    return processed, failed


def main():
    parser = argparse.ArgumentParser(
        description="Remove background from tyre images using rembg"
    )
    parser.add_argument(
        "--input", "-i",
        type=Path,
        default=Path("media"),
        help="Input folder or file (default: media)"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=None,
        help="Output folder or file (default: same as input with -nobg suffix)"
    )
    parser.add_argument(
        "--replace", "-r",
        action="store_true",
        help="Save processed images in the same folder as originals"
    )

    args = parser.parse_args()

    input_path = args.input.resolve()

    if not input_path.exists():
        print(f"Error: Input path does not exist: {input_path}")
        sys.exit(1)

    # Single file processing
    if input_path.is_file():
        if args.output:
            output_path = args.output.resolve()
        else:
            output_path = input_path.parent / f"{input_path.stem}-nobg.png"

        print(f"Processing {input_path.name}...", end=" ", flush=True)
        if remove_background(input_path, output_path):
            print("Done")
            print(f"Saved to: {output_path}")
        else:
            sys.exit(1)
        return

    # Folder processing
    if args.output:
        output_folder = args.output.resolve()
    elif args.replace:
        output_folder = input_path
    else:
        output_folder = input_path / "nobg"

    print(f"Input folder:  {input_path}")
    print(f"Output folder: {output_folder}")
    print()

    processed, failed = process_folder(input_path, output_folder, args.replace)

    print()
    print(f"Processed: {processed} images")
    if failed:
        print(f"Failed: {failed} images")
    print("Done!")


if __name__ == "__main__":
    main()
