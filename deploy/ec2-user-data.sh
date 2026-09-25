#!/bin/bash
# User data de EC2 (Amazon Linux 2023): instala Docker y levanta Pedidos360 con docker compose.
# Uso: pegar en "Advanced details > User data" al lanzar la instancia, o ejecutar como root.
set -eux
exec > /var/log/pedidos360-setup.log 2>&1

dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user

# Plugins de Docker: compose y buildx (Amazon Linux no los trae)
PLUGINS=/usr/local/lib/docker/cli-plugins
mkdir -p $PLUGINS
curl -sSL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o $PLUGINS/docker-compose
BUILDX=$(curl -s https://api.github.com/repos/docker/buildx/releases/latest | grep -o '"tag_name": *"[^"]*"' | grep -o 'v[0-9.]*')
curl -sSL https://github.com/docker/buildx/releases/download/$BUILDX/buildx-$BUILDX.linux-amd64 -o $PLUGINS/docker-buildx
chmod +x $PLUGINS/docker-compose $PLUGINS/docker-buildx

# Código y variables (la clave de MySQL se genera al azar y queda solo en la instancia)
cd /opt
git clone https://github.com/b2re/EP1-Cloud-Native.git pedidos360
cd pedidos360
cp .env.example .env
sed -i "s/^MYSQL_ROOT_PASSWORD=.*/MYSQL_ROOT_PASSWORD=$(openssl rand -hex 16)/" .env
chmod 600 .env

docker compose up -d --build
echo "PEDIDOS360 SETUP OK"
