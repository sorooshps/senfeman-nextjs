# Font Setup Instructions

## Adding Custom Fonts

1. Place your TTF font files in the `src/assets/fonts/` directory
2. Uncomment and modify the `localFont` configuration in `src/app/layout.jsx`
3. Update the font paths and weights according to your font files
4. Apply the custom font variable to your components

## Example Font Configuration

```javascript
const customFont = localFont({
  src: [
    {
      path: "./assets/fonts/your-font-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./assets/fonts/your-font-bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-custom",
});
```

## Usage in Components

```javascript
<div className="font-custom">
  This text uses the custom font
</div>
```

## File Structure

```
src/
  assets/
    fonts/
      your-font-regular.ttf
      your-font-bold.ttf
  app/
    layout.jsx