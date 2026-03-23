# AuthProxy_dev

Статический сайт AuthProxy на HTML, CSS и JavaScript (multi-page), готовый к публикации на GitHub Pages.

## Структура

- `index.html` — главная страница
- `platform/index.html` — страница Platform
- `developers/index.html` — страница Developers
- `styles/` — стили, токены, типографика и page-level layout
- `scripts/` — интерактивность сайта
- `assets/` — изображения, иконки и motion-скрипт
- `docs/LANDING-AUTHPROXY.md` — источник истины по структуре и текстам (source of truth)
- `docs/` — служебная документация по компонентам
- `.github/workflows/deploy-pages.yml` — автодеплой в GitHub Pages

## Контент и навигация

- Контент и порядок секций синхронизируются строго по `docs/LANDING-AUTHPROXY.md`.
- Главная навигация содержит:
  - `Problem`
  - `How it Works`
  - `Platform` (dropdown)
  - `Developers` (dropdown)
  - `Security`
  - `Pricing`
  - `Quick Start`
  - `FAQ`
- На `platform` и `developers` используется тот же header/nav shell и та же логика dropdown/mobile menu.

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
