export async function ready() {
  return {
    status: 200,
    body: {
      status: 'ready'
    }
  };
}