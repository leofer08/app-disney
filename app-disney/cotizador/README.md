# App Viajes a Disney

App web instalable (PWA) para clientes de la agencia: arman su viaje, ven cuánto van a caminar en cada parque y se ubican con el GPS del celular. El pedido llega al agente por WhatsApp.

## Qué tocar

| Querés cambiar… | Archivo |
|---|---|
| Nombre de la agencia, WhatsApp, email | `config.js` |
| Precios, parques, km, tips, hoteles, extras | `data.js` |
| Colores y tipografías | `styles.css` (bloque `:root` arriba) |
| Textos de pantalla | `index.html` |

Después de cualquier cambio, subí la versión en `sw.js` (`v1` → `v2`) para que los celulares que ya la instalaron bajen lo nuevo.

## Archivos

- `index.html` · pantallas
- `app.js` · lógica (cotizador, gráficos, mapa y GPS)
- `config.js` · datos de la agencia
- `data.js` · datos de parques y precios
- `styles.css` · diseño
- `manifest.webmanifest`, `sw.js`, `icons/` · lo que la hace instalable y usable sin señal
- `vendor/leaflet/` · librería del mapa (OpenStreetMap)

## Publicación

Se publica gratis con GitHub Pages desde la rama `main`. El GPS solo funciona con `https://`, que GitHub Pages ya da.

## Probar en la compu

Abrir `index.html` directo funciona para casi todo, pero el GPS y la instalación necesitan servidor:

```
cd Documents\app-disney
python -m http.server 8000
```

y entrar a http://localhost:8000
