# Image Generation Prompts

## Overview
Промпти для генерації зображень для статей та продуктових сторінок Bridgestone.

## Brand Guidelines
- Кольори: червоний (#DA291C), чорний, білий
- Стиль: професійний, чистий, сучасний
- Атмосфера: безпека, інновації, надійність

## Image Categories

### 1. Tire on Road (hero images)
```
Professional automotive photography of a {tire_model} tire on a {road_type},
{weather} conditions, {time_of_day} lighting,
4K quality, realistic, clean background,
focus on tire tread pattern
```

Variables:
- `{tire_model}`: "premium car tire", "winter tire with snow treads"
- `{road_type}`: "wet asphalt road", "snowy mountain road", "dry highway"
- `{weather}`: "light rain", "heavy snow", "sunny"
- `{time_of_day}`: "golden hour", "dramatic sunset", "overcast daylight"

**Examples:**
```
Professional automotive photography of a premium winter tire on a snowy mountain road,
heavy snow conditions, dramatic lighting, 4K quality, realistic,
focus on tire tread pattern gripping snow
```

### 2. Car with Tires (lifestyle)
```
{car_type} with new tires, {season} setting, {environment},
automotive photography style, {mood} lighting,
professional quality, realistic rendering
```

Variables:
- `{car_type}`: "luxury sedan", "modern SUV", "family crossover"
- `{season}`: "winter", "summer", "autumn"
- `{environment}`: "city street", "countryside road", "parking lot"
- `{mood}`: "warm", "dramatic", "natural"

**Examples:**
```
Modern SUV with winter tires, snowy forest road setting,
automotive photography style, dramatic cold lighting,
professional quality, realistic rendering, safety concept
```

### 3. Tire Closeup (product detail)
```
Close-up macro shot of tire tread pattern, {tread_type},
studio lighting, black background,
high detail, 4K quality, product photography,
showing {feature}
```

Variables:
- `{tread_type}`: "V-shaped grooves", "asymmetric pattern", "siped winter tread"
- `{feature}`: "water evacuation channels", "snow grip elements", "noise reduction design"

**Examples:**
```
Close-up macro shot of winter tire tread pattern, siped design,
studio lighting, black background, high detail, 4K quality,
product photography, showing snow grip elements
```

### 4. Technology Illustration
```
Technical illustration showing {technology_name} tire technology,
cross-section view, {focus_area},
clean modern style, professional diagram,
white background, labeled components
```

Variables:
- `{technology_name}`: "ENLITEN", "B-Silent", "Run-Flat"
- `{focus_area}`: "tire layers", "tread compound", "sidewall construction"

### 5. Seasonal Lifestyle
```
{scene_description}, {season} atmosphere,
warm tones, family/safety concept,
photorealistic, editorial style,
subtle automotive context
```

Variables:
- `{scene_description}`: "family loading luggage for road trip", "car on scenic mountain road"
- `{season}`: "winter holiday", "summer vacation"

**Examples:**
```
Family preparing car for winter road trip, loading ski equipment,
snowy morning atmosphere, warm tones, safety concept,
photorealistic, editorial style, focus on reliable tires
```

## Negative Prompts (what to avoid)
```
text, watermark, logo, brand name, price tag,
low quality, blurry, distorted,
unrealistic proportions, cartoon style,
humans without faces, graphic design elements
```

## Size Guidelines

| Use Case | Aspect Ratio | Pixels |
|----------|--------------|--------|
| Hero image | 16:9 | 1792x1024 |
| Article image | 3:2 | 1024x1024 |
| Square (social) | 1:1 | 1024x1024 |
| Portrait | 2:3 | 1024x1792 |

## Provider-Specific Notes

### DALL-E 3
- Кращий для точного слідування інструкціям
- Використовувати detailed описи
- Може автоматично розширити промпт

### Flux (Replicate)
- Кращий для фотореалізму
- Використовувати `photorealistic, 4K quality`
- Підтримує negative prompts

## Alt Text Templates

```
{tire_model} tire {action} on {surface} - Bridgestone {product_line}
```

Examples:
- "Winter tire gripping snowy road - Bridgestone Blizzak"
- "Close-up of tire tread pattern showing water channels - Bridgestone Turanza"
