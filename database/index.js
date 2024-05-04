import mongoose from 'mongoose'

const establacerConexionBaseDeDatos = async () => {
  try {
    const conexion = await mongoose.connect('mongodb://localhost:5000/promovidos');
    console.log('Conexión establecida')    
    return conexion
  } catch (error) {
    console.log(error)
    console.log('Error al establecer la conexión')
    process.exit(1);
  }
}

await establacerConexionBaseDeDatos();
