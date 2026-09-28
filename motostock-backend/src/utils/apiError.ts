export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "ApiError";
  }

  static badRequest(message = "Requisição inválida", details?: unknown) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Não autenticado") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Você não tem permissão para esta ação") {
    return new ApiError(403, message);
  }

  static notFound(message = "Recurso não encontrado") {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflito de dados") {
    return new ApiError(409, message);
  }
}
