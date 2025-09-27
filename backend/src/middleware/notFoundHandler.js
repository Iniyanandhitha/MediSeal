/**
 * 404 Not Found handler middleware
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    availableRoutes: {
      auth: '/api/auth',
      batches: '/api/batches',
      stakeholders: '/api/stakeholders',
      ipfs: '/api/ipfs',
      qr: '/api/qr',
      ai: '/api/ai',
      docs: '/api-docs'
    }
  })
}

export default notFoundHandler