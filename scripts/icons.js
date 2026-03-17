const ICON_BASE_PATH = "./assets/icons";

export const ICONS = Object.freeze({
  "arrow-down": {
    src: `${ICON_BASE_PATH}/arrow-down.svg`,
    width: 16.6667,
    height: 11.1298,
  },
  "arrow-right": {
    src: `${ICON_BASE_PATH}/arrow-right.svg`,
    width: 11.1298,
    height: 16.6667,
  },
  "arrow-right-inverse": {
    src: `${ICON_BASE_PATH}/arrow-right-inverse.svg`,
    width: 11.1298,
    height: 16.6667,
  },
  "arrow-right-offwhite": {
    src: `${ICON_BASE_PATH}/arrow-right-offwhite.svg`,
    width: 11.1298,
    height: 16.6667,
  },
  "arrow-up": {
    src: `${ICON_BASE_PATH}/arrow-up.svg`,
    width: 17.7001,
    height: 17.7281,
  },
  "figure-2": {
    src: `${ICON_BASE_PATH}/figure-2.svg`,
    width: 20,
    height: 20,
  },
  tg: {
    src: `${ICON_BASE_PATH}/tg.svg`,
    width: 20.0988,
    height: 17.17,
  },
  "tg-header": {
    src: `${ICON_BASE_PATH}/tg-header.svg`,
    width: 20.099,
    height: 17.17,
  },
  "vector-1": {
    src: `${ICON_BASE_PATH}/vector-1.svg`,
    width: 9.8995,
    height: 16.9706,
  },
  "vector-2": {
    src: `${ICON_BASE_PATH}/vector-2.svg`,
    width: 40,
    height: 40,
  },
  "vector-3": {
    src: `${ICON_BASE_PATH}/vector-3.svg`,
    width: 40,
    height: 39.9966,
  },
  "vector-4": {
    src: `${ICON_BASE_PATH}/vector-4.svg`,
    width: 40,
    height: 40,
  },
  "vector-5": {
    src: `${ICON_BASE_PATH}/vector-5.svg`,
    width: 40,
    height: 40,
  },
  "vector-6": {
    src: `${ICON_BASE_PATH}/vector-6.svg`,
    width: 40,
    height: 40,
  },
});

export const ICON_ALIASES = Object.freeze({
  arrow_down: "arrow-down",
  arrow_right: "arrow-right",
  arrow_right_inverse: "arrow-right-inverse",
  arrow_right_offwhite: "arrow-right-offwhite",
  Arrow_up: "arrow-up",
  figure_2: "figure-2",
  tg_header: "tg-header",
  Vector_1: "vector-1",
  Vector_2: "vector-2",
  Vector_3: "vector-3",
  Vector_4: "vector-4",
  Vector_5: "vector-5",
  Vector_6: "vector-6",
});

export function resolveIconName(name) {
  return ICONS[name] ? name : ICON_ALIASES[name] || null;
}

export function getIconDefinition(name) {
  const resolvedName = resolveIconName(name);
  if (!resolvedName) {
    throw new Error(`Unknown icon: ${name}`);
  }

  return {
    name: resolvedName,
    ...ICONS[resolvedName],
  };
}

export function createIcon(name, options = {}) {
  const {
    className = "",
    decorative = true,
    label = "",
    width,
    height,
  } = options;
  const icon = getIconDefinition(name);
  const img = document.createElement("img");

  img.className = ["icon", className].filter(Boolean).join(" ");
  img.src = icon.src;
  img.width = width ?? icon.width;
  img.height = height ?? icon.height;
  img.decoding = "async";
  img.loading = "lazy";
  img.dataset.icon = icon.name;

  if (decorative) {
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
  } else {
    img.alt = label || icon.name;
  }

  return img;
}

export function mountIcons(root = document) {
  const targets = root.querySelectorAll("[data-icon]");

  targets.forEach((node) => {
    if (node.dataset.iconMounted === "true") {
      return;
    }

    const width = node.dataset.iconWidth
      ? Number(node.dataset.iconWidth)
      : undefined;
    const height = node.dataset.iconHeight
      ? Number(node.dataset.iconHeight)
      : undefined;
    const icon = createIcon(node.dataset.icon, {
      className: node.dataset.iconClass || "",
      decorative: !node.hasAttribute("aria-label"),
      label: node.getAttribute("aria-label") || "",
      width,
      height,
    });

    node.replaceChildren(icon);
    node.dataset.iconMounted = "true";
  });
}
