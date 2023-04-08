function readPackage(pkg, context) {
  if (pkg.name.startsWith('@game-engine/')) {
    pkg.dependencies = {
      ...pkg.dependencies,
      ...pkg.peerDependencies,
    }
  }

  return pkg
}

module.exports = {
  hooks: {
    readPackage,
  },
}
