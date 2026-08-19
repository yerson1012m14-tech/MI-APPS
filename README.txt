XITFORGE - PRIMER PAQUETE ADMIN

Archivos:
- src/components/AdminView.tsx
- src/App.tsx
- server.ts
- data/xitforge.json

QUE HACE:
1) Activa el apartado Panel PC que ya existe en Navbar.
2) Permite crear opciones desde la web.
3) Permite ver y eliminar opciones.
4) Guarda las opciones en data/xitforge.json para que no se pierdan al reiniciar.
5) Mantiene los endpoints /api/xitforge/* para que después la IPA pueda consumirlos.

INSTALACION:
Copia estos archivos sobre el proyecto MI-APPS respetando sus rutas.
Luego ejecuta:
  npm install
  npm run dev

Abre:
  http://localhost:3000

IMPORTANTE:
- No se modificó Navbar.tsx porque ya trae el botón Panel PC.
- No se toca ninguna parte del motor de la IPA.
