import { createIcon } from "./icons.js";

const STATE_HOVER = "hover";
const STATE_ACTIVE = "active";
const ICON_SIZE_SM = 20;
const HEADER_DROPDOWN_ICON_WIDTH = 16.6667;
const HEADER_DROPDOWN_ICON_HEIGHT = 11.1298;
const HEADER_LOGO_WIDTH = 113.112;
const HEADER_LOGO_HEIGHT = 48;
const HEADER_SOCIAL_ICON_WIDTH = 20.099;
const HEADER_SOCIAL_ICON_HEIGHT = 17.17;

function isInteractiveState(state) {
  return state === STATE_HOVER || state === STATE_ACTIVE;
}

function applyPageCurrentState(element, state) {
  if (!isInteractiveState(state)) {
    return;
  }

  element.classList.add("is-hover");

  if (state === STATE_ACTIVE) {
    element.setAttribute("aria-current", "page");
  }
}

export function createPageNumberingButton(options = {}) {
  const {
    state = "default",
    className = "",
    ariaLabel = "Next page",
    iconDefault = "arrow-right",
    iconHover = "arrow-right-inverse",
  } = options;
  const button = document.createElement("button");
  const iconName = state === STATE_HOVER ? iconHover : iconDefault;

  button.type = "button";
  button.className = ["button-page-numbering", className]
    .filter(Boolean)
    .join(" ");
  button.setAttribute("aria-label", ariaLabel);

  if (state === STATE_HOVER) {
    button.classList.add("is-hover");
  }

  button.append(
    createIcon(iconName, {
      decorative: true,
      width: ICON_SIZE_SM,
      height: ICON_SIZE_SM,
    }),
  );

  return button;
}

export function createHeaderLogo(options = {}) {
  const {
    className = "",
    href = "/",
    src = "./assets/logo-authproxy-dark.svg",
    alt = "Auth Proxy Gate",
  } = options;
  const link = document.createElement("a");
  const image = document.createElement("img");

  link.className = ["site-header-logo", className].filter(Boolean).join(" ");
  link.href = href;
  link.setAttribute("aria-label", alt);

  image.src = src;
  image.alt = alt;
  image.decoding = "async";
  image.loading = "eager";
  image.width = HEADER_LOGO_WIDTH;
  image.height = HEADER_LOGO_HEIGHT;

  link.append(image);
  return link;
}

export function createHeaderLink(options = {}) {
  const {
    className = "",
    href = "#",
    label = "Link",
    state = "default",
  } = options;
  const link = document.createElement("a");

  link.className = ["site-header-link", className].filter(Boolean).join(" ");
  link.href = href;
  link.textContent = label;

  applyPageCurrentState(link, state);
  return link;
}

export function createHeaderLinkM2(options = {}) {
  const {
    className = "",
    href = "#",
    label = "Link",
    state = "default",
  } = options;
  const link = document.createElement("a");

  link.className = ["site-header-link-m2", className].filter(Boolean).join(" ");
  link.href = href;
  link.textContent = label;

  applyPageCurrentState(link, state);
  return link;
}

export function createHeaderDropdown(options = {}) {
  const {
    className = "",
    label = "Link",
    state = "default",
    expanded = false,
  } = options;
  const trigger = document.createElement("button");
  const text = document.createElement("span");
  const icon = createIcon("arrow-down", {
    className: "site-header-dropdown__icon",
    decorative: true,
    width: HEADER_DROPDOWN_ICON_WIDTH,
    height: HEADER_DROPDOWN_ICON_HEIGHT,
  });

  trigger.type = "button";
  trigger.className = ["site-header-dropdown", className].filter(Boolean).join(" ");
  trigger.setAttribute("aria-expanded", expanded ? "true" : "false");

  if (state === STATE_HOVER || expanded) {
    trigger.classList.add("is-hover");
  }

  text.textContent = label;
  trigger.append(text, icon);
  return trigger;
}

export function createHeaderButtonV1(options = {}) {
  const {
    className = "",
    label = "Link",
    state = "default",
    type = "button",
  } = options;
  const button = document.createElement("button");

  button.type = type;
  button.className = ["site-header-button-v1", className].filter(Boolean).join(" ");
  button.textContent = label;

  applyPageCurrentState(button, state);
  return button;
}

export function createHeaderButtonV2(options = {}) {
  const {
    className = "",
    label = "Link",
    state = "default",
    type = "button",
  } = options;
  const button = document.createElement("button");
  const text = document.createElement("span");
  const iconWrap = document.createElement("span");
  const icon = createIcon("arrow-right-offwhite", {
    className: "site-header-button-v2__icon",
    decorative: true,
    width: ICON_SIZE_SM,
    height: ICON_SIZE_SM,
  });

  button.type = type;
  button.className = ["site-header-button-v2", className].filter(Boolean).join(" ");

  applyPageCurrentState(button, state);

  text.textContent = label;
  iconWrap.className = "site-header-button-v2__icon-wrap";
  iconWrap.append(icon);
  button.append(text, iconWrap);

  return button;
}

export function createHeaderSocial(options = {}) {
  const {
    className = "",
    href = "#",
    label = "Telegram",
    state = "default",
  } = options;
  const link = document.createElement("a");
  const icon = createIcon("tg-header", {
    className: "site-header-social__icon",
    decorative: false,
    label,
    width: HEADER_SOCIAL_ICON_WIDTH,
    height: HEADER_SOCIAL_ICON_HEIGHT,
  });

  link.className = ["site-header-social", className].filter(Boolean).join(" ");
  link.href = href;
  link.setAttribute("aria-label", label);

  applyPageCurrentState(link, state);
  link.append(icon);
  return link;
}
