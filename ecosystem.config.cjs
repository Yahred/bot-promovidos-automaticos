module.exports = {
  apps: [
    {
      name: "Bot-Promovidos-Automaticos",
      script: "./src/index.js",
      autorestart: true,
      max_memory_restart: "2G",
      instances: 1,
      exec_mode: "fork",

      node_args : '-r dotenv/config',
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      log_type: "json",

      max_restarts: 1,
      restart_delay: 0,
      max_restarts: 100000, 
      min_uptime: 1000, 

      restart_when_exit: true, 
      exp_backoff_restart_delay: 0,
    },
  ],
};
