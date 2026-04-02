# AuthProxy_dev

Статический сайт AuthProxy на HTML, CSS и JavaScript (single-page), готовый к публикации на GitHub Pages.

## Структура

- `index.html` — главная страница
- `styles/` — стили, токены, типографика и page-level layout
- `scripts/` — интерактивность сайта
- `assets/` — изображения, иконки и motion-скрипт
- `docs/` — служебная документация по компонентам
- `.github/workflows/deploy-pages.yml` — автодеплой в GitHub Pages

## Контент и навигация

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
- Все проверенные HTML/CSS/JS-ссылки и пути к ассетам валидны.
- Основные иллюстрации подключены в формате `.webp`.
- Сайт использует Google Fonts и ESM-зависимости с jsDelivr для анимаций.

## Safe-Only Refactor Guardrails

- Чистка по умолчанию выполняется только для `active runtime`.
- Reserve-слои (типографика/токены/подготовленные utilities) не удаляются автоматически.
- Перед удалением любого элемента выполняется референс-скан по `index + styles + scripts`.
- Первая волна JS-cleanup должна сначала отключать мёртвые вызовы, а не переписывать motion-архитектуру целиком.
