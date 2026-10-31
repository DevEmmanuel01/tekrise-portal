# Elevation & Shadow System: Tekrise Academy Portal

## 1. Shadow Token Specifications
All three elevation shadows are built from Tekrise Academy's deep brand forest tone **`#052C26`** (`rgb(5, 44, 38)`, `primary-10`) rather than pure black (`#000000`).

| Shadow Token | X Offset | Y Offset | Blur Radius | Spread Radius | Base Colour (`primary-10`) | Opacity | CSS Declaration | Primary Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`--shadow-soft`** | `0px` | `2px` | `6px` | `0px` | `#052C26` (`5, 44, 38`) | `8%` (`0.08`) | `0 2px 6px 0 rgba(5, 44, 38, 0.08)` | Resting cards, form input containers, cohort status rows |
| **`--shadow-medium`** | `0px` | `8px` | `20px` | `-2px` | `#052C26` (`5, 44, 38`) | `12%` (`0.12`) | `0 8px 20px -2px rgba(5, 44, 38, 0.12)` | Authentication card container, interactive hover states, dropdown menus |
| **`--shadow-hard`** | `0px` | `16px` | `36px` | `-4px` | `#052C26` (`5, 44, 38`) | `18%` (`0.18`) | `0 16px 36px -4px rgba(5, 44, 38, 0.18)` | Confirmation modals, tuition overdue lockout dialogs, floating notifications |

## 2. Why a Brand-Tinted Shadow Reads Differently from Pure Black
In the physical world, shadows are never pure grey (`#000000` with lowered alpha); they absorb ambient bounce light from the surrounding surfaces and the dominant pigment of the environment. When pure black (`rgba(0, 0, 0, 0.12)`) is composited over Tekrise Academy's cool-tinted surfaces (`#F7FCFF` and `#FFFFFF`) next to vibrant `#00E676` accents, the translucent black desaturates the boundary pixels into a muddy, lifeless charcoal smudge—whereas tinting the shadow with `#052C26` (`primary-10`) preserves chromatic harmony so elevated cards feel naturally lit within the same colour temperature.
