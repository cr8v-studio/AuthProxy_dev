# AuthProxy_dev

Статический лендинг AuthProxy на HTML, CSS и JavaScript, готовый к публикации на GitHub Pages.

## Структура

- `index.html` — основная страница
- `styles/` — стили, токены, типографика и page-level layout
- `scripts/` — интерактивность сайта
- `assets/` — изображения, иконки и motion-скрипт
- `docs/` — служебная документация по компонентам
- `.github/workflows/deploy-pages.yml` — автодеплой в GitHub Pages

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
