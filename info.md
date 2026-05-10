 Clonar el repo
  cd ~
  git clone git@github.com:Hugopvigo/TiempoWeb.git
  # Si no tienes SSH key configurada:
  # git clone https://github.com/Hugopvigo/TiempoWeb.git
  cd TiempoWeb

Crear .env con las API keys

  cp .env.example .env
  nano .env
  Pon tus claves reales:
  VITE_OWM_API_KEY=tu_clave_real
  VITE_AEMET_API_KEY=tu_clave_real

   docker compose --env-file ../.env up -d app --build
   o
    cp ../.env .

   Build y arranque del contenedor

  cd docker
  docker compose up -d app --build
  (Solo el servicio app, no el dev)

  Verificar que funciona localmente

  docker compose ps
  curl http://localhost:8080 | head -10

  Para el contenedor 
  docker compose down
  Levanta el contenedor
  docker compose up -d app --build
  Log del contenedor
  docker compose logs app | tail -5


   Crear el VirtualHost (En este caso, usa el tuyo propio)

   sudo nano /etc/apache2/sites-available/tiempo.hugopvigo.conf

  Pega esto (ajusta el subdominio si quieres otro):
  <VirtualHost *:80>
      ServerName tiempo.hugopvigo.es
      Redirect permanent / https://tiempo.hugopvigo.es/
  </VirtualHost>

  <VirtualHost *:443>
      ServerName tiempo.hugopvigo.es

      SSLEngine on
      SSLCertificateFile /etc/apache2/ssl/cloudflare.pem
      SSLCertificateKeyFile /etc/apache2/ssl/cloudflare-key.pem

      ProxyPreserveHost On
      ProxyPass / http://127.0.0.1:8080/
      ProxyPassReverse / http://127.0.0.1:8080/

      ErrorLog ${APACHE_LOG_DIR}/tiempo_error.log
      CustomLog ${APACHE_LOG_DIR}/tiempo_access.log combined
  </VirtualHost>

 Activar y recargar

  sudo a2ensite tiempo.hugopvigo.conf
  sudo apache2ctl configtest
  sudo systemctl reload apache2
  
