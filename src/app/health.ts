export async function health() {
  return {
    status: 200,
    body: {
      status: 'ok',
      service: 'catalogue-service'
    }
  };
}
// Demo v3