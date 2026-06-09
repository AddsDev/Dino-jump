FROM jenkins/jenkins:lts
USER root

# Instalar dependencias para configurar el repositorio de Docker
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Agregar la clave GPG oficial de Docker y configurar el repositorio
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar el cliente de Docker (docker-ce-cli)
RUN apt-get update && apt-get install -y docker-ce-cli

# Configurar Git para confiar en todos los directorios (evita errores de safe.directory)
RUN git config --global --add safe.directory "*"

# Volver al usuario Jenkins por defecto por seguridad e instalar la config de git para él también
USER jenkins
RUN git config --global --add safe.directory "*"
