export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Wardrobe IQ API",
    version: "0.1.0",
    description: "Phase 1 MVP REST API. Recommendation and chat surfaces are AI-ready placeholders."
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/register": { post: { summary: "Register a user", security: [] } },
    "/auth/login": { post: { summary: "Log in", security: [] } },
    "/auth/refresh": { post: { summary: "Refresh access token", security: [] } },
    "/auth/forgot-password": { post: { summary: "Request password reset", security: [] } },
    "/auth/reset-password": { post: { summary: "Reset password", security: [] } },
    "/users/me": { get: { summary: "Get profile" }, patch: { summary: "Update profile" } },
    "/users/me/preferences": { patch: { summary: "Update preferences" } },
    "/wardrobe": { get: { summary: "List wardrobe items" }, post: { summary: "Create clothing item" } },
    "/wardrobe/{id}": { get: { summary: "Get clothing item" }, patch: { summary: "Update clothing item" }, delete: { summary: "Delete clothing item" } },
    "/outfits": { get: { summary: "List outfits" }, post: { summary: "Create outfit" } },
    "/outfits/{id}": { get: { summary: "Get outfit" }, patch: { summary: "Update outfit" }, delete: { summary: "Delete outfit" } },
    "/recommendations/outfits": { get: { summary: "Get mock outfit suggestions" } },
    "/feedback": { post: { summary: "Store outfit feedback" } },
    "/analytics/wardrobe": { get: { summary: "Get wardrobe analytics" } },
    "/uploads/image": { post: { summary: "Upload an image to Cloudinary" } }
  }
};
