// Script para limpiar los datos del formulario
// Ejecuta esto en la consola del navegador (F12 > Console)

console.log('🧹 Limpiando datos del formulario...');

// Obtener el cliente ID
const clienteId = localStorage.getItem('tuinity_cliente_id');

if (clienteId) {
  // Limpiar datos específicos del formulario
  localStorage.removeItem(`mi_negocio_data_${clienteId}`);
  console.log(`✅ Datos del formulario limpiados para cliente ${clienteId}`);
} else {
  console.log('⚠️ No se encontró cliente ID');
}

// Si quieres limpiar TODOS los datos (incluyendo el cliente ID):
// localStorage.clear();
// console.log('✅ Todo el localStorage ha sido limpiado');

console.log('✨ Recarga la página para ver los cambios (F5 o Ctrl+R)');
