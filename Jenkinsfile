pipeline {
    agent any

    environment {
        POSTGRES_IMAGE = 'postgres:16-alpine'
        NODE_IMAGE = 'node:20'
    }

    stages {
        stage('Verificar Entorno') {
            steps {
                echo '=== Verificando dependencias en el Host ==='
                sh 'docker --version'
                sh 'docker compose version || docker-compose version'
            }
        }

        stage('Instalar Dependencias') {
            steps {
                echo '=== Instalando dependencias de Node.js ==='
                sh """
                docker run --rm \
                  -v \$(pwd):/app \
                  -w /app \
                  ${NODE_IMAGE} \
                  npm install
                """
            }
        }

        stage('Validate Web') {
            steps {
                echo '=== Ejecutando Lint, Build y Test para el Frontend ==='
                sh """
                docker run --rm \
                  -v \$(pwd):/app \
                  -w /app \
                  ${NODE_IMAGE} \
                  sh -c "npm run build --workspace apps/web && npm run test --workspace apps/web"
                """
            }
        }

        stage('Validate API') {
            steps {
                echo '=== Preparando Base de Datos para Pruebas de API ==='
                sh "docker network create dino-net-${BUILD_NUMBER}"
                sh "docker run -d --name dino-postgres-${BUILD_NUMBER} --network dino-net-${BUILD_NUMBER} -e POSTGRES_USER=dino -e POSTGRES_PASSWORD=dino -e POSTGRES_DB=dino_test ${POSTGRES_IMAGE}"
                
                echo '=== Esperando a que PostgreSQL esté listo ==='
                sh """
                timeout=30
                while [ \$timeout -gt 0 ]; do
                    if docker run --rm --network dino-net-${BUILD_NUMBER} ${POSTGRES_IMAGE} pg_isready -h dino-postgres-${BUILD_NUMBER} -U dino -d dino_test; then
                        echo "PostgreSQL está listo."
                        break
                    fi
                    echo "Esperando a PostgreSQL..."
                    sleep 2
                    timeout=\$((\$timeout - 2))
                done
                if [ \$timeout -le 0 ]; then
                    echo "Error: Tiempo de espera agotado para PostgreSQL"
                    exit 1
                fi
                """

                echo '=== Ejecutando Migraciones, Build y Test para la API ==='
                sh """
                docker run --rm \
                  --network dino-net-${BUILD_NUMBER} \
                  -v \$(pwd):/app \
                  -w /app \
                  -e DATABASE_URL=postgresql://dino:dino@dino-postgres-${BUILD_NUMBER}:5432/dino_test \
                  -e NODE_ENV=test \
                  -e APP_ENV=dev \
                  -e API_PORT=3001 \
                  -e CORS_ORIGIN=http://localhost:5173 \
                  ${NODE_IMAGE} \
                  sh -c "npm run prisma:generate && npm run prisma:deploy && npx prisma migrate status && npm run build --workspace apps/api && npm run test --workspace apps/api"
                """
            }
            post {
                always {
                    echo '=== Limpiando Base de Datos y Red de Pruebas ==='
                    sh "docker rm -f dino-postgres-${BUILD_NUMBER} || true"
                    sh "docker network rm dino-net-${BUILD_NUMBER} || true"
                }
            }
        }

        stage('E2E Tests') {
            steps {
                echo '=== Ejecutando pruebas E2E con Playwright ==='
                sh """
                docker run --rm \
                  -v \$(pwd):/app \
                  -w /app \
                  -e CI=true \
                  ${NODE_IMAGE} \
                  sh -c "npm run e2e:install && npm run e2e"
                """
            }
        }
    }

    post {
        always {
            echo '=== Limpiando el Workspace de Jenkins ==='
            cleanWs()
        }
        success {
            echo '¡El pipeline de integración continua finalizó exitosamente!'
        }
        failure {
            echo 'El pipeline ha fallado. Por favor, revisa el log de la consola para más detalles.'
        }
    }
}
