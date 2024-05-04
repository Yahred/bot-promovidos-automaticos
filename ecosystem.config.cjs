module.exports = {
  apps: [
    {
      name: "distrito_14",
      script: "./distrito_14.js",
      watch: false,
      ignore_watch: ["node_modules", "*.log"],
      autorestart: true,
      max_memory_restart: "2G",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: "./logs/14/err.log",
      out_file: "./logs/14/out.log",
      log_file: "./logs/14/combined.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      log_type: "json",
      // Configuración para reiniciar en caso de excepciones no controladas
      restart_delay: 0, // retraso en ms antes de volver a intentar reiniciar (predeterminado 0)
      max_restarts: 100000, // cantidad máxima de reinicios en un período de tiempo (default 15)
      min_uptime: 10000, // tiempo mínimo en ms para considerar que el proceso está estable (default 1000)

      restart_when_exit: true, // false: no reiniciar el proceso cuando se detiene (default true)
      exp_backoff_restart_delay: 0, // retraso exponencial entre los reinicios (default 100)
    },
    {
      name: "distrito_11",
      script: "./distrito_11.js",
      watch: false,
      ignore_watch: ["node_modules", "*.log"],
      autorestart: true,
      max_memory_restart: "2G",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: "./logs/11/err.log",
      out_file: "./logs/11/out.log",
      log_file: "./logs/11/combined.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      log_type: "json",
      // Configuración para reiniciar en caso de excepciones no controladas
      restart_delay: 0, // retraso en ms antes de volver a intentar reiniciar (predeterminado 0)
      max_restarts: 100000, // cantidad máxima de reinicios en un período de tiempo (default 15)
      min_uptime: 10000, // tiempo mínimo en ms para considerar que el proceso está estable (default 1000)

      restart_when_exit: true, // false: no reiniciar el proceso cuando se detiene (default true)
      exp_backoff_restart_delay: 0, // retraso exponencial entre los reinicios (default 100)
    },
  ],
};
