set -euo pipefail

IMAGE="ghcr.io/constantine950/tradescope"
TAG="${1:-latest}"

docker build --target prod -t "${IMAGE}:${TAG}" .
docker push "${IMAGE}:${TAG}"

echo "Pushed ${IMAGE}:${TAG}"