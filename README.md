# TableGoFront

TableGoFront es la aplicación web frontend del proyecto TableGo, desarrollada con Angular. Incluye pantallas de inicio de sesión y registro, gestión de la sesión con token y navegación protegida según el rol del usuario. Hay rutas para los perfiles de administrador, cliente y recepcionista; sus pantallas principales están preparadas para incorporar las funcionalidades de cada perfil.

La autenticación se conecta con una API mediante la ruta `/api`. Durante el desarrollo, Angular reenvía esas solicitudes a `http://localhost:8080`, según la configuración de `proxy.conf.json`.

## Requisitos

- Node.js y npm.
- El backend del proyecto ejecutándose en `http://localhost:8080` para utilizar las funciones que requieren la API.

## Instalación y ejecución

Desde la raíz del proyecto, instala las dependencias y levanta el servidor de desarrollo:

```bash
npm install
npm start
```

Abre [http://localhost:4200](http://localhost:4200) en el navegador. El servidor recarga la aplicación cuando se modifican los archivos fuente.

## Comandos disponibles

```bash
npm start     # Iniciar el servidor de desarrollo
npm run build # Crear la compilación de producción
npm test      # Ejecutar las pruebas unitarias
```

La compilación se genera en el directorio `dist/`.
