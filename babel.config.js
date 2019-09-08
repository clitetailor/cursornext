module.exports = function(api) {
  const prod = process.env.NODE_ENV === 'production'

  api.cache(!prod)

  const presets = [
    '@babel/preset-env',
    '@babel/preset-typescript'
  ]

  return {
    presets
  }
}
