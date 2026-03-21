# AuthProxy Design Inventory

## Purpose
Краткая карта активного production-слоя для статического лендинга AuthProxy.

## Baseline
- Baseline — текущий `main` в репозитории.
- Cleanup выполняется относительно фактического runtime (`index.html` + подключенные CSS/JS), а не архивных секций.

## Active Architecture
- Точка входа: `/Users/alexander/Desktop/Codex/AuthProxy_dev/index.html`
- Основные стили: `/Users/alexander/Desktop/Codex/AuthProxy_dev/styles/tokens.css`, `/Users/alexander/Desktop/Codex/AuthProxy_dev/styles/icons.css`, `/Users/alexander/Desktop/Codex/AuthProxy_dev/styles/typography.css`, `/Users/alexander/Desktop/Codex/AuthProxy_dev/styles/components.css`, `/Users/alexander/Desktop/Codex/AuthProxy_dev/styles/site.css`
- Runtime JS: `/Users/alexander/Desktop/Codex/AuthProxy_dev/scripts/site.js`, `/Users/alexander/Desktop/Codex/AuthProxy_dev/assets/js/animations.js`

## Token Layers
- `--figma-*`: исходные значения, синхронизированные из дизайна.
- Семантические токены: цвета, layout, spacing и motion-aliased значения.
- Компонентные токены: `--header-*`, `--hero-*`.

## Active Typography Utilities
- `.heading-hero`
- `.heading-xl`
- `.heading-md`
- `.heading-xs-caps`
- `.eyebrow`
- `.text-body-lg`

Остальные typography utilities сохранены как reserve-слой для будущих контентных обновлений и не считаются dead code автоматически.

## Active / Reserve Policy
- `Active runtime`: только то, что участвует в текущем рендере через `index.html` + подключенные CSS/JS.
- `Reserve layer`: заранее подготовленные utilities/tokens для будущих контентных сценариев; не удаляются автоматически.
- Любой cleanup по умолчанию затрагивает только `Active runtime`, если нет отдельного запроса на чистку reserve-слоя.

## Dead Code Criteria
- `Dead code` для этой кодовой базы: селектор/токен/JS-ветка, которые не используются в текущем runtime и не помечены как reserve.
- Для токенов применяется `safe active-only`: удаляются только orphaned aliases, не участвующие в computed styles.
- Figma/foundation/reserve слои не чистятся агрессивно без отдельного решения.

## Active Header Controls
- `.site-header-logo`
- `.site-header-link`
- `.site-header-link-m2`
- `.site-header-dropdown`
- `.site-header-button-v1`
- `.site-header-button-v2`

Все header controls используют общий токенизированный control-layer для typography, hover и corner-pattern состояний.

## Hero Structure
- `.hero-section__viewport`: desktop layout-shell для контролируемой высоты hero.
- `.hero-section__frame`: внешний контейнер hero на ширину страницы.
- `.hero-section__panel`
- `.hero-section__mockup-underlay`
- `.hero-section__lead-strip`
- `.hero-section__metrics-wrap`
- `.hero-section__cta-bar`

## Icons
- Активный слой иконок ограничен CSS-классом `.icon` и файлами из `/Users/alexander/Desktop/Codex/AuthProxy_dev/assets/icons/`.
- Иконки используются напрямую из HTML; отдельный JS-реестр исключён из production-слоя.

## Reuse Rules
- Сначала переиспользовать существующие токены, затем расширять компонентные токены.
- Не добавлять одноразовые layout-классы с числовыми именами.
- Если одно и то же hover/motion поведение нужно нескольким контролам, выносить его в общий слой, а не дублировать по селекторам.
