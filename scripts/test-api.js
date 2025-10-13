const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing Campus Virtual API...');
    
    // Test root endpoint
    console.log('\n1. Testing root endpoint...');
    const rootResponse = await axios.get('http://localhost:3000/');
    console.log('Root endpoint response:', rootResponse.data);
    
    // Test login
    console.log('\n2. Testing login endpoint...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@campus.com',
      password: 'admin123'
    });
    console.log('Login successful!');
    console.log('Token:', loginResponse.data.token ? 'Received' : 'Not received');
    
    // Test careers endpoint with authentication
    console.log('\n3. Testing careers endpoint...');
    const careersResponse = await axios.get('http://localhost:3000/api/admin/carreras', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    console.log('Careers endpoint response:', careersResponse.data);
    
    // Test new endpoints for cleaning inscriptions
    console.log('\n4. Testing new inscription cleaning endpoints...');
    // First, let's get subjects for a career to find a subject ID
    const materiasResponse = await axios.get('http://localhost:3000/api/admin/carreras/1/materias', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    console.log('Materias for career 1:', materiasResponse.data.materias.length, 'found');
    
    if (materiasResponse.data.materias.length > 0) {
      const firstMateria = materiasResponse.data.materias[0];
      console.log('Testing with materia ID:', firstMateria.id_materia);
      
      // Test the clean inscriptions endpoint (this will archive current inscriptions)
      console.log('\n5. Testing clean inscriptions endpoint...');
      const cleanResponse = await axios.post(`http://localhost:3000/api/admin/materias/${firstMateria.id_materia}/limpiar-inscripciones`, {}, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      console.log('Clean inscriptions response:', cleanResponse.data);
      
      // Test the archived inscriptions endpoint
      console.log('\n6. Testing archived inscriptions endpoint...');
      const archivedResponse = await axios.get(`http://localhost:3000/api/admin/materias/${firstMateria.id_materia}/inscripciones-archivadas`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      console.log('Archived inscriptions response:', archivedResponse.data);
    }
    
    console.log('\nAll tests completed successfully!');
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAPI();