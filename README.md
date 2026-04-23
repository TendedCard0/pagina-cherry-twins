Recapitulación completa en **Arch Linux** desde cero hasta correr el proyecto:

## 1. Instalar Node.js + npm
En Arch no instalas npm por separado normalmente, viene con Node.
Recomendado (LTS):
```bash
sudo pacman -Syu nodejs-lts-jod npm
```
Alternativa (no LTS):
```bash
sudo pacman -S nodejs npm
```

## 2. Verificar instalación
```bash
node -v
npm -v
```
Si ambos muestran versión, ya estás listo.

## 3. Ir a tu proyecto
```bash
cd ~/Documents/Trabajos\ visual/pagina-cherry-twins/
```

## 4. Instalar dependencias
```bash
npm install
```
Esto crea la carpeta `node_modules`.

## 5. Levantar el servidor de desarrollo
```bash
npm run dev
```

## 6. Abrir en navegador
```bash
http://localhost:3000
```

## 7. (Opcional) Dependencias extra si hay errores
Algunos paquetes necesitan compilar cosas:
```bash
sudo pacman -S python make gcc
```

## 8. Flujo real de trabajo (resumen corto)
Cada vez que abras el proyecto:
```bash
cd ruta/del/proyecto
npm run dev
```
(Solo haces `npm install` una vez o cuando cambien dependencias)

---------------------Iniciar base de latos en local-----------------------------
#Configuración de Base de Datos
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/Cherry_Twins
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=0000

# Configuración de Seguridad y Correo
export JWT_SECRET=esta_es_una_clave_secreta_muy_larga_y_segura_para_mi_proyecto_123456
export SMTP_HOST=localhost
export SMTP_PORT=587

#Iiniciar la base de datos 
./mvnw spring-boot:run
