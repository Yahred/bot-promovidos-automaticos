import mongoose from 'mongoose'

const establacerConexionBaseDeDatos = async () => {
  try {
    const { MONGO_CNN } = process.env;
    const conexion = await mongoose.connect(MONGO_CNN);
    console.log('Conexión a base de datos establecida')    
    return conexion
  } catch (error) {
    console.log(error)
    console.log('Error al establecer la conexión con la base de datos')
    process.exit(1);
  }
}

await establacerConexionBaseDeDatos();
