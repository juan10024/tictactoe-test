# backend/Dockerfile
# This Dockerfile constructs a lean, production-ready Docker image for the Go backend.
# It uses a multi-stage build process to compile the application in a build environment
# and then copies the static binary to a minimal 'scratch' image, resulting in a
# highly optimized and secure final image.

# --- Build Stage ---
# Use the official Go image as a build environment. The version is pinned for reproducibility.
FROM golang:1.21-alpine AS builder

# Set the working directory inside the container.
WORKDIR /app

# Install necessary build tools. git is needed for fetching Go modules.
RUN apk --no-cache add git ca-certificates

# Copy dependency management files.
COPY go.mod go.sum ./

# Download Go module dependencies. This layer is cached by Docker if the files don't change.
RUN go mod download

# Copy the entire source code into the container.
COPY . .

# Compile the application.
# - CGO_ENABLED=0 creates a statically-linked binary.
# - -ldflags="-s -w" strips debugging information, reducing binary size.
# - -o /app/server creates the output binary named 'server'.
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server .

# --- Final Stage ---
# Use a 'scratch' image which is the smallest possible image, containing nothing.
# This is ideal for single, static binaries and enhances security by minimizing attack surface.
FROM scratch

# Copy the compiled binary and SSL certificates from the builder stage.
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/server /server

# Expose the port the application will run on.
EXPOSE 8080

# Set the command to run the application when the container starts.
ENTRYPOINT ["/server"]

