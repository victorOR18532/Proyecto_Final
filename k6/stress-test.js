import http from 'k6/http';
import { check, sleep } from 'k6';
export let options = {
  vus: 50,
  duration: '30s'
};

export default function () {
  const payload = JSON.stringify({
    title: `Test ${__VU}-${Date.now()}`,
    content: "Prueba de carga",
    sport: "surf"
  });

  const headers = { 'Content-Type': 'application/json' };
  const res = http.post('http://localhost:8080/notes', payload, { headers });
  check(res, {
    'status 201': (r) => r.status === 201
  });
  sleep(0.1);
}
