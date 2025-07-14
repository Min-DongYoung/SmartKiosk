module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: { '^/api': '/api' },
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: { '^/uploads': '/uploads' },
      },
    },
  },
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
};