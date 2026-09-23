# Contributing to Lathala

Thank you for your interest in contributing to Lathala! We welcome contributions to help make open-source newsletter design and publishing accessible to all.

---

## Code Guidelines

- **Typography & Font Stack:** All editorial typography must maintain fidelity to `Instrument Sans` and `Instrument Serif`.
- **Canvas Operations:** Canvas pointer events and transformations must always account for the active `zoom` scale factor.
- **BYOB Separation:** Never commit hardcoded API keys or external project credentials into the codebase. Always use environment variables or in-app configuration.
- **Dependencies:** Keep the bundle lightweight and performant.

---

## Workflow

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Run development build and linting:
   ```bash
   npm run build
   ```
3. Submit a Pull Request detailing the changes and user impact.
