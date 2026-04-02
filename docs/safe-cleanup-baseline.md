# Safe Cleanup Baseline (Wave 1)

Дата: 2026-04-02  
Режим: `safe-only`  
Область: `index.html`, `platform/index.html`, `developers/index.html`, `styles/*`, `scripts/*`, `assets/*`

## Критерии удаления

- Селектор/класс не встречается в HTML и не используется JS как runtime-target.
- Asset не встречается в HTML/CSS/JS по имени файла.
- JS-ветка не имеет DOM-target в текущем runtime.
- Токен не участвует в активной `var(--*)` цепочке.

## Кандидаты (подтверждённые)

| Item | Где найден | Почему safe |
|---|---|---|
| `assets/favicon-dark.svg` | Файл в `assets/` | На страницах используется только `favicon-figma.svg`. |
| `assets/favicon-light.svg` | Файл в `assets/` | На страницах используется только `favicon-figma.svg`. |
| `assets/figma/Grid-Background-2.svg` | Файл в `assets/figma/` | Нет ссылок из HTML/CSS/JS. |
| `assets/figma/System-node-b.svg` | Файл в `assets/figma/` | Нет ссылок из HTML/CSS/JS. |
| `assets/figma/auth/icon-ai.svg` | Файл в `assets/figma/auth/` | Нет ссылок из HTML/CSS/JS (используется `icon-ai-header.svg`). |
| `assets/figma/auth/icon-otp.svg` | Файл в `assets/figma/auth/` | Нет ссылок из HTML/CSS/JS (используется `icon-otp-header.svg`). |
| `assets/header-social-corner-tr-default.svg` | Файл в `assets/` | Нет ссылок из HTML/CSS/JS. |
| `assets/icons/arrow-right-offwhite.svg` | Файл в `assets/icons/` | Нет ссылок из HTML/CSS/JS. |
| `initSystemNodeBDataFlow()` вызов | `assets/js/animations.js` | В текущем HTML нет `.system-node-b-flow`. |
| `initProblemGridImpulseFlow()` вызов | `assets/js/animations.js` | В текущем HTML нет `.problem-grid__impulse`. |
| `initHeroGridImpulseFlow()` вызов | `assets/js/animations.js` | В текущем HTML нет `.hero-section__impulse`. |
| `initHeroGridLaserHover()` вызов | `assets/js/animations.js` | В текущем HTML нет runtime-слоя для laser overlay в hero. |

## Примечания по рискам

- Полное удаление функций анимаций из файла допускается во 2-й волне.
- В 1-й волне удаляются только вызовы веток без DOM-target и orphan assets.
