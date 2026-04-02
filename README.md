# AuthProxy_dev

Статический одностраничный сайт AuthProxy на HTML, CSS и JavaScript, готовый к публикации на GitHub Pages.

## Source of truth

- Контент-истина: [`docs/LANDING-AUTHPROXY.md`](./docs/LANDING-AUTHPROXY.md)
- Любые изменения текстов и иерархии секций сначала вносятся в `LANDING-AUTHPROXY.md`, затем в `index.html`.

## Project structure

- `index.html` — главная страница
- `styles/` — токены, типографика, компоненты и page-level стили
- `scripts/` — базовая интерактивность страницы
- `assets/` — визуальные ассеты и motion runtime
  - `assets/brand/` — логотипы и favicon
  - `assets/ui/header/` — corner-ассеты header controls
  - `assets/ui/icons/` — системные UI-иконки
  - `assets/sections/` — ассеты, привязанные к секциям (`hero`, `solution`, `how`)
  - `assets/illustrations/system/` — иллюстрации system nodes
  - `assets/motion/animations.js` — scroll/motion слой
- `docs/` — рабочая документация для handoff
  - `LANDING-AUTHPROXY.md` — canonical content/spec
  - `component-inventory.md` — active/reserve policy и инвентарь
  - `motion-smoke-check.md` — post-preloader motion-checklist
  - `responsive-playbook.md` — адаптивные правила
  - `archive/` — исторические документы (не runtime-истина)
- `.github/workflows/deploy-pages.yml` — автодеплой в GitHub Pages

## Runtime navigation

- Главная навигация содержит:
  - `Solution`
  - `How it Works`
  - `Capabilities`
  - `Security`
  - `Developers`
  - `Operations`
  - `Pricing`
  - `FAQ`

## Локальный запуск

### Вариант 1: открыть напрямую
Откройте `index.html` в браузере.

### Вариант 2: через локальный сервер
```bash
python3 -m http.server 8080
```

Откройте: `http://localhost:8080`

## Публикация на GitHub

Репозиторий уже подключён:

```bash
git remote -v
```

Push изменений:

```bash
git add .
git commit -m "Update landing"
git push origin main
```

## GitHub Pages

1. Откройте репозиторий на GitHub.
2. Перейдите в `Settings -> Pages`.
3. В `Build and deployment` выберите `Source: GitHub Actions`.
4. После push в `main` workflow `deploy-pages.yml` опубликует сайт автоматически.

## Примечания

- Проект без сборки и зависимостей.
- Все runtime-ссылки на HTML/CSS/JS/asssets должны оставаться валидными после рефакторинга.
- Сайт использует Google Fonts и ESM-зависимости с jsDelivr для анимаций.

## Safe-Only Refactor Guardrails

- Чистка по умолчанию выполняется только для `active runtime`.
- Reserve-слои (типографика/токены/подготовленные utilities) не удаляются автоматически.
- Перед удалением любого элемента выполняется референс-скан по `index + styles + scripts`.
- Первая волна JS-cleanup должна сначала отключать мёртвые вызовы, а не переписывать motion-архитектуру целиком.
