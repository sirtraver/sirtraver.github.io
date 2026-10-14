# Publicar en un servidor propio

Requisitos: un servidor (VPS) con Docker y el dominio apuntando a su IP
(registros A/AAAA de `sirtraver.com` y `www.sirtraver.com`).

1. Copia la carpeta `site/` al servidor (o clona el repositorio).
2. Crea `site/.env` a partir de `.env.example` con los valores reales.
3. Desde `site/`:
   ```sh
   docker compose -f deploy/compose.yaml up -d --build
   ```
4. Caddy pide el certificado HTTPS automáticamente. Comprueba https://sirtraver.com.

Datos: las altas y los mensajes de contacto se guardan en el volumen `data`
(`/data/data.json`). Haz copia de ese archivo junto con el resto de copias.

Actualizar: después de cambiar contenido o código, en el servidor:
```sh
git pull && docker compose -f deploy/compose.yaml up -d --build
```

Sin Docker: Node ≥ 22, `npm ci && npm run build`, y `npm start` detrás de Caddy o nginx,
con `PUBLIC_ORIGIN=https://sirtraver.com` y `DATA_DIR` apuntando a una carpeta persistente.
Usa un gestor de procesos (systemd, pm2) para que se reinicie solo.
