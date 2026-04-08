# Motion Smoke Check (Post-Preloader)

Короткая ручная проверка после завершения прелоадера.

## 0. Static pre-check (быстрый)

Перед ручным прогоном можно запустить статическую проверку связности motion-слоя:

```bash
python3 scripts/motion_smoke_check.py
```

Проверка валидирует:
- ключевые motion-селекторы в `index.html`;
- вызовы критичных init-функций в `assets/motion/animations.js`;
- отсутствие ранее удалённых dead-маркеров в JS/CSS.

1. Hero metrics marquee
- Блок метрик в hero движется непрерывно.
- На hover движение замедляется/останавливается и возвращается после ухода курсора.

2. Solution cards reveal
- Карточки в `#solution` появляются по скроллу без рывков.
- Заголовок и подписи в карточках не мерцают и не пересобираются повторно.

3. How stats + pipeline
- В `#how` строка `Auth check / Policy check / Route resolve` проявляется по скроллу.
- Пайплайн-стрелки работают, интенсивность меняется при входе/выходе из зоны триггера.

4. Header scroll state
- Шапка корректно переключает `is-scrolled` при прокрутке вниз/вверх.
- На якорных переходах состояние шапки не “залипает”.

5. Optional debug
- Для отладки включить в консоли:
  `window.__AP_MOTION_DEBUG__ = true`
- После reload в консоли должны появляться события enter/leave для ключевых ScrollTrigger-зон.
