# Instrucciones para configurar WebCrawler-PromovidosAutomaticos

Lista de requisitos:
1- NodeJs instalado
2- Chrome instalado
3- Docker instalado

1- Copiar archivo `.env.example` y renombrar copia a `.env`

2- Dentro del archivo `.env` se deben especificar ciertas variables para el funcionamiento del crawler, a continuación se
detalla cada variable a configurar

NODE_ENV -> indica el ambiente de ejecución por defecto "production"
PROMOVIDOS_PATH -> Ruta del archivo excel que contiene los promovidos
USUARIO -> Usuario para acceder al sistema
PASS -> Contraseña para acceder al sistema
HEADLESS -> Bandera que indica si el crawler debe mostrar el navegador de forma oculta (por defecto 1)
MAX_CONCURRENCY -> Número de máximo de navegadores que se ejecutarán al mismo tiempo (por defecto 'auto', si el valor es auto el crawler tomará el número de núcleos de la computadora)
PROMOVIDOS_POR_LOTE -> Número de promovidos que se registrará a cada promotor en un ciclo del crawler
MONGO_CNN -> Cadena de conexión a la base de datos (por defecto "mongodb://localhost:5000/promovidos")

3- Ejecutar el siguiente comando en la consola `npm i` (este comando se encarga de instalar las dependencias)

4- Una vez configuradas todas las variables de entorno, se tiene que correr el siguiente comando `cd database/docker && docker-compose build && docker-compose up -d`, esto es para levantar una base de datos local que es necesaria para la ejecución del crawler.

5- Ejecutar el comando `npm run load`, esto cargará la base de datos local con los datos del excel de promovidos

6- Ejecutar el comando `npm start`, esto iniciará el proceso del crawler con gestor de procesos llamado PM2 y reiniciar la ejecución del crawler cuando este haya dado una vuelta por todas las zonas del usuario.

7- Para matar al crawler una vez se hayan alcanzado las métricas se utiliza el siguiente comando `pm2 stop WebCrawler-PromovidosAutomaticos && pm2 delete WebCrawler-PromovidosAutomaticos` 

Bonus:
* - Si se desea observar en tiempo real la actividad que está realizando el crawler se utiliza el siguiente comando `pm2 logs WebCrawler-PromovidosAutomaticos` 

* - El crawler puede generar un reporte excel con los promovidos que fueron registrados con el siguiente comando `npm run reporte`, los reportes se dejarán en la carpeta out/