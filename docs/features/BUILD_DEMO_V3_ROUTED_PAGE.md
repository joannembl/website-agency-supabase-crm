# Build Demo Website V3 — Routed Page

This update moves the demo builder out of a modal and into its own full-page workflow.

## Goals

- Reduce modal overload.
- Add URL-based routing through hash routes.
- Make Build Demo feel like a primary product workflow.
- Improve the UX with a cleaner two-panel layout, progress tracker, AI generation button, and preview tabs.

## Route

The Build Demo page is available at:

```text
#/build-demo
```

## UX changes

- Replaces the Build Demo modal with a full page.
- Adds a polished page hero and action bar.
- Adds business input panel.
- Adds generated demo panel with tabs:
  - Preview
  - Copy
  - Brief
  - Code
- Adds live iframe preview for generated HTML.
- Keeps existing AI generation, save, and download behavior.

## Notes

This update intentionally avoids adding `react-router-dom`. It uses lightweight hash routes so GitHub Pages can support direct navigation without server rewrite configuration.
