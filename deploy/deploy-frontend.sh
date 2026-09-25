#!/bin/bash
# Compila el frontend Angular y lo publica en AWS Amplify Hosting (despliegue manual con zip).
# Uso (Git Bash, desde la raíz del repo):  bash deploy/deploy-frontend.sh
# Requiere AWS CLI configurado (credenciales de AWS Academy) y la app de Amplify ya creada.
set -euo pipefail

APP_ID="${AMPLIFY_APP_ID:-d234hgmhx67wa2}"
BRANCH="main"
DIST="frontend-pedidos360/dist/frontend-pedidos360/browser"
ZIP="$(mktemp -d)/frontend.zip"

(cd frontend-pedidos360 && npx ng build --configuration production)

# Zip plano (sin prefijo ./): Amplify no encuentra index.html si las rutas empiezan con ./
(cd "$DIST" && tar -a -c -f "$ZIP" * 2>/dev/null || zip -qr "$ZIP" .)

read -r JOB URL < <(aws amplify create-deployment --app-id "$APP_ID" --branch-name "$BRANCH" \
  --query '[jobId,zipUploadUrl]' --output text)
curl -sf -X PUT -H "Content-Type: application/zip" --upload-file "$ZIP" "$URL"
aws amplify start-deployment --app-id "$APP_ID" --branch-name "$BRANCH" --job-id "$JOB" > /dev/null

until STATUS=$(aws amplify get-job --app-id "$APP_ID" --branch-name "$BRANCH" --job-id "$JOB" \
  --query 'job.summary.status' --output text); [ "$STATUS" = SUCCEED ] || [ "$STATUS" = FAILED ]; do
  sleep 5
done
echo "Despliegue $JOB: $STATUS -> https://$BRANCH.$APP_ID.amplifyapp.com"
