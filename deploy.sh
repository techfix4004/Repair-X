#!/bin/bash
set -euo pipefail

# RepairX Production Deployment Script
# This script deploys RepairX to production with comprehensive validation

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$SCRIPT_DIR"
ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env.prod}"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_ROOT/docker-compose.prod.yml}"
readonly LOG_FILE="$PROJECT_ROOT/deployment-$(date +%Y%m%d_%H%M%S).log"

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Logging functions
log() {
    echo -e "${1}" | tee -a "$LOG_FILE"
}

log_info() {
    log "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    log "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    log "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    log "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Script failed on line $line_number with exit code $exit_code"
    log_error "Check log file: $LOG_FILE"
    exit $exit_code
}

trap 'handle_error $LINENO' ERR

# Help function
show_help() {
    cat << EOF
RepairX Production Deployment Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --env-file FILE     Use custom environment file (default: .env.prod)
    --dry-run           Show what would be deployed without executing
    --skip-build        Skip building images (use existing)
    --help              Show this help message

EXAMPLES:
    $0                              # Deploy using .env.prod
    $0 --env-file .env.staging      # Deploy using custom env file
    $0 --dry-run                    # Preview deployment
    $0 --skip-build                 # Deploy without rebuilding images

EOF
}

# Parse command line arguments
DRY_RUN=false
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --env-file)
            ENV_FILE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main deployment function
main() {
    log_info "Starting RepairX production deployment"
    log_info "Environment file: $ENV_FILE"
    log_info "Compose file: $COMPOSE_FILE"
    log_info "Log file: $LOG_FILE"
    
    # Validate prerequisites
    check_dependencies
    validate_environment
    load_environment_variables
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN MODE - No changes will be made"
        show_deployment_plan
        exit 0
    fi
    
    # Build and deploy
    if [[ "$SKIP_BUILD" != "true" ]]; then
        build_applications
    fi
    
    run_database_migrations
    deploy_services
    run_health_checks
    
    log_success "🎉 RepairX production deployment completed successfully!"
    show_deployment_summary
}

# Check required dependencies
check_dependencies() {
    log_info "Checking system dependencies..."
    local dependencies=("docker" "curl")
    local missing_deps=()
    
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    # Check for docker compose (v2) or docker-compose (v1)
    if ! command -v "docker" &> /dev/null; then
        missing_deps+=("docker")
    elif ! docker compose version &> /dev/null && ! docker-compose --version &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_error "Please install missing dependencies and try again"
        exit 1
    fi
    
    log_success "All dependencies are available"
}

# Validate deployment environment
validate_environment() {
    log_info "Validating deployment environment..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file not found: $ENV_FILE"
        log_error "Please create the environment file or specify a different one with --env-file"
        exit 1
    fi
    
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        log_error "Docker compose file not found: $COMPOSE_FILE"
        exit 1
    fi
    
    # Validate docker compose file syntax
    if ! docker compose -f "$COMPOSE_FILE" config > /dev/null 2>&1; then
        log_error "Invalid docker-compose configuration"
        exit 1
    fi
    
    log_success "Environment validation passed"
}

# Load environment variables
load_environment_variables() {
    log_info "Loading environment variables from $ENV_FILE"
    
    # Source environment file
    set -a  # automatically export all variables
    source "$ENV_FILE"
    set +a
    
    # Validate required environment variables
    local required_vars=("POSTGRES_DB" "POSTGRES_USER" "POSTGRES_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi
    
    log_success "Environment variables loaded successfully"
}

# Build applications
build_applications() {
    log_info "Building application images..."
    
    # Build images with docker compose (prefer v2)
    if docker compose version &> /dev/null; then
        docker compose -f "$COMPOSE_FILE" build --no-cache --parallel || {
            log_error "Failed to build application images"
            exit 1
        }
    else
        docker-compose -f "$COMPOSE_FILE" build --no-cache || {
            log_error "Failed to build application images (docker-compose v1)"
            exit 1
        }
    fi
    
    log_success "Application images built successfully"
}

# Run database migrations
run_database_migrations() {
    log_info "Running database migrations..."
    
    # Start only postgres and redis temporarily for migrations
    if docker compose version &> /dev/null; then
        docker compose -f "$COMPOSE_FILE" up -d postgres redis
    else
        docker-compose -f "$COMPOSE_FILE" up -d postgres redis
    fi
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=0
    
    while ! (docker compose version &> /dev/null && docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" > /dev/null 2>&1) && \
          ! (docker-compose --version &> /dev/null && docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" > /dev/null 2>&1); do
        attempt=$((attempt + 1))
        if [[ $attempt -ge $max_attempts ]]; then
            log_error "Database failed to become ready within expected time"
            exit 1
        fi
        sleep 2
    done
    
    # Run migrations using backend container
    log_info "Executing database migrations..."
    if docker compose version &> /dev/null; then
        docker compose -f "$COMPOSE_FILE" run --rm backend sh -c "npm run prisma:migrate:deploy" || {
            log_error "Database migration failed"
            exit 1
        }
    else
        docker-compose -f "$COMPOSE_FILE" run --rm backend sh -c "npm run prisma:migrate:deploy" || {
            log_error "Database migration failed (docker-compose v1)"
            exit 1
        }
    fi
    
    log_success "Database migrations completed successfully"
}

# Deploy all services
deploy_services() {
    log_info "Deploying production services..."
    
    # Stop existing services
    if docker compose version &> /dev/null; then
        docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans || true
        docker compose -f "$COMPOSE_FILE" up -d || {
            log_error "Failed to start services"
            exit 1
        }
    else
        docker-compose -f "$COMPOSE_FILE" down --volumes --remove-orphans || true
        docker-compose -f "$COMPOSE_FILE" up -d || {
            log_error "Failed to start services (docker-compose v1)"
            exit 1
        }
    fi
    
    # Wait for services to be ready
    log_info "Waiting for services to initialize..."
    sleep 60
    
    log_success "Services deployed successfully"
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Check backend health
    local backend_health_url="http://localhost:3001/health"
    local max_attempts=10
    local attempt=0
    
    while ! curl -f "$backend_health_url" > /dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [[ $attempt -ge $max_attempts ]]; then
            log_warning "Backend health check failed - service may still be starting"
            break
        fi
        sleep 5
    done
    
    if curl -f "$backend_health_url" > /dev/null 2>&1; then
        log_success "Backend health check passed"
    else
        log_warning "Backend health check failed - manual verification needed"
    fi
    
    # Check service containers status
    local services=("repairx-postgres-prod" "repairx-redis-prod" "repairx-backend-prod" "repairx-frontend-prod" "repairx-nginx-prod")
    for service in "${services[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "$service"; then
            log_success "Service $service is running"
        else
            log_error "Service $service is not running"
            exit 1
        fi
    done
    
    log_success "Health checks completed"
}

# Show deployment plan for dry run
show_deployment_plan() {
    log_info "=== DEPLOYMENT PLAN ==="
    log_info "Environment file: $ENV_FILE"
    log_info "Services to be deployed:"
    if docker compose version &> /dev/null; then
        docker compose -f "$COMPOSE_FILE" config --services | while read -r service; do
            log_info "  - $service"
        done
        log_info "Ports to be exposed:"
        docker compose -f "$COMPOSE_FILE" config | grep -A 1 "ports:" | grep -E "^\s*-" | sed 's/^[[:space:]]*//' | while read -r port; do
            log_info "  - $port"
        done
    else
        docker-compose -f "$COMPOSE_FILE" config --services | while read -r service; do
            log_info "  - $service"
        done
        log_info "Ports to be exposed:"
        docker-compose -f "$COMPOSE_FILE" config | grep -A 1 "ports:" | grep -E "^\s*-" | sed 's/^[[:space:]]*//' | while read -r port; do
            log_info "  - $port"
        done
    fi
}

# Show deployment summary
show_deployment_summary() {
    log_info "=== DEPLOYMENT SUMMARY ==="
    log_info "Deployment completed at: $(date)"
    log_info "Services running:"
    if docker compose version &> /dev/null; then
        docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    else
        docker-compose -f "$COMPOSE_FILE" ps
    fi
    
    log_info ""
    log_info "🌐 Application URLs:"
    log_info "   • Frontend: http://localhost (via Nginx)"
    log_info "   • Backend API: http://localhost:3001"
    log_info "   • Grafana Dashboard: http://localhost:3002"
    log_info "   • Prometheus Metrics: http://localhost:9090"
    log_info "   • Jaeger Tracing: http://localhost:16686"
    
    log_info ""
    log_info "📊 Monitoring & Logs:"
    log_info "   • View logs: docker compose -f $COMPOSE_FILE logs [service]"
    log_info "   • Check status: docker compose -f $COMPOSE_FILE ps"
    log_info "   • Stop services: docker compose -f $COMPOSE_FILE down"
    
    log_info ""
    log_info "📝 Next Steps:"
    log_info "   1. Verify all services are healthy via monitoring dashboards"
    log_info "   2. Run end-to-end tests against the deployed application"
    log_info "   3. Update DNS/load balancer to point to this deployment"
    log_info "   4. Monitor application metrics and logs"
}

# Execute main function
main "$@"
