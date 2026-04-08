# Baseline Visual Freeze — 2026-04-08

## Scope

Фиксируем baseline для секций:

- `#capabilities`
- `#security`
- `#developers`

Цель: все следующие правки сравнивать с этим baseline и закрывать только локальные расхождения без побочных изменений.

## Source of Truth

- Контент и структура: `docs/LANDING-AUTHPROXY.md`
- Визуал: соответствующие узлы Figma по текущим задачам
- Runtime-база: `index.html`, `styles/site.css`, `assets/motion/animations.js`

## Freeze Snapshot (main)

- `d815cfe` — safe cleanup dead motion branches + reduced-motion cursor fix
- `9ab775a` — laser-hover consolidation (shared helper)
- `533ce5e` — motion tokens + carousel resize hardening
- `e56333d` — restore fractional Security counter behavior
- `a3b5513` — live reduced-motion toggle without page reload
- `4e32d6d` — static motion smoke-check tooling/docs

Эти коммиты считаются текущей baseline-цепочкой для визуальных и motion-проверок.

## Current Code Baseline (Extract)

### Capabilities

- label-bar: `min-height: 149px`, `padding-top: 120px`, нижняя full-width линия через `::after`
- intro: заголовок и copy в `capabilities-section__intro`
- panel: `grid-template-columns: 1fr 2fr`
- tabs: `href="#authentication|#reverse-proxy|#file-service|#notifications|#admin-panel"`

### Security

- top panel: `min-height: 304px`, 2 колонки
- performance strip: `min-height: 134px`, 4 колонки
- slider cards: `min-height: 231px`, 2 карточки на desktop
- pagination: dot `7x7`, 4 dots, кнопки `68x44`
- counter in metric: one-shot motion in `assets/motion/animations.js` (`10x -> 5x`) с reduced-motion guard

### Developers

- label-bar унифицирован с capabilities/security
- intro: `min-height: 600px`, grid-background 100x100, внутренний контейнер `min-height: 399px`
- highlights: `min-height: 369px`, 3 колонки
- ship-callout: отдельный нижний контейнер `min-height: 213px`

## Risk Areas (High Attention)

1. Толщина горизонтальных линий между секциями (визуально “double line” при наложении соседних border + pseudo-line).
2. Пересечение full-width pseudo-lines (`section-label-bar::after`) с border соседних контейнеров.
3. Security slider: правый край и нижняя граница в области пагинации.
4. Baseline alignment в `Threat Surface` (`Reduced` vs `5x`).
5. Developers: вертикальный ритм между intro/highlights/ship и плотность сетки.

## Viewport Check Matrix

### 390px

- Header sticky/mobile menu работает
- Якоря не ломаются
- Security slider: swipe + buttons + dots
- Нет горизонтального overflow

### 1024px

- Grid и линии не “двоятся” в переходах между секциями
- Capabilities tabs переключают контент без скролл-скачков
- Security counter читабелен, не дёргается

### 1440px

- Full-width линии визуально 1px и непрерывные
- Уголки/декоративные элементы не теряют контраст
- Developers композиция центрирована и совпадает с макетом по ритму

## Smoke Checklist After Each Batch

- `#solution`, `#how`, `#capabilities`, `#security`, `#developers`
- Hover/focus states CTA, links, tabs, slider controls
- Прелоадер -> скролл-анимации не ломаются
- Нет JS-ссылок на отсутствующие селекторы
- Нет `var(--token)` без определения
- Запуск `python3 scripts/motion_smoke_check.py` проходит без ошибок

## Execution Rule for Next Steps

- Один батч = одна зона (`Capabilities` или `Security` или `Developers`)
- После батча: визуальная проверка 390/1024/1440
- Только затем commit/push
