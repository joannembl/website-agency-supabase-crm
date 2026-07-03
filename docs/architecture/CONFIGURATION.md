# Configuration Layer

The app now has a dedicated configuration layer in `src/config/`.

## Files

- `navigation.js` — sidebar navigation items and labels
- `routes.js` — route metadata derived from navigation
- `theme.js` — app naming, brand initials, and UI scale tokens
- `features.js` — feature flags for planned modules

Use this layer instead of hardcoding navigation, product naming, or feature toggles directly inside components.
