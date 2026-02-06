import { useEffect, useCallback } from "react";

interface CurrentTheme {
  idleBase: string;
  idleStroke: string;

  primary: string;
  secondary: string;
  colorAccent: string;

  spinner: string;
  startGradient: string;
  endGradient: string;
}

function cssVar(name: string, fallback: string): string {
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return val || fallback;
}

function darkenHex(hex: string, percent: number): string {
  const n = hex.replace("#", "");
  const r = Math.max(0, Math.round(parseInt(n.substring(0, 2), 16) * (1 - percent / 100)));
  const g = Math.max(0, Math.round(parseInt(n.substring(2, 4), 16) * (1 - percent / 100)));
  const b = Math.max(0, Math.round(parseInt(n.substring(4, 6), 16) * (1 - percent / 100)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function resolvePalette(): CurrentTheme {
  const brandPrimary = cssVar("--brand-primary-hex", "#d7c7e7");

  return {
    idleBase: cssVar("--foreground-hex", "#1a1a1a"),
    idleStroke: cssVar("--background-hex", "#f1eee8"),

    primary: brandPrimary,
    secondary: darkenHex(brandPrimary, 12),
    colorAccent: darkenHex(brandPrimary, 24),

    spinner: cssVar("--muted-hex", "#e5e2db"),
    startGradient: brandPrimary,
    endGradient: cssVar("--brand-secondary-hex", "#ffdab9"),
  };
}

function buildIdleCursor(palette: CurrentTheme): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <defs>
    <filter id="idle-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feFlood flood-color="${palette.primary}" flood-opacity="0.6"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <path d="M5.5 3.21V20.8L10.3 16.05L13.5 22.8L16.4 21.43L13.2 14.68H20.22L5.5 3.21Z" 
        fill="${palette.idleBase}" 
        stroke="${palette.idleStroke}" 
        stroke-width="1"
        filter="url(#idle-glow)"/>
</svg>`;
}

function buildPointerCursor(palette: CurrentTheme): string {
  return `<svg width="23" height="21" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="path-1-inside-1_16_22" fill="white">
<path d="M7.92578 0C8.35113 -0.000899178 8.73144 0.148188 9.0332 0.448242C9.33478 0.748305 9.48585 1.12781 9.48438 1.55273V9.5H10.6006V5.7627C10.6007 5.33764 10.7506 4.95776 11.0527 4.6582C11.3538 4.35972 11.7334 4.21193 12.1572 4.21094C12.5829 4.20997 12.9637 4.3588 13.2656 4.65918C13.567 4.95909 13.7172 5.33807 13.7158 5.7627V9.5H14.832V6.81543C14.8321 6.39033 14.983 6.01052 15.2852 5.71094C15.5861 5.41269 15.9651 5.26373 16.3887 5.2627C16.8144 5.2617 17.1951 5.4115 17.4971 5.71191C17.7985 6.01186 17.9496 6.39072 17.9482 6.81543V9.5H19.0635V8.9209C19.0635 8.49572 19.2144 8.11604 19.5166 7.81641C19.8176 7.51806 20.1965 7.36926 20.6201 7.36816C21.0458 7.36717 21.4266 7.51697 21.7285 7.81738C22.03 8.11738 22.1811 8.49608 22.1797 8.9209V16.2891C22.1797 17.5814 21.711 18.6998 20.7891 19.6172C19.8672 20.5344 18.7447 20.9999 17.4482 21H9.98926C9.43991 21 8.91386 20.8825 8.41602 20.6494C7.97902 20.4448 7.59797 20.1657 7.27637 19.8135L7.14258 19.6582L0.291992 11.2637L0 10.9053L0.333984 10.5859L1.02148 9.92773C1.43278 9.52137 1.93118 9.27928 2.50098 9.21387C3.07759 9.14778 3.61372 9.28212 4.08496 9.61523L6.36816 11.2002V1.55273C6.36816 1.12751 6.51909 0.747905 6.82129 0.448242C7.12238 0.149701 7.50191 0.000994682 7.92578 0Z"/>
</mask>
<path d="M7.92578 0C8.35113 -0.000899178 8.73144 0.148188 9.0332 0.448242C9.33478 0.748305 9.48585 1.12781 9.48438 1.55273V9.5H10.6006V5.7627C10.6007 5.33764 10.7506 4.95776 11.0527 4.6582C11.3538 4.35972 11.7334 4.21193 12.1572 4.21094C12.5829 4.20997 12.9637 4.3588 13.2656 4.65918C13.567 4.95909 13.7172 5.33807 13.7158 5.7627V9.5H14.832V6.81543C14.8321 6.39033 14.983 6.01052 15.2852 5.71094C15.5861 5.41269 15.9651 5.26373 16.3887 5.2627C16.8144 5.2617 17.1951 5.4115 17.4971 5.71191C17.7985 6.01186 17.9496 6.39072 17.9482 6.81543V9.5H19.0635V8.9209C19.0635 8.49572 19.2144 8.11604 19.5166 7.81641C19.8176 7.51806 20.1965 7.36926 20.6201 7.36816C21.0458 7.36717 21.4266 7.51697 21.7285 7.81738C22.03 8.11738 22.1811 8.49608 22.1797 8.9209V16.2891C22.1797 17.5814 21.711 18.6998 20.7891 19.6172C19.8672 20.5344 18.7447 20.9999 17.4482 21H9.98926C9.43991 21 8.91386 20.8825 8.41602 20.6494C7.97902 20.4448 7.59797 20.1657 7.27637 19.8135L7.14258 19.6582L0.291992 11.2637L0 10.9053L0.333984 10.5859L1.02148 9.92773C1.43278 9.52137 1.93118 9.27928 2.50098 9.21387C3.07759 9.14778 3.61372 9.28212 4.08496 9.61523L6.36816 11.2002V1.55273C6.36816 1.12751 6.51909 0.747905 6.82129 0.448242C7.12238 0.149701 7.50191 0.000994682 7.92578 0Z" fill="${palette.idleBase}"/>
<path d="M7.92578 0L7.92367 -0.999998L7.92343 -0.999997L7.92578 0ZM9.0332 0.448242L9.73853 -0.260639L9.7383 -0.260871L9.0332 0.448242ZM9.48438 1.55273L8.48438 1.54926V1.55273H9.48438ZM9.48438 9.5H8.48438V10.5H9.48438V9.5ZM10.6006 9.5V10.5H11.6006V9.5H10.6006ZM10.6006 5.7627L9.60059 5.76244V5.7627H10.6006ZM11.0527 4.6582L10.3487 3.94804L10.3486 3.9481L11.0527 4.6582ZM12.1572 4.21094L12.155 3.21094L12.1549 3.21094L12.1572 4.21094ZM13.2656 4.65918L13.971 3.95039L13.971 3.9503L13.2656 4.65918ZM13.7158 5.7627L12.7158 5.75954V5.7627H13.7158ZM13.7158 9.5H12.7158V10.5H13.7158V9.5ZM14.832 9.5V10.5H15.832V9.5H14.832ZM14.832 6.81543L13.832 6.81523V6.81543H14.832ZM15.2852 5.71094L14.5813 5.0006L14.5811 5.00083L15.2852 5.71094ZM16.3887 5.2627L16.3863 4.2627H16.3862L16.3887 5.2627ZM17.4971 5.71191L18.2024 5.00307L18.2024 5.00303L17.4971 5.71191ZM17.9482 6.81543L16.9482 6.81222V6.81543H17.9482ZM17.9482 9.5H16.9482V10.5H17.9482V9.5ZM19.0635 9.5V10.5H20.0635V9.5H19.0635ZM19.0635 8.9209L18.0635 8.92081V8.9209H19.0635ZM19.5166 7.81641L18.8126 7.10622L18.8125 7.1063L19.5166 7.81641ZM20.6201 7.36816L20.6178 6.36817L20.6175 6.36817L20.6201 7.36816ZM21.7285 7.81738L22.4339 7.10852L22.4338 7.1085L21.7285 7.81738ZM22.1797 8.9209L21.1797 8.91757V8.9209H22.1797ZM20.7891 19.6172L21.4944 20.3261L21.4944 20.326L20.7891 19.6172ZM17.4482 21V22H17.4483L17.4482 21ZM9.98926 21L9.98919 22H9.98926V21ZM8.41602 20.6494L7.99196 21.5551L7.99197 21.5551L8.41602 20.6494ZM7.27637 19.8135L6.51879 20.4662L6.52821 20.4771L6.53793 20.4878L7.27637 19.8135ZM7.14258 19.6582L6.36782 20.2905L6.37628 20.3008L6.38501 20.311L7.14258 19.6582ZM0.291992 11.2637L-0.483281 11.8953L-0.482764 11.8959L0.291992 11.2637ZM0 10.9053L-0.691079 10.1825L-1.35868 10.8208L-0.775273 11.5369L0 10.9053ZM0.333984 10.5859L1.02506 11.3087L1.02553 11.3083L0.333984 10.5859ZM1.02148 9.92773L1.71303 10.6501L1.71872 10.6446L1.72431 10.6391L1.02148 9.92773ZM2.50098 9.21387L2.3871 8.22037L2.38692 8.22039L2.50098 9.21387ZM4.08496 9.61523L3.50771 10.4318L3.51471 10.4367L4.08496 9.61523ZM6.36816 11.2002L5.79791 12.0217L7.36816 13.1117V11.2002H6.36816ZM6.82129 0.448242L6.1172 -0.261864L6.11717 -0.26184L6.82129 0.448242ZM7.92578 0L7.9279 0.999998C8.10055 0.999633 8.22276 1.0526 8.32811 1.15736L9.0332 0.448242L9.7383 -0.260871C9.24012 -0.756229 8.60171 -1.00143 7.92367 -0.999998L7.92578 0ZM9.0332 0.448242L8.32788 1.15712C8.43317 1.26189 8.48496 1.38187 8.48438 1.54926L9.48438 1.55273L10.4844 1.55621C10.4867 0.873745 10.2364 0.234724 9.73853 -0.260639L9.0332 0.448242ZM9.48438 1.55273H8.48438V9.5H9.48438H10.4844V1.55273H9.48438ZM9.48438 9.5V10.5H10.6006V9.5V8.5H9.48438V9.5ZM10.6006 9.5H11.6006V5.7627H10.6006H9.60059V9.5H10.6006ZM10.6006 5.7627L11.6006 5.76295C11.6006 5.59044 11.6538 5.47048 11.7568 5.36831L11.0527 4.6582L10.3486 3.9481C9.84745 4.44504 9.60076 5.08484 9.60059 5.76244L10.6006 5.7627ZM11.0527 4.6582L11.7568 5.36837C11.8607 5.26537 11.9835 5.21135 12.1596 5.21093L12.1572 4.21094L12.1549 3.21094C11.4833 3.21252 10.847 3.45408 10.3487 3.94804L11.0527 4.6582ZM12.1572 4.21094L12.1595 5.21094C12.3332 5.21054 12.4555 5.26375 12.5603 5.36806L13.2656 4.65918L13.971 3.9503C13.472 3.45384 12.8326 3.2094 12.155 3.21094L12.1572 4.21094ZM13.2656 4.65918L12.5602 5.36797C12.6646 5.47184 12.7164 5.5911 12.7158 5.75954L13.7158 5.7627L14.7158 5.76585C14.718 5.08504 14.4693 4.44633 13.971 3.95039L13.2656 4.65918ZM13.7158 5.7627H12.7158V9.5H13.7158H14.7158V5.7627H13.7158ZM13.7158 9.5V10.5H14.832V9.5V8.5H13.7158V9.5ZM14.832 9.5H15.832V6.81543H14.832H13.832V9.5H14.832ZM14.832 6.81543L15.832 6.81563C15.8321 6.64483 15.885 6.52439 15.9893 6.42104L15.2852 5.71094L14.5811 5.00083C14.081 5.49665 13.8322 6.13584 13.832 6.81523L14.832 6.81543ZM15.2852 5.71094L15.989 6.42128C16.0946 6.31668 16.2177 6.26311 16.3911 6.26269L16.3887 5.2627L16.3862 4.2627C15.7124 4.26434 15.0777 4.5087 14.5813 5.0006L15.2852 5.71094ZM16.3887 5.2627L16.391 6.26269C16.563 6.26229 16.6857 6.31529 16.7917 6.4208L17.4971 5.71191L18.2024 5.00303C17.7046 4.50771 17.0658 4.2611 16.3863 4.2627L16.3887 5.2627ZM17.4971 5.71191L16.7917 6.42076C16.8972 6.52577 16.9488 6.64537 16.9482 6.81222L17.9482 6.81543L18.9482 6.81864C18.9504 6.13606 18.6997 5.49795 18.2024 5.00307L17.4971 5.71191ZM17.9482 6.81543H16.9482V9.5H17.9482H18.9482V6.81543H17.9482ZM17.9482 9.5V10.5H19.0635V9.5V8.5H17.9482V9.5ZM19.0635 9.5H20.0635V8.9209H19.0635H18.0635V9.5H19.0635ZM19.0635 8.9209L20.0635 8.92099C20.0635 8.75027 20.1164 8.62997 20.2207 8.52651L19.5166 7.81641L18.8125 7.1063C18.3125 7.60211 18.0635 8.24117 18.0635 8.92081L19.0635 8.9209ZM19.5166 7.81641L20.2206 8.5266C20.3259 8.42225 20.4489 8.36861 20.6227 8.36816L20.6201 7.36816L20.6175 6.36817C19.9441 6.36991 19.3092 6.61388 18.8126 7.10622L19.5166 7.81641ZM20.6201 7.36816L20.6225 8.36816C20.7944 8.36776 20.9172 8.42076 21.0232 8.52627L21.7285 7.81738L22.4338 7.1085C21.936 6.61318 21.2972 6.36657 20.6178 6.36817L20.6201 7.36816ZM21.7285 7.81738L21.0232 8.52625C21.1288 8.63135 21.1802 8.75076 21.1797 8.91757L22.1797 8.9209L23.1797 8.92423C23.182 8.2414 22.9312 7.60341 22.4339 7.10852L21.7285 7.81738ZM22.1797 8.9209H21.1797V16.2891H22.1797H23.1797V8.9209H22.1797ZM22.1797 16.2891H21.1797C21.1797 17.3123 20.8192 18.1765 20.0837 18.9083L20.7891 19.6172L21.4944 20.326C22.6028 19.2232 23.1797 17.8505 23.1797 16.2891H22.1797ZM20.7891 19.6172L20.0837 18.9083C19.3481 19.6403 18.4787 19.9999 17.4482 20L17.4482 21L17.4483 22C19.0107 21.9999 20.3863 21.4286 21.4944 20.3261L20.7891 19.6172ZM17.4482 21V20H9.98926V21V22H17.4482V21ZM9.98926 21L9.98932 20C9.58702 20 9.20566 19.915 8.84006 19.7438L8.41602 20.6494L7.99197 21.5551C8.62206 21.8501 9.29281 22 9.98919 22L9.98926 21ZM8.41602 20.6494L8.84007 19.7438C8.52003 19.5939 8.24634 19.3927 8.01481 19.1392L7.27637 19.8135L6.53793 20.4878C6.9496 20.9386 7.43801 21.2957 7.99196 21.5551L8.41602 20.6494ZM7.27637 19.8135L8.03394 19.1607L7.90015 19.0055L7.14258 19.6582L6.38501 20.311L6.51879 20.4662L7.27637 19.8135ZM7.14258 19.6582L7.91733 19.0259L1.06675 10.6314L0.291992 11.2637L-0.482764 11.8959L6.36782 20.2905L7.14258 19.6582ZM0.291992 11.2637L1.06727 10.632L0.775273 10.2736L0 10.9053L-0.775273 11.5369L-0.483281 11.8953L0.291992 11.2637ZM0 10.9053L0.691079 11.6281L1.02506 11.3087L0.333984 10.5859L-0.357094 9.86316L-0.691079 10.1825L0 10.9053ZM0.333984 10.5859L1.02553 11.3083L1.71303 10.6501L1.02148 9.92773L0.329936 9.2054L-0.357564 9.86361L0.333984 10.5859ZM1.02148 9.92773L1.72431 10.6391C1.97985 10.3866 2.27224 10.2467 2.61504 10.2073L2.50098 9.21387L2.38692 8.22039C1.59012 8.31187 0.885715 8.65612 0.318656 9.21638L1.02148 9.92773ZM2.50098 9.21387L2.61485 10.2074C2.9516 10.1688 3.24088 10.2432 3.50773 10.4318L4.08496 9.61523L4.66219 8.79866C3.98657 8.32106 3.20357 8.12679 2.3871 8.22037L2.50098 9.21387ZM4.08496 9.61523L3.51471 10.4367L5.79791 12.0217L6.36816 11.2002L6.93842 10.3787L4.65521 8.79376L4.08496 9.61523ZM6.36816 11.2002H7.36816V1.55273H6.36816H5.36816V11.2002H6.36816ZM6.36816 1.55273H7.36816C7.36816 1.38213 7.42097 1.26189 7.52541 1.15832L6.82129 0.448242L6.11717 -0.26184C5.61721 0.233922 5.36816 0.872897 5.36816 1.55273H6.36816ZM6.82129 0.448242L7.52538 1.15835C7.63035 1.05427 7.75363 1.00041 7.92813 0.999997L7.92578 0L7.92343 -0.999997C7.2502 -0.998417 6.61441 -0.754866 6.1172 -0.261864L6.82129 0.448242Z" fill="${palette.idleBase}" mask="url(#path-1-inside-1_16_22)"/>
</svg>
`;
}

function buildTextCursor(palette: CurrentTheme): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="28" viewBox="0 0 24 32">
  <defs>
    <filter id="tg" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="0.6" result="b"/>
      <feFlood flood-color="${palette.primary}" flood-opacity="0.45" result="c"/>
      <feComposite in="c" in2="b" operator="in" result="gc"/>
      <feMerge><feMergeNode in="gc"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g filter="url(#tg)">
    <!-- Top serif bar -->
    <line x1="6" y1="4" x2="18" y2="4" stroke="${palette.idleBase}" stroke-width="2.2" stroke-linecap="round"/>
    <!-- Top serif ends -->
    <line x1="6" y1="2.5" x2="6" y2="6" stroke="${palette.idleBase}" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="18" y1="2.5" x2="18" y2="6" stroke="${palette.idleBase}" stroke-width="1.6" stroke-linecap="round"/>
    <!-- Main beam -->
    <line x1="12" y1="4" x2="12" y2="28" stroke="${palette.idleBase}" stroke-width="2.4" stroke-linecap="round"/>
    <!-- Bottom serif bar -->
    <line x1="6" y1="28" x2="18" y2="28" stroke="${palette.idleBase}" stroke-width="2.2" stroke-linecap="round"/>
    <!-- Bottom serif ends -->
    <line x1="6" y1="26" x2="6" y2="29.5" stroke="${palette.idleBase}" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="18" y1="26" x2="18" y2="29.5" stroke="${palette.idleBase}" stroke-width="1.6" stroke-linecap="round"/>
  </g>
</svg>`;
}

function buildLoadingCursor(palette: CurrentTheme): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.startGradient}"/>
      <stop offset="100%" stop-color="${palette.endGradient}"/>
    </linearGradient>
  </defs>
  <!-- Background track -->
  <circle cx="32" cy="32" r="28" fill="transparent" stroke="${palette.spinner}" stroke-width="6"/>
  <!-- Animated progress arc -->
  <circle cx="32" cy="32" r="28" fill="transparent" 
          stroke="url(#spinner-gradient)" 
          stroke-width="6" 
          stroke-dasharray="175.9" 
          stroke-dashoffset="60" 
          stroke-linecap="round"
          transform="rotate(-90 32 32)">
    <animateTransform 
      attributeName="transform" 
      type="rotate" 
      from="-90 32 32" 
      to="270 32 32" 
      dur="1s" 
      repeatCount="indefinite"/>
  </circle>
</svg>`;
}

function buildWaitCursor(palette: CurrentTheme): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="wait-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.startGradient}"/>
      <stop offset="100%" stop-color="${palette.endGradient}"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="transparent" stroke="${palette.spinner}" stroke-width="6"/>
  <circle cx="32" cy="32" r="28" fill="transparent" 
          stroke="url(#wait-gradient)" 
          stroke-width="6" 
          stroke-dasharray="175.9" 
          stroke-dashoffset="60" 
          stroke-linecap="round"
          transform="rotate(-90 32 32)"/>
</svg>`;
}

function svgToDataUri(svg: string): string {
  // Remove extra whitespace and newlines
  const cleaned = svg.replace(/\s+/g, " ").trim();
  // Encode for data URI
  const encoded = encodeURIComponent(cleaned)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `url("data:image/svg+xml,${encoded}")`;
}

function buildStyleSheet(palette: CurrentTheme): string {
  const idle = svgToDataUri(buildIdleCursor(palette));
  const pointer = svgToDataUri(buildPointerCursor(palette));
  const text = svgToDataUri(buildTextCursor(palette));
  const loading = svgToDataUri(buildLoadingCursor(palette));
  const wait = svgToDataUri(buildWaitCursor(palette));

  return `
/* ===== Brand Cursors (Theme-aware) ===== */

*, *::before, *::after {
  cursor: ${idle} 5 3, auto;
}

/* Pointer/Clickable elements */
a, button, label[for], select, summary,
[role="button"], [role="link"], [role="tab"],
[role="menuitem"], [role="option"],
[type="checkbox"], [type="radio"],
[type="submit"], [type="reset"], [type="button"],
.cursor-pointer {
  cursor: ${pointer} 14 14, pointer !important;
}

/* Text input elements */
input[type="text"], input[type="password"],
input[type="email"], input[type="number"],
input[type="search"], input[type="tel"],
input[type="url"], input:not([type]),
textarea, [contenteditable="true"],
[role="textbox"], .cursor-text {
  cursor: ${text} 10 14, text !important;
}

/* Loading states */
[aria-busy="true"], .cursor-wait {
  cursor: ${loading} 16 16, wait !important;
}

.cursor-progress {
  cursor: ${wait} 16 16, progress !important;
}

/* Drag states */
[draggable="true"], .cursor-grab {
  cursor: ${pointer} 14 14, grab !important;
}

.cursor-grabbing {
  cursor: ${pointer} 14 14, grabbing !important;
}

/* Disabled elements - use default browser cursor */
[disabled], [aria-disabled="true"], .cursor-not-allowed {
  cursor: not-allowed !important;
}
`;
}


const STYLE_ID = "brand-cursors";

export function useBrandCursors() {
  const applyStyles = useCallback(() => {
    const palette = resolvePalette();

    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = buildStyleSheet(palette);
  }, []);

  useEffect(() => {
    applyStyles();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          applyStyles();
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [applyStyles]);
}
