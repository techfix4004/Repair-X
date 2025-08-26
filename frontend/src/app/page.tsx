export default function Home() {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <header style={{ 
        backgroundColor: '#2196F3', 
        color: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>🔧 RepairX</h1>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem' }}>
          Production-Ready Repair Service Platform
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2196F3', margin: '0 0 1rem 0' }}>👤 Customer Portal</h3>
          <p>Book repairs, track job status, manage payments, and communicate with technicians.</p>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li>Service booking and scheduling</li>
            <li>Real-time job tracking</li>
            <li>Payment processing</li>
            <li>Communication hub</li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2196F3', margin: '0 0 1rem 0' }}>🔧 Technician Mobile</h3>
          <p>Mobile-first interface for field operations, job management, and customer interaction.</p>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li>Job assignment and routing</li>
            <li>Digital job sheets</li>
            <li>Parts inventory management</li>
            <li>Photo documentation</li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2196F3', margin: '0 0 1rem 0' }}>🏢 Business Management</h3>
          <p>Comprehensive admin dashboard for business operations and analytics.</p>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li>Employee management</li>
            <li>Financial reporting</li>
            <li>Customer analytics</li>
            <li>Quality metrics</li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2196F3', margin: '0 0 1rem 0' }}>🏗️ SaaS Admin</h3>
          <p>Multi-tenant management platform for enterprise deployments.</p>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li>Multi-tenant management</li>
            <li>Subscription billing</li>
            <li>Platform analytics</li>
            <li>White-label configuration</li>
          </ul>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#2196F3', margin: '0 0 1rem 0' }}>🚀 Production Status</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#4CAF50' }}>✅</div>
            <div style={{ fontWeight: 'bold' }}>Backend API</div>
            <div style={{ color: '#666' }}>Operational</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#4CAF50' }}>✅</div>
            <div style={{ fontWeight: 'bold' }}>Database</div>
            <div style={{ color: '#666' }}>PostgreSQL Ready</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#4CAF50' }}>✅</div>
            <div style={{ fontWeight: 'bold' }}>Cache</div>
            <div style={{ color: '#666' }}>Redis Active</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#4CAF50' }}>✅</div>
            <div style={{ fontWeight: 'bold' }}>Local Storage</div>
            <div style={{ color: '#666' }}>Secure & Encrypted</div>
          </div>
        </div>
      </div>

      <footer style={{ 
        textAlign: 'center', 
        marginTop: '2rem', 
        padding: '1rem',
        color: '#666'
      }}>
        <p>RepairX Enterprise Platform v1.0.0 | Production Deployment Complete</p>
        <p>
          <a href="/api/health" style={{ color: '#2196F3', textDecoration: 'none' }}>
            API Health Check
          </a>
          {' | '}
          <a href="http://localhost:3010/health" style={{ color: '#2196F3', textDecoration: 'none' }}>
            Backend Health
          </a>
        </p>
      </footer>
    </div>
  );
}
