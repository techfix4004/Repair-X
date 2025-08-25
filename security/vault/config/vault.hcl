# Vault configuration for RepairX secrets management
ui = true
api_addr = "http://0.0.0.0:8200"
cluster_addr = "https://0.0.0.0:8201"

storage "file" {
  path = "/vault/data"
}

listener "tcp" {
  address = "0.0.0.0:8200"
  tls_disable = true  # In production, use TLS
}

# Enable audit logging
audit {
  file {
    type = "file"
    options {
      file_path = "/vault/audit.log"
    }
  }
}