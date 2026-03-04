// Test endpoints with proper authentication
// use backend port for testing
const baseUrl = 'http://localhost:3005/api/v1';

async function login() {
  try {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@eduvertex.com',
        password: 'Admin@123'
      })
    });
    
    const data = await res.json();
    if (data.success && data.data.token) {
      return data.data.token;
    }
    console.error('Login failed:', data);
    return null;
  } catch (err) {
    console.error('Login error:', err);
    return null;
  }
}

async function testEndpoint(name, url, token) {
  try {
    console.log(`\n🔍 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`   Status: ${res.status}`);
    const text = await res.text();
    
    if (res.status !== 200) {
      console.log(`   ❌ Error Response:`, text.substring(0, 300));
    } else {
      console.log(`   ✅ Success. Data length: ${text.length}`);
      try {
        const json = JSON.parse(text);
        if (json.data && Array.isArray(json.data)) {
          console.log(`   Data count: ${json.data.length}`);
        }
      } catch (e) {}
    }
  } catch (err) {
    console.error(`   ❌ Error:`, err.message);
  }
}

(async () => {
  console.log('=== TESTING ENDPOINTS WITH AUTHENTICATION ===\n');
  
  console.log('🔓 Logging in...');
  const token = await login();
  
  if (!token) {
    console.error('Failed to get authentication token. Skipping endpoint tests.');
    return;
  }
  
  console.log('✅ Authentication successful\n');
  
  await testEndpoint('GET /students', `${baseUrl}/students`, token);
  await testEndpoint('GET /departments', `${baseUrl}/departments`, token);
  await testEndpoint('GET /faculty', `${baseUrl}/faculty`, token);
  
  console.log('\n✅ Test complete');
})();
