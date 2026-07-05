# Custom Hooks

## Purpose

This document describes the custom hooks used by Agency OS.

## Standards

- Keep feature-specific logic inside feature folders.
- Keep Supabase access inside services.
- Keep reusable state in hooks.
- Keep shared UI in components.
- Use constants/config instead of scattered magic strings.

## Notes

This architecture exists to make future modules easier to add without redesigning the product each time.
