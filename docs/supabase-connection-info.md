# Supabase Connection Information

## Connection Options

### Primary Database (Direct Connection)

- **Description**: Ideal for applications with persistent, long-lived connections, such as those running on virtual machines or long-standing containers.
- **URI**: `postgresql://postgres:[YOUR-PASSWORD]@db.eutwrybevqvatgecsypw.supabase.co:5432/postgres`
- **Notes**:

  - Suitable for long-lived, persistent connections
  - Each client has a dedicated connection to Postgres
  - Not IPv4 compatible
  - Use Session Pooler if on a IPv4 network or purchase IPv4 add-on

### Transaction Pooler (Shared Pooler)

- **Description**: Ideal for stateless applications like serverless functions where each interaction with Postgres is brief and isolated.
- **URI**: `postgresql://postgres.eutwrybevqvatgecsypw:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
- **Notes**:

  - Does not support PREPARE statements
  - Suitable for a large number of connected clients
  - Pre-warmed connection pool to Postgres
  - IPv4 compatible
  - Transaction pooler connections are IPv4 proxied for free

### Session Pooler (Shared Pooler)

- **Description**: Only recommended as an alternative to Direct Connection, when connecting via an IPv4 network.
- **URI**: `postgresql://postgres.eutwrybevqvatgecsypw:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`
- **Notes**:

  - IPv4 compatible
  - Session pooler connections are IPv4 proxied for free
  - Only use on a IPv4 network
  - Use Direct Connection if connecting via an IPv6 network
